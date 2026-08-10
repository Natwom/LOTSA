from fastapi import FastAPI, Depends, HTTPException, WebSocket, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import ProgrammingError
import re
import traceback
import json
from datetime import datetime, timedelta
from typing import Optional

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
            try:
                admin = User(
                    email="admin@lotsa.ac.ke",
                    password_hash=auth_utils.get_password_hash("Admin@123"),
                    role="admin",
                    full_name="System Administrator",
                    phone_number="254700000000",
                    is_active=True
                )
                db.add(admin)
                db.commit()
                print("✅ Default admin created: admin@lotsa.ac.ke / Admin@123")
            except Exception as e:
                db.rollback()
                print(f"⚠️ Could not create admin: {e}")
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
            print("⚠️ Database columns missing. Run GET /run-migration first.")
        else:
            print(f"⚠️ Admin seed error: {e}")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Admin seed error: {e}")
    finally:
        db.close()

seed_admin()

# ===================================================================
# CRITICAL FIX: Rename ALL legacy uppercase enum values to lowercase
# on every startup. If already lowercase, the ALTER fails silently.
# ===================================================================
def migrate_enums():
    db = Session(bind=engine)
    enum_renames = {
        "userrole": [
            ("STUDENT", "student"), ("ADMIN", "admin"), ("LEADER", "leader"),
            ("PATRON", "patron"), ("DEPUTY_PATRON", "deputy_patron"), ("COMMITTEE_MEMBER", "committee_member")
        ],
        "eventcategory": [
            ("MEETING", "meeting"), ("SPORTS", "sports"), ("CULTURAL", "cultural"),
            ("ACADEMIC", "academic"), ("ELECTION", "election")
        ],
        "complaintstatus": [
            ("PENDING", "pending"), ("IN_REVIEW", "in_review"), ("RESOLVED", "resolved")
        ],
        "paymentstatus": [
            ("PENDING", "pending"), ("COMPLETED", "completed"), ("FAILED", "failed")
        ],
        "documenttype": [
            ("CONSTITUTION", "constitution"), ("STUDENT_DATABASE", "student_database"), ("GENERAL", "general")
        ],
    }
    try:
        for enum_name, renames in enum_renames.items():
            for old_val, new_val in renames:
                try:
                    db.execute(text(f"ALTER TYPE {enum_name} RENAME VALUE '{old_val}' TO '{new_val}';"))
                    db.commit()
                    print(f"✅ Renamed {enum_name} '{old_val}' → '{new_val}'")
                except Exception:
                    db.rollback()
    except Exception as e:
        print(f"⚠️ Enum migration error: {e}")
    finally:
        db.close()

migrate_enums()

app = FastAPI(title="LOTSA CONNECT API", version="2.0.0")

# ===================================================================
# FIXED CORS
# ===================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================================================================
# NUCLEAR OVERRIDE: Register endpoint
# ===================================================================
@app.post("/api/auth/register", response_model=schemas.UserOut)
def register_main(user: schemas.RegisterRequest, db: Session = Depends(get_db)):
    print(f"[REGISTER-MAIN] email={user.email}, role_value={user.role.value}")
    
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    role_str = user.role.value
    is_student = role_str == "student"
    
    if is_student:
        if not user.admission_number:
            raise HTTPException(status_code=400, detail="Admission number is required for students")
        if not re.match(r'^LOTSA 2025(\d{4})$', user.admission_number):
            raise HTTPException(status_code=400, detail="Admission number format: LOTSA 2025XXXX")
        if len(set(re.match(r'^LOTSA 2025(\d{4})$', user.admission_number).group(1))) != 4:
            raise HTTPException(status_code=400, detail="The 4 digits must all be different")
        if db.query(StudentProfile).filter(StudentProfile.admission_number == user.admission_number).first():
            raise HTTPException(status_code=400, detail="Admission number already registered")
    
    if user.phone_number:
        p = user.phone_number.replace(' ', '')
        if not re.match(r'^254\d{9}$', p):
            raise HTTPException(status_code=400, detail="Phone must be 254XXXXXXXXX")
        if p[3:5] not in ['10','11','12','70','71','72','73','74','79','75','76','77','78']:
            raise HTTPException(status_code=400, detail="Invalid Kenyan mobile prefix")
    
    hashed = auth_utils.get_password_hash(user.password)
    
    db_user = User(
        email=user.email,
        password_hash=hashed,
        role=role_str,
        full_name=user.full_name,
        phone_number=user.phone_number,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"[REGISTER-MAIN] SUCCESS id={db_user.id}, stored_role={db_user.role}")
    
    if is_student:
        profile = StudentProfile(
            user_id=db_user.id,
            full_name=user.full_name,
            admission_number=user.admission_number,
            course=user.course,
            year_of_study=user.year_of_study,
            phone_number=user.phone_number
        )
        db.add(profile)
        db.commit()
    
    result = db.query(User).options(joinedload(User.profile)).filter(User.id == db_user.id).first()
    return result

# ===================================================================
# Include all routers
# ===================================================================
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

# ==================== MIGRATION ENDPOINT ====================
@app.get("/run-migration")
def run_migration():
    db = next(get_db())
    results = []
    
    for col, col_type in [("full_name", "VARCHAR"), ("phone_number", "VARCHAR")]:
        try:
            db.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type};"))
            db.commit()
            results.append(f"✅ Added {col}")
        except Exception as e:
            db.rollback()
            results.append(f"ℹ️ {col}: already exists")
    
    db.execute(text("""
        UPDATE users SET full_name = COALESCE((SELECT sp.full_name FROM student_profiles sp WHERE sp.user_id = users.id), full_name)
        WHERE full_name IS NULL OR full_name = '';
    """))
    db.execute(text("""
        UPDATE users SET phone_number = COALESCE((SELECT sp.phone_number FROM student_profiles sp WHERE sp.user_id = users.id), phone_number)
        WHERE phone_number IS NULL OR phone_number = '';
    """))
    db.execute(text("UPDATE users SET full_name = 'System Administrator', phone_number = '254700000000' WHERE email = 'admin@lotsa.ac.ke';"))
    db.commit()
    results.append("✅ Backfilled data")
    
    return {"message": "Migration complete", "details": results}

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
                
                sender = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id).first()
                sender_name = sender.profile.full_name if sender and sender.profile else (sender.full_name or sender.email) if sender else "Unknown"
                
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