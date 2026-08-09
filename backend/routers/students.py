from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/me/profile", response_model=schemas.StudentProfileOut)
def get_profile(current_user: models.User = Depends(auth.get_current_active_user)):
    if not current_user.profile:
        raise HTTPException(
            status_code=404, 
            detail="Student profile not found. Only students have academic profiles."
        )
    return current_user.profile

@router.put("/me/profile", response_model=schemas.StudentProfileOut)
def update_profile(
    data: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if not current_user.profile:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found. Only students can update academic profiles."
        )
    profile = current_user.profile
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    # Sync name/phone changes back to User table for consistency
    if 'full_name' in update_data and update_data['full_name']:
        current_user.full_name = update_data['full_name']
    if 'phone_number' in update_data and update_data['phone_number']:
        current_user.phone_number = update_data['phone_number']
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/me/activity")
def get_my_activity(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if not current_user.profile:
        return {
            "events_attended": 0,
            "votes_cast": 0,
            "messages_sent": 0,
            "groups_joined": 0
        }

    profile_id = current_user.profile.id
    user_id = current_user.id

    events_attended = db.query(func.count(models.EventRegistration.id)).filter(
        models.EventRegistration.student_id == profile_id,
        models.EventRegistration.attended == True
    ).scalar() or 0

    votes_cast = db.query(func.count(models.Vote.id)).filter(
        models.Vote.student_id == profile_id
    ).scalar() or 0

    messages_sent = db.query(func.count(models.Message.id)).filter(
        models.Message.sender_id == user_id
    ).scalar() or 0

    groups_joined = db.query(func.count()).select_from(
        models.conversation_participants
    ).filter(
        models.conversation_participants.c.user_id == user_id
    ).scalar() or 0

    return {
        "events_attended": events_attended,
        "votes_cast": votes_cast,
        "messages_sent": messages_sent,
        "groups_joined": groups_joined
    }