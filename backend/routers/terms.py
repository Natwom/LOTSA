from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import TermsDocument, TermsAcceptance, User
from ..schemas import TermsDocumentCreate, TermsDocumentUpdate, TermsDocumentOut, TermsAcceptanceCreate, TermsAcceptanceOut
from ..auth import get_current_user, require_admin

router = APIRouter()

# ==================== PUBLIC ENDPOINTS ====================

@router.get("/", response_model=List[TermsDocumentOut])
def list_terms(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(TermsDocument)
    if active_only:
        query = query.filter(TermsDocument.is_active == True)
    return query.order_by(TermsDocument.category, TermsDocument.created_at.desc()).all()

@router.get("/{slug}", response_model=TermsDocumentOut)
def get_term_by_slug(slug: str, db: Session = Depends(get_db)):
    term = db.query(TermsDocument).filter(TermsDocument.slug == slug).first()
    if not term:
        raise HTTPException(status_code=404, detail="Terms document not found")
    return term

@router.post("/accept", response_model=TermsAcceptanceOut)
def accept_terms(
    acceptance: TermsAcceptanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify terms exist
    terms = db.query(TermsDocument).filter(TermsDocument.id == acceptance.terms_id).first()
    if not terms:
        raise HTTPException(status_code=404, detail="Terms document not found")
    
    # Check if already accepted
    existing = db.query(TermsAcceptance).filter(
        TermsAcceptance.user_id == current_user.id,
        TermsAcceptance.terms_id == acceptance.terms_id
    ).first()
    
    if existing:
        # Update if version changed
        if existing.version_accepted != acceptance.version_accepted:
            existing.version_accepted = acceptance.version_accepted
            db.commit()
            db.refresh(existing)
        return existing
    
    new_acceptance = TermsAcceptance(
        user_id=current_user.id,
        terms_id=acceptance.terms_id,
        version_accepted=acceptance.version_accepted
    )
    db.add(new_acceptance)
    db.commit()
    db.refresh(new_acceptance)
    return new_acceptance

@router.get("/my/acceptances", response_model=List[TermsAcceptanceOut])
def my_acceptances(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(TermsAcceptance).filter(TermsAcceptance.user_id == current_user.id).all()

# ==================== ADMIN ENDPOINTS ====================

@router.post("/", response_model=TermsDocumentOut)
def create_terms(
    data: TermsDocumentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    existing = db.query(TermsDocument).filter(TermsDocument.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    doc = TermsDocument(**data.dict(), created_by=admin.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.put("/{doc_id}", response_model=TermsDocumentOut)
def update_terms(
    doc_id: int,
    update: TermsDocumentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    doc = db.query(TermsDocument).filter(TermsDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    for field, value in update.dict(exclude_unset=True).items():
        setattr(doc, field, value)
    
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_terms(
    doc_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    doc = db.query(TermsDocument).filter(TermsDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.is_active = False
    db.commit()
    return {"message": "Document deactivated"}

@router.get("/admin/stats")
def terms_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_docs = db.query(TermsDocument).count()
    active_docs = db.query(TermsDocument).filter(TermsDocument.is_active == True).count()
    total_acceptances = db.query(TermsAcceptance).count()
    
    # Acceptance by document
    from sqlalchemy import func
    doc_stats = db.query(
        TermsDocument.title,
        TermsDocument.version,
        func.count(TermsAcceptance.id).label("acceptances")
    ).outerjoin(TermsAcceptance, TermsDocument.id == TermsAcceptance.terms_id)\
     .group_by(TermsDocument.id).all()
    
    return {
        "total_documents": total_docs,
        "active_documents": active_docs,
        "total_acceptances": total_acceptances,
        "document_breakdown": [{"title": d.title, "version": d.version, "acceptances": d.acceptances} for d in doc_stats]
    }