from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Purchase Order Item schemas
class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_cost: float = Field(gt=0)

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    purchase_order_id: int
    
    class Config:
        from_attributes = True

# Purchase Order schemas
class PurchaseOrderBase(BaseModel):
    supplier_id: int
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrder(PurchaseOrderBase):
    id: int
    status: str
    total: float
    created_at: datetime
    received_at: Optional[datetime] = None
    items: List[PurchaseOrderItem] = []
    
    class Config:
        from_attributes = True
