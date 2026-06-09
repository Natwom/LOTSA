from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database, auth as auth_utils

router = APIRouter()

@router.get("/conversations", response_model=List[schemas.ConversationOut])
def get_conversations(
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    convs = db.query(models.Conversation).options(
        joinedload(models.Conversation.participants).joinedload(models.User.profile)
    ).join(models.Conversation.participants).filter(models.User.id == current_user.id).all()

    result = []
    for conv in convs:
        last_msg = db.query(models.Message).filter_by(conversation_id=conv.id).order_by(models.Message.created_at.desc()).first()
        
        display_name = conv.name
        if not conv.is_group and not conv.name:
            other = next((p for p in conv.participants if p.id != current_user.id), None)
            display_name = other.profile.full_name if other and other.profile else (other.email if other else 'Private Chat')
        
        conv_dict = {
            "id": conv.id,
            "is_group": conv.is_group,
            "name": display_name,
            "created_at": conv.created_at,
            "last_message": last_msg.content if last_msg else None,
        }
        result.append(conv_dict)
    return result

@router.post("/conversations", response_model=schemas.ConversationOut)
def create_conversation(
    data: schemas.ConversationCreate,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Create a new conversation or return existing 1-on-1 DM"""
    if not data.is_group and len(data.participant_ids) == 1:
        other_id = data.participant_ids[0]
        all_convs = db.query(models.Conversation).options(
            joinedload(models.Conversation.participants).joinedload(models.User.profile)
        ).filter(models.Conversation.is_group == False).all()

        for conv in all_convs:
            pids = {p.id for p in conv.participants}
            if pids == {current_user.id, other_id}:
                last_msg = db.query(models.Message).filter_by(conversation_id=conv.id).order_by(models.Message.created_at.desc()).first()
                other = next((p for p in conv.participants if p.id != current_user.id), None)
                display_name = other.profile.full_name if other and other.profile else (other.email if other else 'Private Chat')
                return {
                    "id": conv.id,
                    "is_group": conv.is_group,
                    "name": display_name,
                    "created_at": conv.created_at,
                    "last_message": last_msg.content if last_msg else None,
                }

    conv = models.Conversation(
        is_group=data.is_group or False,
        name=data.name,
        created_by=current_user.id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    participants = [current_user]
    for pid in data.participant_ids:
        if pid == current_user.id:
            continue
        user = db.query(models.User).filter(models.User.id == pid).first()
        if user:
            participants.append(user)

    conv.participants = participants
    db.commit()
    db.refresh(conv)

    display_name = conv.name
    if not conv.is_group and not conv.name:
        other = next((p for p in conv.participants if p.id != current_user.id), None)
        display_name = other.profile.full_name if other and other.profile else (other.email if other else 'Private Chat')

    return {
        "id": conv.id,
        "is_group": conv.is_group,
        "name": display_name,
        "created_at": conv.created_at,
        "last_message": None,
    }

@router.post("/groups")
def create_group(
    data: schemas.ConversationCreate,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Create a group chat with all registered students"""
    all_users = db.query(models.User).filter(
        models.User.is_active == True,
        models.User.id != current_user.id
    ).all()

    conv = models.Conversation(
        is_group=True,
        name=data.name or "General Group",
        created_by=current_user.id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    participants = [current_user] + all_users
    conv.participants = participants
    db.commit()
    db.refresh(conv)

    return {
        "id": conv.id,
        "is_group": True,
        "name": conv.name,
        "created_at": conv.created_at,
        "last_message": None,
    }

@router.get("/conversations/{conv_id}/messages")
def get_messages(
    conv_id: int,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    participant_ids = {p.id for p in conv.participants}
    if current_user.id not in participant_ids:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    messages = db.query(models.Message).options(
        joinedload(models.Message.sender).joinedload(models.User.profile)
    ).filter_by(conversation_id=conv_id).order_by(models.Message.created_at).all()

    result = []
    for msg in messages:
        sender = msg.sender
        sender_name = "Unknown"
        if sender:
            if sender.profile and sender.profile.full_name:
                sender_name = sender.profile.full_name
            elif sender.email:
                sender_name = sender.email
        
        result.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_name": sender_name,
            "content": msg.content,
            "file_url": msg.file_url,
            "image_url": msg.image_url,
            "reply_to_id": msg.reply_to_id,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
            "edited_at": msg.edited_at.isoformat() if msg.edited_at else None,
        })
    return result