from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from .. import models, schemas, database, auth

router = APIRouter()

# ==================== PUBLIC ENDPOINTS ====================

@router.get("/", response_model=List[schemas.EventOut])
def list_events(
    upcoming: bool = False,
    category: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Event)
    if upcoming:
        query = query.filter(models.Event.event_date >= datetime.utcnow())
    if category:
        query = query.filter(models.Event.category == category.lower())
    return query.order_by(models.Event.event_date.asc()).limit(limit).all()

@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(database.get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/{event_id}/register")
def register_for_event(
    event_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if not current_user.profile:
        raise HTTPException(status_code=400, detail="Student profile required")
    
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    existing = db.query(models.EventRegistration).filter(
        models.EventRegistration.event_id == event_id,
        models.EventRegistration.student_id == current_user.profile.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    registration = models.EventRegistration(
        event_id=event_id,
        student_id=current_user.profile.id
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    notif = models.Notification(
        user_id=current_user.id,
        title=f"Registered for {event.title}",
        message=f"You have successfully registered for {event.title} on {event.event_date}",
        type="event"
    )
    db.add(notif)
    db.commit()
    
    return registration

@router.get("/my-registrations", response_model=List[schemas.EventRegistrationOut])
def my_registrations(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if not current_user.profile:
        return []
    return db.query(models.EventRegistration).filter(
        models.EventRegistration.student_id == current_user.profile.id
    ).order_by(models.EventRegistration.registered_at.desc()).all()

# ==================== ADMIN ENDPOINTS ====================

@router.post("/", response_model=schemas.EventOut)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    db_event = models.Event(**event.model_dump(), created_by=admin.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/admin/all", response_model=List[schemas.EventOut])
def admin_list_events(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    return db.query(models.Event).order_by(models.Event.created_at.desc()).all()

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}

@router.get("/admin/{event_id}/attendees")
def get_event_attendees(
    event_id: int,
    attended_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(
        models.EventRegistration,
        models.StudentProfile,
        models.User
    ).join(
        models.StudentProfile,
        models.EventRegistration.student_id == models.StudentProfile.id
    ).join(
        models.User,
        models.StudentProfile.user_id == models.User.id
    ).filter(
        models.EventRegistration.event_id == event_id
    )
    
    if attended_only:
        query = query.filter(models.EventRegistration.attended == True)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(models.StudentProfile.full_name).like(search_term)) |
            (func.lower(models.StudentProfile.admission_number).like(search_term)) |
            (func.lower(models.User.email).like(search_term))
        )
    
    results = query.order_by(models.EventRegistration.registered_at.desc()).all()
    
    attendees = []
    for reg, profile, user in results:
        attendees.append({
            "registration_id": reg.id,
            "registered_at": reg.registered_at,
            "attended": reg.attended,
            "student": {
                "id": profile.id,
                "full_name": profile.full_name,
                "admission_number": profile.admission_number,
                "course": profile.course,
                "year_of_study": profile.year_of_study,
                "phone_number": profile.phone_number,
                "email": user.email
            }
        })
    
    total_registered = db.query(func.count(models.EventRegistration.id)).filter(
        models.EventRegistration.event_id == event_id
    ).scalar() or 0
    
    total_attended = db.query(func.count(models.EventRegistration.id)).filter(
        models.EventRegistration.event_id == event_id,
        models.EventRegistration.attended == True
    ).scalar() or 0
    
    return {
        "event": {
            "id": event.id,
            "title": event.title,
            "event_date": event.event_date,
            "location": event.location,
            "category": event.category  # FIX: removed .value
        },
        "stats": {
            "total_registered": total_registered,
            "total_attended": total_attended,
            "attendance_rate": round((total_attended / total_registered * 100), 1) if total_registered > 0 else 0
        },
        "attendees": attendees
    }

@router.put("/admin/{event_id}/attendees/{registration_id}/check-in")
def check_in_attendee(
    event_id: int,
    registration_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    registration = db.query(models.EventRegistration).filter(
        models.EventRegistration.id == registration_id,
        models.EventRegistration.event_id == event_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    registration.attended = True
    db.commit()
    db.refresh(registration)
    
    student = db.query(models.StudentProfile).filter(
        models.StudentProfile.id == registration.student_id
    ).first()
    if student:
        notif = models.Notification(
            user_id=student.user_id,
            title="Event Check-in Confirmed",
            message="You have been checked in. Thank you for attending!",
            type="event"
        )
        db.add(notif)
        db.commit()
    
    return {"message": "Attendee checked in successfully", "attended": True}

@router.put("/admin/{event_id}/attendees/{registration_id}/uncheck")
def uncheck_attendee(
    event_id: int,
    registration_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    registration = db.query(models.EventRegistration).filter(
        models.EventRegistration.id == registration_id,
        models.EventRegistration.event_id == event_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    registration.attended = False
    db.commit()
    db.refresh(registration)
    
    return {"message": "Attendee unchecked successfully", "attended": False}

@router.delete("/admin/{event_id}/attendees/{registration_id}")
def remove_attendee(
    event_id: int,
    registration_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    registration = db.query(models.EventRegistration).filter(
        models.EventRegistration.id == registration_id,
        models.EventRegistration.event_id == event_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    db.delete(registration)
    db.commit()
    
    return {"message": "Attendee removed successfully"}