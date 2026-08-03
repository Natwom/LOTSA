from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database, auth
from ..cloudinary_utils import upload_file, delete_file

router = APIRouter()

@router.get("/", response_model=List[schemas.LeaderOut])
def list_leaders(active_only: bool = True, db: Session = Depends(database.get_db)):
    query = db.query(models.Leader).options(
        joinedload(models.Leader.user).joinedload(models.User.profile)
    )
    if active_only:
        query = query.filter_by(is_active=True)
    return query.order_by(models.Leader.display_order).all()

@router.post("/", response_model=schemas.LeaderOut)
def create_leader(
    leader: schemas.LeaderCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == leader.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # FIX: Check if user already has a leader record (even inactive)
    existing = db.query(models.Leader).filter(models.Leader.user_id == leader.user_id).first()
    if existing:
        # Reactivate and update the existing record
        existing.position = leader.position
        existing.bio = leader.bio
        existing.display_order = leader.display_order or 0
        existing.is_active = True
        if leader.photo_url:
            existing.photo_url = leader.photo_url
        db.commit()
        db.refresh(existing)
        
        # Load relationships for response
        result = db.query(models.Leader).options(
            joinedload(models.Leader.user).joinedload(models.User.profile)
        ).filter(models.Leader.id == existing.id).first()
        return result
    
    # Create new leader
    db_leader = models.Leader(**leader.model_dump())
    db.add(db_leader)
    db.commit()
    db.refresh(db_leader)
    
    # Load relationships for response
    result = db.query(models.Leader).options(
        joinedload(models.Leader.user).joinedload(models.User.profile)
    ).filter(models.Leader.id == db_leader.id).first()
    return result

@router.post("/{leader_id}/upload-photo")
def upload_photo(
    leader_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    leader = db.query(models.Leader).filter(models.Leader.id == leader_id).first()
    if not leader:
        raise HTTPException(status_code=404, detail="Leader not found")
    
    if leader.photo_public_id:
        delete_file(leader.photo_public_id, resource_type="image")
    
    upload = upload_file(file, folder="lotsa/leaders")
    leader.photo_url = upload["url"]
    leader.photo_public_id = upload["public_id"]
    db.commit()
    db.refresh(leader)
    return {"photo_url": leader.photo_url, "public_id": leader.photo_public_id}

@router.put("/{leader_id}", response_model=schemas.LeaderOut)
def update_leader(
    leader_id: int,
    data: schemas.LeaderCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    leader = db.query(models.Leader).filter(models.Leader.id == leader_id).first()
    if not leader:
        raise HTTPException(status_code=404, detail="Not found")
    
    for field, value in data.model_dump().items():
        setattr(leader, field, value)
    db.commit()
    db.refresh(leader)
    
    # Load relationships for response
    result = db.query(models.Leader).options(
        joinedload(models.Leader.user).joinedload(models.User.profile)
    ).filter(models.Leader.id == leader.id).first()
    return result

@router.delete("/{leader_id}")
def delete_leader(
    leader_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    leader = db.query(models.Leader).filter(models.Leader.id == leader_id).first()
    if not leader:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Delete photo from Cloudinary if exists
    if leader.photo_public_id:
        delete_file(leader.photo_public_id, resource_type="image")
    
    # PERMANENT DELETE — removes the row from the database entirely
    db.delete(leader)
    db.commit()
    return {"message": "Leader permanently deleted"}

@router.patch("/{leader_id}/deactivate")
def deactivate_leader(
    leader_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    """Soft-delete alternative: mark leader as inactive without removing the row"""
    leader = db.query(models.Leader).filter(models.Leader.id == leader_id).first()
    if not leader:
        raise HTTPException(status_code=404, detail="Not found")
    
    leader.is_active = False
    db.commit()
    return {"message": "Leader deactivated"}