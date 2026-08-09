from fastapi import FastAPI, Depends, HTTPException, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import ProgrammingError
import re
import traceback
import json
from datetime import datetime, timedelta

from .database import engine, get_db
from .models import Base, User, UserRole, StudentProfile, Conversation, Message
from . import schemas, auth as auth_utils
from .config import SECRET_KEY, ALGORITHM
from .websocket_manager import manager
from jose import jwt as jose_jwt
from sqlalchemy import text

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
                full_name="System Administrator",
                phone_number="254700000000",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created: admin@lotsa.ac.ke / Admin@123")
        else:
            if not admin.full_name:
                admin.full_name = "System Administrator"
                admin.phone_number = admin.phone_number or "254700000000"
                db.commit()
                print("✅ Updated existing admin with full_name")
            else:
                print("ℹ️ Admin user already exists")
    except ProgrammingError as e:
        db.rollback()
        if "full_name" in str(e) or "phone_number" in str(e):
            print("⚠️ Database columns missing. Run GET /run-migration first, then restart.")
        else:
            print(f"⚠️ Admin seed error: {e}")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Admin seed error: {e}")
    finally:
        db.close()

seed_admin()

app = FastAPI(title="LOTSA CONNECT API", version="2.0.0")

# CORS
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

# ==================== TEMPORARY: FIX POSTGRESQL ENUM ====================
# Hit this ONCE after deploying, then delete this code and redeploy
@app.get("/fix-enum")
def fix_enum():
    db = next(get_db())
    db.commit()  # close any open transaction
    
    try:
        db.execute(text("ALTER TYPE userrole ADD VALUE 'patron';"))
        db.commit()
        print("✅ Added 'patron'")
    except Exception as e:
        db.rollback()
        print(f"ℹ️ patron: {e}")
    
    try:
        db.execute(text("ALTER TYPE userrole ADD VALUE 'deputy_patron';"))
        db.commit()
        print("✅ Added 'deputy_patron'")
    except Exception as e:
        db.rollback()
        print(f"ℹ️ deputy_patron: {e}")
    
    try:
        db.execute(text("ALTER TYPE userrole ADD VALUE 'committee_member';"))
        db.commit()
        print("✅ Added 'committee_member'")
    except Exception as e:
        db.rollback()
        print(f"ℹ️ committee_member: {e}")
    
    return {"message": "Enum updated. Delete this endpoint now."}

# ==================== WEBSOCKET ====================
@app.websocket("/api/chats/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    db = Session(bind=engine)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "send_message":
                conv_id = msg.get("conversation_id")
                content = msg.get("content")
                
                db_msg = Message(conversation_id=conv_id, sender_id=user_id, content=content)
                db.add(db_msg)
                db.commit()
                db.refresh(db_msg)
                
                sender = db.query(User).options(
                    joinedload(User.profile)
                ).filter(User.id == user_id).first()
                
                sender_name = "Unknown"
                if sender:
                    if sender.profile and sender.profile.full_name:
                        sender_name = sender.profile.full_name
                    elif sender.full_name:
                        sender_name = sender.full_name
                    elif sender.email:
                        sender_name = sender.email
                
                conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
                if conv:
                    pids = [p.id for p in conv.participants]
                    await manager.broadcast({
                        "type": "message",
                        "payload": {
                            "id": db_msg.id,
                            "conversation_id": conv_id,
                            "sender_id": user_id,
                            "sender_name": sender_name,
                            "content": content,
                            "created_at": db_msg.created_at.isoformat() if db_msg.created_at else None
                        }
                    }, pids)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(user_id)
        db.close()

@app.get("/")
def root():
    return {"message": "LOTSA CONNECT API", "status": "running", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}