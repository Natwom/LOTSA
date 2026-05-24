import sys
import os

# Add the backend folder to Python path so absolute imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import SessionLocal
from backend.models import User, UserRole
from backend.auth import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@lotsa.com").first()
        if existing:
            print("Admin already exists!")
            return

        admin = User(
            email="admin@lotsa.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("✅ Admin created successfully!")
        print("   Email: admin@lotsa.com")
        print("   Password: admin123")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()