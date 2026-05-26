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
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    print(f"REGISTER START: email={user.email}")
    try:
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            print("REGISTER: Email already exists")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        print("REGISTER: Validating admission...")
        validate_admission_number(user.admission_number, db)
        
        print("REGISTER: Validating phone...")
        validate_kenyan_phone(user.phone_number)

        print("REGISTER: Hashing password...")
        hashed = auth_utils.get_password_hash(user.password)
        print(f"REGISTER: Hash done, length={len(hashed)}")

        print("REGISTER: Creating user...")
        db_user = models.User(
            email=user.email,
            password_hash=hashed,
            role=models.UserRole.STUDENT
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"REGISTER: User created, id={db_user.id}")

        print("REGISTER: Creating profile...")
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
        print("REGISTER: Profile created")

        result = db.query(models.User).options(
            joinedload(models.User.profile)
        ).filter(models.User.id == db_user.id).first()
        
        print("REGISTER: SUCCESS")
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"REGISTER CRASH: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not auth_utils.verify_password(form_data.password, user.password_hash):
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