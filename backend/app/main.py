from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Cargar variables de entorno explícitamente al inicio
load_dotenv()

from .config import settings
from .database import engine, Base
from .models import *  # Import all models

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Product Tracker API",
    description="API para gestión de inventario, ventas y proveedores",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Product Tracker API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Import and include routers
from .api import auth, users, products, sales, suppliers, purchase_orders, reports, stock_movements

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(stock_movements.router, prefix="/api/stock-movements", tags=["stock-movements"])
app.include_router(sales.router, prefix="/api/sales", tags=["sales"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["suppliers"])
app.include_router(purchase_orders.router, prefix="/api/purchase-orders", tags=["purchase-orders"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

