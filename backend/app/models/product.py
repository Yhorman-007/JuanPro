from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Product(Base):
    """
    Product model - RF17 (stock mínimo), RF24 (caducidad), RF08 (profit calculation)
    """
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    
    # Prices for profit calculation (RF08)
    price_purchase = Column(Float, nullable=False)  # Costo de compra
    price_sale = Column(Float, nullable=False)      # Precio de venta
    
    unit = Column(String(50), nullable=False)  # unidad, caja, kg, etc.
    
    # Stock management (RF17 - alertas de stock mínimo)
    stock = Column(Integer, nullable=False, default=0)
    min_stock = Column(Integer, nullable=False, default=0)
    
    location = Column(String(255))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    
    # Expiration tracking (RF24 - alertas de caducidad)
    expiration_date = Column(Date, nullable=True)
    
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="product")
