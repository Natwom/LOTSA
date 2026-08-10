from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from .. import models, schemas, database, auth

router = APIRouter()

# ─── Payment Configuration ───
PAYBILL_NUMBER = "254254"
ACCOUNT_NUMBER = "12345678"

# ==================== ADMIN ENDPOINTS ====================

@router.get("/payment-config")
def get_payment_config():
    """Return universal M-Pesa payment details for contributions"""
    return {
        "paybill_number": PAYBILL_NUMBER,
        "account_number": ACCOUNT_NUMBER,
        "description": f"Pay via M-Pesa Paybill {PAYBILL_NUMBER}, Account {ACCOUNT_NUMBER}"
    }

@router.post("/periods", response_model=schemas.ContributionPeriodOut)
def create_period(
    period: schemas.ContributionPeriodCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    db_period = models.ContributionPeriod(**period.model_dump(), created_by=admin.id)
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    return db_period

@router.get("/periods", response_model=List[schemas.ContributionPeriodOut])
def list_periods(
    active_only: bool = False,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.ContributionPeriod)
    if active_only:
        query = query.filter(models.ContributionPeriod.is_active == True)
    return query.order_by(models.ContributionPeriod.year.desc(), models.ContributionPeriod.month.desc()).all()

@router.get("/periods/{period_id}/payments", response_model=List[schemas.ContributionPaymentOut])
def get_period_payments(
    period_id: int,
    status: Optional[str] = None,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    query = db.query(models.ContributionPayment).filter(models.ContributionPayment.period_id == period_id)
    if status:
        query = query.filter(models.ContributionPayment.status == status)
    return query.order_by(models.ContributionPayment.paid_at.desc()).all()

@router.put("/payments/{payment_id}/verify", response_model=schemas.ContributionPaymentOut)
def verify_payment(
    payment_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    payment = db.query(models.ContributionPayment).filter(models.ContributionPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # FIX: use string literal instead of Enum
    payment.status = "completed"
    payment.verified_by = admin.id
    payment.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(payment)
    
    notif = models.Notification(
        user_id=payment.user_id,
        title="Contribution Payment Verified",
        message=f"Your contribution payment of KES {payment.amount} has been verified.",
        type="payment"
    )
    db.add(notif)
    db.commit()
    
    return payment

@router.get("/stats")
def get_contribution_stats(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    total_periods = db.query(func.count(models.ContributionPeriod.id)).scalar()
    total_payments = db.query(func.count(models.ContributionPayment.id)).scalar()
    # FIX: compare String column to string literals
    total_collected = db.query(func.sum(models.ContributionPayment.amount)).filter(
        models.ContributionPayment.status == "completed"
    ).scalar() or 0
    
    pending_payments = db.query(func.count(models.ContributionPayment.id)).filter(
        models.ContributionPayment.status == "pending"
    ).scalar()
    
    return {
        "total_periods": total_periods,
        "total_payments": total_payments,
        "total_collected_kes": total_collected,
        "pending_verifications": pending_payments
    }

# ==================== STUDENT ENDPOINTS ====================

@router.post("/pay", response_model=schemas.ContributionPaymentOut)
def make_payment(
    payment: schemas.ContributionPaymentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    period = db.query(models.ContributionPeriod).filter(
        models.ContributionPeriod.id == payment.period_id,
        models.ContributionPeriod.is_active == True
    ).first()
    if not period:
        raise HTTPException(status_code=400, detail="Contribution period not found or inactive")
    
    existing = db.query(models.ContributionPayment).filter(
        models.ContributionPayment.user_id == current_user.id,
        models.ContributionPayment.period_id == payment.period_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a payment for this period")
    
    # FIX: use string literal instead of Enum
    db_payment = models.ContributionPayment(
        user_id=current_user.id,
        period_id=payment.period_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        mpesa_receipt=payment.mpesa_receipt,
        status="pending"
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    notif = models.Notification(
        user_id=current_user.id,
        title="Contribution Payment Submitted",
        message=f"Your KES {payment.amount} payment for {period.title} is awaiting verification.",
        type="payment"
    )
    db.add(notif)
    db.commit()
    
    return db_payment

@router.get("/my-payments", response_model=List[schemas.ContributionPaymentOut])
def my_payments(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return db.query(models.ContributionPayment).filter(
        models.ContributionPayment.user_id == current_user.id
    ).order_by(models.ContributionPayment.paid_at.desc()).all()

@router.get("/my-status")
def my_contribution_status(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    periods = db.query(models.ContributionPeriod).filter(
        models.ContributionPeriod.is_active == True
    ).order_by(models.ContributionPeriod.year.desc(), models.ContributionPeriod.month.desc()).all()
    
    result = []
    for period in periods:
        payment = db.query(models.ContributionPayment).filter(
            models.ContributionPayment.user_id == current_user.id,
            models.ContributionPayment.period_id == period.id
        ).first()
        
        # FIX: payment.status is already a string — no .value needed
        result.append({
            "period": {
                "id": period.id,
                "title": period.title,
                "month": period.month,
                "year": period.year,
                "amount": period.amount,
                "due_date": period.due_date
            },
            "payment_status": payment.status if payment else "unpaid",
            "paid_amount": payment.amount if payment else 0,
            "paid_at": payment.paid_at if payment else None,
            # FIX: compare string to string literal
            "verified": payment.status == "completed" if payment else False
        })
    
    return result