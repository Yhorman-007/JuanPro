from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, Sale
from ..services import AlertService

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
    Get sales analysis summary
    """
    sales = db.query(Sale).all()
    
    total_sales = len(sales)
    total_revenue = sum(sale.total for sale in sales)
    total_discount = sum(sale.discount for sale in sales)
    
    payment_methods = {}
    for sale in sales:
        method = sale.payment_method
        payment_methods[method] = payment_methods.get(method, 0) + 1
    
    return {
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "total_discount": round(total_discount, 2),
        "payment_methods": payment_methods,
        "average_sale": round(total_revenue / total_sales, 2) if total_sales > 0 else 0
    }

@router.get("/alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    """
    Get all inventory alerts (low stock + expiring)
    """
    return AlertService.get_all_alerts(db)
