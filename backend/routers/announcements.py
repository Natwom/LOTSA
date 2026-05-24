from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.AnnouncementOut])
def list_announcements(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Announcement).order_by(
        models.Announcement.is_pinned.desc(),
        models.Announcement.created_at.desc()
    ).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.AnnouncementOut)
def create_announcement(
    ann: schemas.AnnouncementCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    db_ann = models.Announcement(**ann.model_dump(), created_by=current_user.id)
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann

@router.delete("/{ann_id}")
def delete_announcement(ann_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(database.get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(ann)
    db.commit()
    return {"message": "Deleted"}