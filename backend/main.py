from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from passlib.context import CryptContext
from .database import engine, get_db
from .models import Base, User, UserRole, StudentProfile
from . import schemas
from .routers import students, announcements, events, elections, complaints, chats, notifications, admin, leaders, membership, settings, terms, documents, contributions

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️ WARNING: Could not create tables: {e}")

app = FastAPI(title="LOTSA CONNECT API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INLINE REGISTER - bypasses any router caching issues
pwd_inline = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/api/auth/register", response_model=schemas.UserOut)
def register_inline(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"INLINE REGISTER: email={user.email}")
    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate admission
        import re
        pattern = r'^LOTSA 2025(\d{4})$'
        match = re.match(pattern, user.admission_number)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid admission format")
        if len(set(match.group(1))) != 4:
            raise HTTPException(status_code=400, detail="Digits must be unique")
        
        existing_adm = db.query(StudentProfile).filter(
            StudentProfile.admission_number == user.admission_number
        ).first()
        if existing_adm:
            raise HTTPException(status_code=400, detail="Admission number exists")
        
        # Validate phone
        if user.phone_number:
            phone = user.phone_number.replace(' ', '')
            if not re.match(r'^254\d{9}$', phone):
                raise HTTPException(status_code=400, detail="Invalid phone")
        
        # HASH WITH TRUNCATION
        safe_pw = user.password[:72]
        print(f"Password: {len(user.password)} chars, truncated to {len(safe_pw)}")
        hashed = pwd_inline.hash(safe_pw)
        print(f"Hash created: {len(hashed)} chars")
        
        db_user = User(email=user.email, password_hash=hashed, role=UserRole.STUDENT)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
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
        import traceback
        print(f"INLINE REGISTER CRASH: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

# Other routers (auth router is now bypassed by inline endpoint above)
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(elections.router, prefix="/api/elections", tags=["elections"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(chats.router, prefix="/api/chats", tags=["chats"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(leaders.router, prefix="/api/leaders", tags=["leaders"])
app.include_router(membership.router, prefix="/api/membership", tags=["membership"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(terms.router, prefix="/api/terms", tags=["terms"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(contributions.router, prefix="/api/contributions", tags=["contributions"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "LOTSA CONNECT API", "status": "running", "version": "2.0.0"}