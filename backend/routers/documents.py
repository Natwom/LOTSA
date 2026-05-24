from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import shutil
from pathlib import Path
from .. import models, schemas, database, auth

router = APIRouter()

UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file_type: str = Form("general"),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    allowed_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {allowed_extensions}")
    
    safe_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = file_path.stat().st_size
    
    db_doc = models.Document(
        title=title,
        description=description,
        file_type=models.DocumentType(file_type),
        file_url=f"/uploads/documents/{safe_filename}",
        file_name=file.filename,
        file_size=file_size,
        uploaded_by=admin.id
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.get("/", response_model=List[schemas.DocumentOut])
def list_documents(
    file_type: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Document).filter(models.Document.is_active == True)
    if file_type:
        query = query.filter(models.Document.file_type == file_type)
    return query.order_by(models.Document.uploaded_at.desc()).all()

@router.get("/admin/all", response_model=List[schemas.DocumentOut])
def admin_list_documents(
    file_type: Optional[str] = None,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    query = db.query(models.Document)
    if file_type:
        query = query.filter(models.Document.file_type == file_type)
    return query.order_by(models.Document.uploaded_at.desc()).all()

@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        file_path = Path("uploads") / doc.file_url.replace("/uploads/", "")
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass
    
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}

@router.put("/{doc_id}/toggle")
def toggle_document(
    doc_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.require_admin)
):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_active = not doc.is_active
    db.commit()
    db.refresh(doc)
    return doc