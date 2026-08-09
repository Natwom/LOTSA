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
            print("⚠️ Database columns missing. Run GET /run-migration first.")
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

# ==================== TEMPORARY MIGRATION ENDPOINT ====================
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
    
    db.commit()
    for val in ['patron', 'deputy_patron', 'committee_member']:
        try:
            db.execute(text(f"ALTER TYPE userrole ADD VALUE '{val}';"))
            db.commit()
            results.append(f"✅ Added '{val}' to enum")
        except Exception as e:
            db.rollback()
            results.append(f"ℹ️ '{val}' already in enum")
    
    return {"message": "Migration complete", "details": results}

# ==================== FALLBACK REGISTRATION (bypasses auth.py) ====================
@app.post("/api/auth/register-fallback")
def register_fallback(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    phone_number: Optional[str] = Form(None),
    role: Optional[str] = Form("student"),
    admission_number: Optional[str] = Form(None),
    course: Optional[str] = Form(None),
    year_of_study: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Fallback registration endpoint that accepts form data directly.
    This bypasses auth.py entirely until it deploys correctly.
    """
    print(f"[REGISTER-FALLBACK] email={email}, role={role}")
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    is_student = role == "student"
    
    # Validate student fields
    if is_student:
        if not admission_number:
            raise HTTPException(status_code=400, detail="Admission number is required for students")
        if not re.match(r'^LOTSA 2025(\d{4})$', admission_number):
            raise HTTPException(status_code=400, detail="Admission number format: LOTSA 2025XXXX")
        if len(set(re.match(r'^LOTSA 2025(\d{4})$', admission_number).group(1))) != 4:
            raise HTTPException(status_code=400, detail="The 4 digits must all be different")
        if db.query(StudentProfile).filter(StudentProfile.admission_number == admission_number).first():
            raise HTTPException(status_code=400, detail="Admission number already registered")
    
    # Validate phone
    if phone_number:
        p = phone_number.replace(' ', '')
        if not re.match(r'^254\d{9}$', p):
            raise HTTPException(status_code=400, detail="Phone must be 254XXXXXXXXX")
        if p[3:5] not in ['10','11','12','70','71','72','73','74','79','75','76','77','78']:
            raise HTTPException(status_code=400, detail="Invalid Kenyan mobile prefix")
    
    hashed = auth_utils.get_password_hash(password)
    
    db_user = User(
        email=email,
        password_hash=hashed,
        role=role,
        full_name=full_name,
        phone_number=phone_number,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"[REGISTER-FALLBACK] SUCCESS id={db_user.id}, role={db_user.role}")
    
    if is_student:
        profile = StudentProfile(
            user_id=db_user.id,
            full_name=full_name,
            admission_number=admission_number,
            course=course,
            year_of_study=year_of_study,
            phone_number=phone_number
        )
        db.add(profile)
        db.commit()
    
    result = db.query(User).options(joinedload(User.profile)).filter(User.id == db_user.id).first()
    return result

@app.post("/api/auth/login-fallback")
def login_fallback(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not auth_utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth_utils.create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=expires
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role.value}

@app.get("/api/auth/me-fallback", response_model=schemas.UserOut)
def me_fallback(current_user: User = Depends(auth_utils.get_current_active_user)):
    return current_user

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