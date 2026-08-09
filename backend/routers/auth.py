from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import timedelta
from typing import List
import re
import traceback
from .. import models, schemas, database, auth as auth_utils

router = APIRouter()

def validate_admission_number(number: str, db: Session):
    pattern = r'^LOTSA 2025(\d{4})$'
    match = re.match(pattern, number)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Admission number must be in format: LOTSA 2025XXXX (e.g., LOTSA 20251234)"
        )
    
    digits = match.group(1)
    if len(set(digits)) != 4:
        raise HTTPException(
            status_code=400,
            detail="The 4 digits after 'LOTSA 2025' must all be different"
        )
    
    existing = db.query(models.StudentProfile).filter(
        models.StudentProfile.admission_number == number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admission number already registered")

def validate_kenyan_phone(phone: str):
    if not phone:
        return
    phone = phone.replace(' ', '')
    if not re.match(r'^254\d{9}$', phone):
        raise HTTPException(
            status_code=400,
            detail="Phone number must be a valid Kenyan number (254XXXXXXXXX)"
        )
    prefix = phone[3:5]
    valid_prefixes = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
    if prefix not in valid_prefixes:
        raise HTTPException(status_code=400, detail="Invalid Kenyan mobile prefix")

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.RegisterRequest, db: Session = Depends(database.get_db)):
    # CRITICAL DEBUG: Show exactly what Pydantic gave us
    print(f"[REGISTER] email={user.email}")
    print(f"[REGISTER] user.role type={type(user.role)}, repr={repr(user.role)}")
    
    try:
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # EXTRACT LOWERCASE STRING VALUE - THIS IS THE FIX
        if hasattr(user.role, 'value'):
            role_str = str(user.role.value).lower()
        else:
            role_str = str(user.role).lower()
        
        print(f"[REGISTER] EXTRACTED role_str='{role_str}'")
        
        is_student = role_str == 'student'

        if is_student:
            validate_admission_number(user.admission_number, db)
        
        validate_kenyan_phone(user.phone_number)

        hashed = auth_utils.get_password_hash(user.password)
        print(f"[REGISTER] hash created, len={len(hashed)}")

        # Pass the plain string - SQLAlchemy will handle it
        db_user = models.User(
            email=user.email,
            password_hash=hashed,
            role=role_str,
            full_name=user.full_name,
            phone_number=user.phone_number
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"[REGISTER] SUCCESS - user id={db_user.id}, role={db_user.role}")

        if is_student:
            profile = models.StudentProfile(
                user_id=db_user.id,
                full_name=user.full_name,
                admission_number=user.admission_number,
                course=user.course,
                year_of_study=user.year_of_study,
                phone_number=user.phone_number
            )
            db.add(profile)
            db.commit()
            print("[REGISTER] student profile created")

        result = db.query(models.User).options(
            joinedload(models.User.profile)
        ).filter(models.User.id == db_user.id).first()
        
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[REGISTER] CRASH: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    print(f"[LOGIN] email={form_data.email}")
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user:
        print("[LOGIN] user not found")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not auth_utils.verify_password(form_data.password, user.password_hash):
        print("[LOGIN] password mismatch")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth_utils.create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=expires
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role.value}

@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(auth_utils.get_current_active_user)):
    return current_user

@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    users = db.query(models.User).options(
        joinedload(models.User.profile)
    ).filter(models.User.is_active == True).all()
    return users