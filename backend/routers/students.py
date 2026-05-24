from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/me/profile", response_model=schemas.StudentProfileOut)
def get_profile(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user.profile

@router.put("/me/profile", response_model=schemas.StudentProfileOut)
def update_profile(
    data: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    profile = current_user.profile
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile

# ==================== REAL ACTIVITY STATS ====================

@router.get("/me/activity")
def get_my_activity(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Returns real activity counts based on the student's actual platform usage:
    - events_attended: Events where student checked in (attended=True)
    - votes_cast: Election votes submitted by this student
    - messages_sent: Chat messages sent
    - groups_joined: Group conversations participated in
    """
    if not current_user.profile:
        return {
            "events_attended": 0,
            "votes_cast": 0,
            "messages_sent": 0,
            "groups_joined": 0
        }

    profile_id = current_user.profile.id
    user_id = current_user.id

    # Events where student was marked as attended
    events_attended = db.query(func.count(models.EventRegistration.id)).filter(
        models.EventRegistration.student_id == profile_id,
        models.EventRegistration.attended == True
    ).scalar() or 0

    # Election votes cast
    votes_cast = db.query(func.count(models.Vote.id)).filter(
        models.Vote.student_id == profile_id
    ).scalar() or 0

    # Chat messages sent
    messages_sent = db.query(func.count(models.Message.id)).filter(
        models.Message.sender_id == user_id
    ).scalar() or 0

    # Group conversations joined (from association table)
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