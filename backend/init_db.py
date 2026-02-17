"""
Database initialization script
Creates all tables and optionally seeds initial data
"""
from app.database import engine, Base, SessionLocal
from app.models import User, Product, Supplier
from app.core.security import get_password_hash

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully")
    
    # Create initial admin user
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Creating admin user...")
            admin = User(
                username="admin",
                email="admin@producttracker.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrator",
                is_admin=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("[OK] Admin user created (username: admin, password: admin123)")
        else:
            print("[OK] Admin user already exists")
            
        # Add some sample data
        supplier_count = db.query(Supplier).count()
        if supplier_count == 0:
            print("Adding sample suppliers...")
            suppliers = [
                Supplier(name="FarmaDist", contact_name="Juan Pérez", email="juan@farmadist.com", 
                        phone="555-0001", payment_terms="30 días"),
                Supplier(name="MediSupply", contact_name="María González", email="maria@medisupply.com",
                        phone="555-0002", payment_terms="60 días"),
            ]
            db.add_all(suppliers)
            db.commit()
            print("[OK] Sample suppliers added")
            
        product_count = db.query(Product).count()
        if product_count == 0:
            print("Adding sample products...")
            products = [
                Product(name="Paracetamol 500mg", sku="MED001", category="Medicina", 
                       price_purchase=5.00, price_sale=15.00, unit="caja", 
                       stock=120, min_stock=20, location="Almacén Principal"),
                Product(name="Ibuprofeno 400mg", sku="MED002", category="Medicina",
                       price_purchase=7.00, price_sale=20.00, unit="caja",
                       stock=80, min_stock=15, location="Almacén Principal"),
            ]
            db.add_all(products)
            db.commit()
            print("[OK] Sample products added")
            
        print("\n[OK] Database initialized successfully!")
        print("   Admin credentials: username=admin, password=admin123")
        print("   API running at: http://localhost:8000")
        print("   Docs at: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
