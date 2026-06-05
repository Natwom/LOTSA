from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
import re
import traceback
from datetime import datetime, timedelta

from .database import engine, get_db
from .models import Base, User, UserRole, StudentProfile
from . import schemas, auth as auth_utils

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️ WARNING: Could not create tables: {e}")

# Seed default admin if none exists
def seed_admin():
    db = Session(bind=engine)
    try:
        admin = db.query(User).filter(User.email == "admin@lotsa.ac.ke").first()
        if not admin:
            admin = User(
                email="admin@lotsa.ac.ke",
                password_hash=auth_utils.get_password_hash("Admin@123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created: admin@lotsa.ac.ke / Admin@123")
        else:
            print("ℹ️ Admin user already exists")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Admin seed error: {e}")
    finally:
        db.close()

seed_admin()

app = FastAPI(title="LOTSA CONNECT API", version="2.0.0")

# CORS — allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
from .routers import (
    auth, students, announcements, events, elections, complaints,
    chats, notifications, admin as admin_router, leaders, membership,
    settings as settings_router, terms as terms_router, documents, contributions
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(elections.router, prefix="/api/elections", tags=["elections"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(chats.router, prefix="/api/chats", tags=["chats"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["admin"])
app.include_router(leaders.router, prefix="/api/leaders", tags=["leaders"])
app.include_router(membership.router, prefix="/api/membership", tags=["membership"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["settings"])
app.include_router(terms_router.router, prefix="/api/terms", tags=["terms"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(contributions.router, prefix="/api/contributions", tags=["contributions"])

@app.get("/")
def root():
    return {"message": "LOTSA CONNECT API", "status": "running", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}