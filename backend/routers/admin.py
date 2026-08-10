from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

def _generate_card_number(db: Session):
    import random
    while True:
        num = f"LOTSA-{random.randint(100000, 999999)}"
        existing = db.query(models.MembershipCard).filter(models.MembershipCard.card_number == num).first()
        if not existing:
            return num

@router.get("/dashboard/stats")
def get_stats(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    return {
        "total_students": db.query(func.count(models.User.id)).filter(models.User.role == 'student').scalar() or 0,
        "active_members": db.query(func.count(models.MembershipCard.id)).filter_by(is_active=True).scalar() or 0,
        "upcoming_events": db.query(func.count(models.Event.id)).filter(models.Event.event_date > func.now()).scalar() or 0,
        "active_elections": db.query(func.count(models.Election.id)).filter_by(is_active=True).scalar() or 0,
        "pending_complaints": db.query(func.count(models.Complaint.id)).filter(models.Complaint.status == 'pending').scalar() or 0,
        "pending_payments": db.query(func.count(models.Payment.id)).filter(models.Payment.status == 'pending').scalar() or 0,
    }

@router.get("/students", response_model=List[schemas.UserOut])
def get_all_students(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    return db.query(models.User).options(
        joinedload(models.User.profile)
    ).filter(models.User.role == 'student').all()

@router.put("/students/{student_id}/status")
def update_status(student_id: int, is_active: bool, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    student = db.query(models.User).filter_by(id=student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = is_active
    db.commit()
    return {"message": "Status updated"}

@router.get("/complaints", response_model=List[schemas.ComplaintOut])
def get_all_complaints(status: str = None, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    query = db.query(models.Complaint).options(
        joinedload(models.Complaint.student).joinedload(models.User.profile)
    )
    if status:
        query = query.filter(models.Complaint.status == status)
    return query.order_by(models.Complaint.created_at.desc()).all()

@router.get("/payments/pending")
def get_pending_payments(
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    payments = db.query(models.Payment).options(
        joinedload(models.Payment.user).joinedload(models.User.profile)
    ).filter(models.Payment.status == 'pending').order_by(models.Payment.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "amount": p.amount,
            "payment_method": p.payment_method,
            "mpesa_receipt": p.mpesa_receipt,
            "status": p.status.value if hasattr(p.status, 'value') else str(p.status),
            "description": p.description,
            "created_at": p.created_at,
            "user": {
                "id": p.user.id,
                "email": p.user.email,
                "profile": {
                    "full_name": p.user.profile.full_name,
                    "admission_number": p.user.profile.admission_number,
                    "course": p.user.profile.course,
                } if p.user.profile else None
            } if p.user else None
        }
        for p in payments
    ]

@router.post("/payments/{payment_id}/approve")
def approve_payment(
    payment_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    payment = db.query(models.Payment).filter_by(id=payment_id, status='pending').first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pending payment not found")

    card = db.query(models.MembershipCard).filter_by(user_id=payment.user_id).first()
    if card:
        card.is_active = True
        card.payment_status = models.PaymentStatus.COMPLETED
        card.amount_paid = payment.amount
        card.mpesa_receipt = payment.mpesa_receipt
        card.expiry_date = datetime.utcnow() + timedelta(days=365)
    else:
        card = models.MembershipCard(
            user_id=payment.user_id,
            card_number=_generate_card_number(db),
            expiry_date=datetime.utcnow() + timedelta(days=365),
            payment_status=models.PaymentStatus.COMPLETED,
            is_active=True,
            amount_paid=payment.amount,
            mpesa_receipt=payment.mpesa_receipt
        )
        db.add(card)

    payment.status = models.PaymentStatus.COMPLETED
    db.commit()
    db.refresh(card)

    return {
        "message": "Payment approved and membership card generated successfully",
        "card_number": card.card_number,
        "student_name": card.user.profile.full_name if card.user and card.user.profile else "Unknown"
    }

@router.post("/payments/{payment_id}/reject")
def reject_payment(
    payment_id: int,
    reason: str = None,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    payment = db.query(models.Payment).filter_by(id=payment_id, status='pending').first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pending payment not found")

    payment.status = models.PaymentStatus.FAILED
    db.commit()

    return {
        "message": "Payment rejected" + (f": {reason}" if reason else "")
    }

@router.get("/reports/student-enrollment")
def student_enrollment_report(
    format: str = "json",
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    students = db.query(models.User).filter(models.User.role == 'student').options(
        joinedload(models.User.profile)
    ).all()
    
    course_counts = {}
    year_counts = {}
    for s in students:
        if s.profile:
            course = s.profile.course or "Unknown"
            year = s.profile.year_of_study or 0
            course_counts[course] = course_counts.get(course, 0) + 1
            year_counts[year] = year_counts.get(year, 0) + 1
    
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "total_students": len(students),
        "by_course": course_counts,
        "by_year": year_counts,
        "students": [
            {
                "id": s.id,
                "email": s.email,
                "full_name": s.profile.full_name if s.profile else None,
                "admission_number": s.profile.admission_number if s.profile else None,
                "course": s.profile.course if s.profile else None,
                "year_of_study": s.profile.year_of_study if s.profile else None,
                "phone_number": s.profile.phone_number if s.profile else None,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in students
        ]
    }

@router.get("/reports/event-participation")
def event_participation_report(
    format: str = "json",
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    events = db.query(models.Event).order_by(models.Event.event_date.desc()).all()
    
    event_data = []
    for event in events:
        total_reg = db.query(func.count(models.EventRegistration.id)).filter(
            models.EventRegistration.event_id == event.id
        ).scalar() or 0
        
        total_attended = db.query(func.count(models.EventRegistration.id)).filter(
            models.EventRegistration.event_id == event.id,
            models.EventRegistration.attended == True
        ).scalar() or 0
        
        event_data.append({
            "id": event.id,
            "title": event.title,
            "category": event.category.value if event.category else None,
            "event_date": event.event_date.isoformat() if event.event_date else None,
            "location": event.location,
            "total_registered": total_reg,
            "total_attended": total_attended,
            "attendance_rate": round((total_attended / total_reg * 100), 1) if total_reg > 0 else 0
        })
    
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "total_events": len(events),
        "events": event_data
    }

@router.get("/reports/election-results")
def election_results_report(
    format: str = "json",
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    elections = db.query(models.Election).order_by(models.Election.created_at.desc()).all()
    
    election_data = []
    for election in elections:
        candidates = db.query(models.Candidate).filter_by(election_id=election.id).options(
            joinedload(models.Candidate.student)
        ).all()
        
        total_votes = db.query(func.count(models.Vote.id)).filter(
            models.Vote.election_id == election.id
        ).scalar() or 0
        
        candidate_results = []
        for c in candidates:
            vote_count = db.query(func.count(models.Vote.id)).filter(
                models.Vote.candidate_id == c.id
            ).scalar() or 0
            
            candidate_results.append({
                "candidate_id": c.id,
                "student_name": c.student.full_name if c.student else "Unknown",
                "student_admission": c.student.admission_number if c.student else None,
                "manifesto": c.manifesto,
                "vote_count": vote_count,
                "vote_percentage": round((vote_count / total_votes * 100), 1) if total_votes > 0 else 0
            })
        
        candidate_results.sort(key=lambda x: x["vote_count"], reverse=True)
        
        election_data.append({
            "id": election.id,
            "title": election.title,
            "position": election.position,
            "is_active": election.is_active,
            "start_time": election.start_time.isoformat() if election.start_time else None,
            "end_time": election.end_time.isoformat() if election.end_time else None,
            "total_votes_cast": total_votes,
            "candidates": candidate_results,
            "winner": candidate_results[0] if candidate_results else None
        })
    
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "total_elections": len(elections),
        "elections": election_data
    }

@router.get("/reports/complaints-resolution")
def complaints_resolution_report(
    format: str = "json",
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    complaints = db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
    
    status_counts = {
        "pending": 0,
        "in_review": 0,
        "resolved": 0
    }
    
    resolution_times = []
    complaint_data = []
    
    for c in complaints:
        status_val = c.status.value if hasattr(c.status, 'value') else str(c.status)
        status_counts[status_val] = status_counts.get(status_val, 0) + 1
        
        resolution_time = None
        if status_val == 'resolved' and c.updated_at and c.created_at:
            delta = c.updated_at - c.created_at
            resolution_time = round(delta.total_seconds() / 3600, 1)
        
        if resolution_time is not None:
            resolution_times.append(resolution_time)
        
        complaint_data.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "status": status_val,
            "is_anonymous": c.is_anonymous,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "resolution_time_hours": resolution_time,
            "has_admin_response": c.admin_response is not None
        })
    
    avg_resolution = round(sum(resolution_times) / len(resolution_times), 1) if resolution_times else 0
    
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "total_complaints": len(complaints),
        "status_breakdown": status_counts,
        "average_resolution_time_hours": avg_resolution,
        "complaints": complaint_data
    }

@router.get("/reports/platform-analytics")
def platform_analytics_report(
    format: str = "json",
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    active_users = db.query(func.count(models.User.id)).filter_by(is_active=True).scalar() or 0
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_messages = db.query(func.count(models.Message.id)).filter(
        models.Message.created_at >= thirty_days_ago
    ).scalar() or 0
    
    total_conversations = db.query(func.count(models.Conversation.id)).scalar() or 0
    group_conversations = db.query(func.count(models.Conversation.id)).filter_by(is_group=True).scalar() or 0
    
    total_memberships = db.query(func.count(models.MembershipCard.id)).scalar() or 0
    active_memberships = db.query(func.count(models.MembershipCard.id)).filter_by(is_active=True).scalar() or 0
    
    total_payments = db.query(func.count(models.Payment.id)).scalar() or 0
    completed_payments = db.query(func.count(models.Payment.id)).filter(models.Payment.status == 'completed').scalar() or 0
    total_revenue = db.query(func.sum(models.Payment.amount)).filter(models.Payment.status == 'completed').scalar() or 0
    
    total_leaders = db.query(func.count(models.Leader.id)).filter_by(is_active=True).scalar() or 0
    
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users
        },
        "messaging": {
            "total_conversations": total_conversations,
            "group_conversations": group_conversations,
            "messages_last_30_days": recent_messages
        },
        "membership": {
            "total_cards": total_memberships,
            "active_cards": active_memberships,
            "renewal_rate": round((active_memberships / total_memberships * 100), 1) if total_memberships > 0 else 0
        },
        "payments": {
            "total_transactions": total_payments,
            "completed": completed_payments,
            "total_revenue_kes": total_revenue
        },
        "leadership": {
            "active_leaders": total_leaders
        }
    }