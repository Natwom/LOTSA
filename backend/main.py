from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from passlib.context import CryptContext
import re
import traceback
from datetime import timedelta

from .database import engine, get_db
from .models import Base, User, UserRole, StudentProfile
from . import schemas, auth as auth_utils
from .routers import students, announcements, events, elections, complaints, chats, notifications, admin as admin_router, leaders, membership, settings as settings_router, terms as terms_router, documents, contributions

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️ WARNING: Could not create tables: {e}")

app = FastAPI(title="LOTSA CONNECT API", version="2.0.0")

# CORS - allow all for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INLINE AUTH - bypass router caching issues
pwd_inline = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_admission_inline(number: str, db: Session):
    pattern = r'^LOTSA 2025(\d{4})$'
    match = re.match(pattern, number)
    if not match:
        raise HTTPException(status_code=400, detail="Admission number must be in format: LOTSA 2025XXXX")
    digits = match.group(1)
    if len(set(digits)) != 4:
        raise HTTPException(status_code=400, detail="The 4 digits must all be different")
    existing = db.query(StudentProfile).filter(StudentProfile.admission_number == number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admission number already registered")

def validate_phone_inline(phone: str):
    if not phone:
        return
    phone = phone.replace(' ', '')
    if not re.match(r'^254\d{9}$', phone):
        raise HTTPException(status_code=400, detail="Phone number must be 254XXXXXXXXX")
    prefix = phone[3:5]
    valid = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
    if prefix not in valid:
        raise HTTPException(status_code=400, detail="Invalid Kenyan mobile prefix")

@app.post("/api/auth/register", response_model=schemas.UserOut)
def register_inline(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"INLINE REGISTER: email={user.email}")
    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        validate_admission_inline(user.admission_number, db)
        validate_phone_inline(user.phone_number)

        # TRUNCATE PASSWORD - guaranteed fresh code
        safe_pw = user.password[:72]
        print(f"Password: {len(user.password)} chars, truncated to {len(safe_pw)}")
        hashed = pwd_inline.hash(safe_pw)
        print(f"Hash created: {len(hashed)} chars")

        db_user = User(email=user.email, password_hash=hashed, role=UserRole.STUDENT)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User created: id={db_user.id}")

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

        result = db.query(User).options(
            joinedload(User.profile)
        ).filter(User.id == db_user.id).first()
        
        print("INLINE REGISTER SUCCESS")
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"INLINE REGISTER CRASH: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

@app.post("/api/auth/login", response_model=schemas.Token)
def login_inline(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not auth_utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth_utils.create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=expires
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role.value}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def read_me_inline(current_user: User = Depends(auth_utils.get_current_active_user)):
    return current_user

@app.get("/api/auth/users", response_model=list[schemas.UserOut])
def list_users_inline(
    current_user: User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).options(
        joinedload(User.profile)
    ).filter(User.is_active == True).all()
    return users

# Other routers
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

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "LOTSA CONNECT API", "status": "running", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}