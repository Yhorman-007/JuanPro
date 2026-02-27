from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..schemas import Product as ProductSchema, ProductCreate, ProductUpdate
from ..models import Product, User
from ..services import AlertService
from .deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def get_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    low_stock: Optional[bool] = False
):
    """
    Retrieve products with filters (RF04, RF03)
    """
    query = db.query(Product).filter(Product.archived == False)
    
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.sku.ilike(f"%{search}%"))
        )
    
    if category:
        query = query.filter(Product.category == category)
        
    if low_stock:
        query = query.filter(Product.stock <= Product.min_stock)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product by ID (RF02)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create new product (RF03)
    """
    # Check if SKU already exists
    existing = db.query(Product).filter(Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product with SKU {product.sku} already exists")
    
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductSchema)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update product (RF04)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete product (RF05)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    try:
        db.delete(product)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar el producto porque tiene historial (ventas o movimientos). Te recomendamos archivarlo en su lugar."
        )
    return None

@router.patch("/{product_id}/archive", response_model=ProductSchema)
def archive_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Archive/unarchive product (RF06)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.archived = not product.archived
    db.commit()
    db.refresh(product)
    return product

@router.get("/alerts/low-stock", response_model=List[dict])
def get_low_stock_alerts(db: Session = Depends(get_db)):
    """
    Get low stock alerts (RF17)
    """
    return AlertService.get_low_stock_alerts(db)

@router.get("/alerts/expiring", response_model=List[dict])
def get_expiring_products(days: int = 30, db: Session = Depends(get_db)):
    """
    Get products expiring soon (RF24)
    """
    return AlertService.get_expiring_products(db, days)
