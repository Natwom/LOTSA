from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime, timedelta
from .. import models, schemas, database, auth

router = APIRouter()

# ─── Payment Configuration ───
PAYBILL_NUMBER = "400200"
ACCOUNT_NUMBER = "1092275"
MEMBERSHIP_AMOUNT = 100

def generate_card_number(db: Session):
    """Generate unique membership card number: LOTSA-XXXXXX"""
    import random
    while True:
        num = f"LOTSA-{random.randint(100000, 999999)}"
        existing = db.query(models.MembershipCard).filter(models.MembershipCard.card_number == num).first()
        if not existing:
            return num

@router.get("/payment-config")
def get_payment_config():
    """Return universal M-Pesa payment details for membership"""
    return {
        "paybill_number": PAYBILL_NUMBER,
        "account_number": ACCOUNT_NUMBER,
        "amount": MEMBERSHIP_AMOUNT,
        "description": f"Pay Ksh {MEMBERSHIP_AMOUNT} via M-Pesa Paybill {PAYBILL_NUMBER}, Account {ACCOUNT_NUMBER}"
    }

@router.get("/my-card", response_model=Optional[schemas.MembershipCardOut])
def get_my_card(current_user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)):
    return db.query(models.MembershipCard).filter(models.MembershipCard.user_id == current_user.id).first()

@router.get("/my-payment")
def get_my_pending_payment(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Check if student has a payment awaiting admin approval"""
    # FIX: compare String column to string literal
    payment = db.query(models.Payment).filter(
        models.Payment.user_id == current_user.id,
        models.Payment.status == "pending"
    ).order_by(models.Payment.created_at.desc()).first()
    if not payment:
        return None
    return {
        "id": payment.id,
        "amount": payment.amount,
        "mpesa_receipt": payment.mpesa_receipt,
        "payment_method": payment.payment_method,
        "status": payment.status,
        "created_at": payment.created_at,
    }

@router.post("/pay")
def submit_payment(
    data: schemas.PaymentCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Student submits payment proof — awaits admin approval"""
    # Block if already active
    existing_card = db.query(models.MembershipCard).filter(
        models.MembershipCard.user_id == current_user.id,
        models.MembershipCard.is_active == True
    ).first()
    if existing_card:
        raise HTTPException(status_code=400, detail="You already have an active membership card")

    # Block if already pending
    # FIX: compare String column to string literal
    existing_pending = db.query(models.Payment).filter(
        models.Payment.user_id == current_user.id,
        models.Payment.status == "pending"
    ).first()
    if existing_pending:
        raise HTTPException(status_code=400, detail="You already have a pending payment awaiting admin approval")

    receipt = data.mpesa_receipt or f"MPESA{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    # FIX: use string literal instead of Enum
    payment = models.Payment(
        user_id=current_user.id,
        amount=MEMBERSHIP_AMOUNT,
        payment_method=data.payment_method,
        mpesa_receipt=receipt,
        status="pending",
        description=f"Membership Card - Ksh {MEMBERSHIP_AMOUNT} (Paybill {PAYBILL_NUMBER}, Account {ACCOUNT_NUMBER})"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment submitted successfully! Awaiting admin approval.",
        "receipt": receipt,
        "status": "pending"
    }

@router.get("/validate/{card_number}")
def validate_card(card_number: str, db: Session = Depends(database.get_db)):
    card = db.query(models.MembershipCard).filter(
        models.MembershipCard.card_number == card_number,
        models.MembershipCard.is_active == True
    ).first()

    if not card:
        return {"valid": False, "message": "Invalid or inactive card"}

    if card.expiry_date < datetime.utcnow():
        return {"valid": False, "message": "Card expired", "expiry_date": card.expiry_date}

    return {
        "valid": True,
        "card_number": card.card_number,
        "holder": card.user.profile.full_name if card.user.profile else "Unknown",
        "admission_number": card.user.profile.admission_number if card.user.profile else "Unknown",
        "course": card.user.profile.course if card.user.profile else "Unknown",
        "expiry_date": card.expiry_date,
        "days_remaining": (card.expiry_date - datetime.utcnow()).days
    }

@router.get("/all")
def get_all_cards(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    """Return all cards with user info for admin table"""
    cards = db.query(models.MembershipCard).options(
        joinedload(models.MembershipCard.user).joinedload(models.User.profile)
    ).order_by(models.MembershipCard.created_at.desc()).all()

    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "card_number": c.card_number,
            "issue_date": c.issue_date,
            "expiry_date": c.expiry_date,
            "is_active": c.is_active,
            # FIX: payment_status is already a string — no .value needed
            "payment_status": c.payment_status if c.payment_status else None,
            "amount_paid": c.amount_paid,
            "mpesa_receipt": c.mpesa_receipt,
            "created_at": c.created_at,
            "user": {
                "id": c.user.id,
                "email": c.user.email,
                "profile": {
                    "full_name": c.user.profile.full_name,
                    "admission_number": c.user.profile.admission_number,
                    "course": c.user.profile.course,
                } if c.user.profile else None
            } if c.user else None
        }
        for c in cards
    ]

@router.post("/{card_id}/renew")
def renew_card(
    card_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    card = db.query(models.MembershipCard).filter(models.MembershipCard.id == card_id).first()
    if not card or card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")

    if card.expiry_date > datetime.utcnow() + timedelta(days=30):
        raise HTTPException(status_code=400, detail="Card is still valid. Renewal available 30 days before expiry.")

    # FIX: use string literal instead of Enum
    payment = models.Payment(
        user_id=current_user.id,
        amount=MEMBERSHIP_AMOUNT,
        payment_method="mpesa",
        status="completed",
        description=f"Membership Card Renewal - Ksh {MEMBERSHIP_AMOUNT} (Paybill {PAYBILL_NUMBER}, Account {ACCOUNT_NUMBER})"
    )
    db.add(payment)

    card.expiry_date = datetime.utcnow() + timedelta(days=365)
    card.is_active = True

    db.commit()
    return {"message": "Card renewed successfully", "new_expiry": card.expiry_date}
