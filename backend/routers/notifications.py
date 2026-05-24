from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("", response_model=List[schemas.NotificationOut])
def get_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    unread_only: bool = False,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Notification).filter_by(user_id=current_user.id)
    if unread_only:
        query = query.filter_by(is_read=False)
    return query.order_by(models.Notification.created_at.desc()).limit(limit).all()

@router.put("/{notif_id}/read")
def mark_read(
    notif_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    n = db.query(models.Notification).filter_by(id=notif_id, user_id=current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}

@router.put("/read-all")
def mark_all_read_alias(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db.query(models.Notification).filter_by(user_id=current_user.id, is_read=False).update(
        {models.Notification.is_read: True}
    )
    db.commit()
    return {"message": "All marked as read"}

@router.put("/mark-all-read")
def mark_all_read(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db.query(models.Notification).filter_by(user_id=current_user.id, is_read=False).update(
        {models.Notification.is_read: True}
    )
    db.commit()
    return {"message": "All marked as read"}