from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Product, Sale, SaleItem
from ..services import AlertService
from datetime import date

router = APIRouter()

@router.get("/valuation")
def get_stock_valuation(db: Session = Depends(get_db)):
    """
    Get stock valuation report
    """
    products = db.query(Product).filter(Product.archived == False).all()
    
    valuation_data = []
    total_value = 0
    
    for product in products:
        product_value = product.stock * product.price_purchase
        total_value += product_value
        
        valuation_data.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "category": product.category,
            "stock": product.stock,
            "unit_cost": product.price_purchase,
            "total_value": round(product_value, 2)
        })
    
    return {
        "products": valuation_data,
        "total_inventory_value": round(total_value, 2),
        "total_products": len(valuation_data)
    }

@router.get("/sales-summary")
def get_sales_summary(db: Session = Depends(get_db)):
    """
    Get sales analysis summary.
    total_units_sold = SUM(quantity) de sale_items (unidades vendidas, no registros).
    """
    sales = db.query(Sale).all()
    
    total_sales = len(sales)
    total_revenue = sum(sale.total for sale in sales)
    total_discount = sum(sale.discount for sale in sales)
    
    # SUM(quantity) de sale_items - unidades totales vendidas
    total_units_result = db.query(func.coalesce(func.sum(SaleItem.quantity), 0)).scalar()
    total_units_sold = int(total_units_result) if total_units_result else 0

    # Daily sales
    today = date.today()
    daily_sales = db.query(Sale).filter(func.date(Sale.created_at) == today).all()
    daily_revenue = sum(sale.total for sale in daily_sales)
    
    payment_methods = {}
    for sale in sales:
        method = sale.payment_method
        payment_methods[method] = payment_methods.get(method, 0) + 1
    
    return {
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "daily_revenue": round(daily_revenue, 2),
        "total_discount": round(total_discount, 2),
        "total_units_sold": total_units_sold,
        "payment_methods": payment_methods,
        "average_sale": round(total_revenue / total_sales, 2) if total_sales > 0 else 0
    }

@router.get("/daily-closure")
def get_daily_closure(db: Session = Depends(get_db)):
    """
    Daily closure report (RF10/Cierre de Caja)
    """
    today = date.today()
    sales = db.query(Sale).filter(func.date(Sale.created_at) == today).all()
    
    total_revenue = sum(sale.total for sale in sales)
    total_discount = sum(sale.discount for sale in sales)
    
    methods = {}
    items_count = 0
    
    for sale in sales:
        methods[sale.payment_method] = methods.get(sale.payment_method, 0.0) + sale.total
        items_count += sum(item.quantity for item in sale.items)
        
    return {
        "date": today.isoformat(),
        "total_sales_count": len(sales),
        "total_items_sold": items_count,
        "total_revenue": round(total_revenue, 2),
        "total_discount": round(total_discount, 2),
        "by_payment_method": methods
    }

@router.get("/top-products")
def get_top_products(db: Session = Depends(get_db)):
    """
    Get top 5 products by units sold (quantity).
    """
    results = db.query(
        Product.id,
        Product.name,
        Product.stock,
        func.sum(SaleItem.quantity).label("total_sold")
    ).join(SaleItem, Product.id == SaleItem.product_id) \
     .group_by(Product.id) \
     .order_by(func.sum(SaleItem.quantity).desc()) \
     .limit(5) \
     .all()
    
    top_products = []
    for row in results:
        top_products.append({
            "id": row.id,
            "name": row.name,
            "stock": row.stock,
            "total_sold": int(row.total_sold)
        })
        
    return top_products

@router.get("/alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    """
    Get all inventory alerts (low stock + expiring)
    """
    return AlertService.get_all_alerts(db)
