# Import all models here for Alembic to detect them
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.stock_movement import StockMovement
from app.models.user import User
from app.models.audit_log import AuditLog

__all__ = [
    "Product",
    "Sale",
    "SaleItem",
    "Supplier",
    "PurchaseOrder",
    "PurchaseOrderItem",
    "StockMovement",
    "User",
    "AuditLog",
]
