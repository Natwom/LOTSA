from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/my", response_model=List[schemas.ComplaintOut])
def my_complaints(current_user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)):
    return db.query(models.Complaint).filter_by(student_id=current_user.id).order_by(models.Complaint.created_at.desc()).all()

@router.post("/", response_model=schemas.ComplaintOut)
def create_complaint(complaint: schemas.ComplaintCreate, current_user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)):
    db_complaint = models.Complaint(**complaint.model_dump(), student_id=current_user.id)
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.put("/{complaint_id}/status", response_model=schemas.ComplaintOut)
def update_status(complaint_id: int, data: schemas.ComplaintStatusUpdate, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    c = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    # FIX: ensure we store a string, not an Enum member
    c.status = data.status.value if hasattr(data.status, 'value') else str(data.status)
    db.commit()
    db.refresh(c)
    return c

@router.put("/{complaint_id}/response", response_model=schemas.ComplaintOut)
def add_response(complaint_id: int, data: schemas.ComplaintResponse, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    c = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    c.admin_response = data.admin_response
    db.commit()
    db.refresh(c)
    return c