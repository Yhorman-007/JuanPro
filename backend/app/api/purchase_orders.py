from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..schemas import PurchaseOrder as PurchaseOrderSchema, PurchaseOrderCreate
from ..models import PurchaseOrder, PurchaseOrderItem
from ..services import StockService

router = APIRouter()

@router.get("/", response_model=List[PurchaseOrderSchema])
def get_purchase_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all purchase orders"""
    pos = db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()
    return pos

@router.get("/{po_id}", response_model=PurchaseOrderSchema)
def get_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """Get purchase order by ID"""
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po

@router.post("/", response_model=PurchaseOrderSchema, status_code=status.HTTP_201_CREATED)
def create_purchase_order(po: PurchaseOrderCreate, db: Session = Depends(get_db)):
    """Create new purchase order"""
    # Validar cantidades no negativas
    for item in po.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Las cantidades deben ser mayores a 0")
    # Calculate total
    total = sum(item.quantity * item.unit_cost for item in po.items)
    
    # Create PO
    db_po = PurchaseOrder(
        supplier_id=po.supplier_id,
        total=total,
        notes=po.notes,
        status="pending"
    )
    db.add(db_po)
    db.flush()
    
    # Create PO items
    for item in po.items:
        po_item = PurchaseOrderItem(
            purchase_order_id=db_po.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_cost=item.unit_cost
        )
        db.add(po_item)
    
    db.commit()
    db.refresh(db_po)
    return db_po

@router.patch("/{po_id}/receive", response_model=PurchaseOrderSchema)
def receive_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """
    Mark purchase order as received and update inventory stock
    """
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    if po.status in ("received", "completado"):
        raise HTTPException(status_code=400, detail="Orden ya recibida/completada")
    
    try:
        # Update stock for each item
        for item in po.items:
            StockService.increase_stock(
                db=db,
                product_id=item.product_id,
                quantity=item.quantity,
                reason=f"Orden de compra #{po_id} recibida",
                reference_type="purchase_order",
                reference_id=po_id
            )
        
        # Update PO status to "completado" (received/completed)
        po.status = "completado"
        po.received_at = datetime.now()
        
        db.commit()
        db.refresh(po)
        return po
        
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error receiving order: {str(e)}")


@router.delete("/{po_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """Eliminar orden de compra del historial (solo manualmente por el usuario)"""
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    db.delete(po)
    db.commit()
