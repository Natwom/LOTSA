from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from .. import models, schemas, database, auth

router = APIRouter()

UPLOAD_DIR = "uploads/leaders"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.LeaderOut])
def list_leaders(active_only: bool = True, db: Session = Depends(database.get_db)):
    query = db.query(models.Leader)
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
    
    db_leader = models.Leader(**leader.model_dump())
    db.add(db_leader)
    db.commit()
    db.refresh(db_leader)
    return db_leader

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
    
    file_ext = file.filename.split(".")[-1]
    filename = f"leader_{leader_id}.{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    leader.photo_url = f"/uploads/leaders/{filename}"
    db.commit()
    return {"photo_url": leader.photo_url}

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
    return leader

@router.delete("/{leader_id}")
def delete_leader(
    leader_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    leader = db.query(models.Leader).filter(models.Leader.id == leader_id).first()
    if not leader:
        raise HTTPException(status_code=404, detail="Not found")
    leader.is_active = False
    db.commit()
    return {"message": "Leader removed"}