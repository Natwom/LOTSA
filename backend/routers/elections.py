from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from sqlalchemy import func
from .. import models, schemas, database, auth
from ..cloudinary_utils import upload_file, delete_file

router = APIRouter()

@router.get("/", response_model=List[schemas.ElectionOut])
def list_elections(active: bool = False, db: Session = Depends(database.get_db)):
    query = db.query(models.Election)
    if active:
        query = query.filter(
            models.Election.is_active == True,
            models.Election.end_time > datetime.utcnow(),
        )
    elections = query.order_by(models.Election.created_at.desc()).all()

    for election in elections:
        election.candidates = db.query(models.Candidate).options(
            joinedload(models.Candidate.student)
        ).filter_by(election_id=election.id).all()

    return elections

@router.post("/", response_model=schemas.ElectionOut)
def create_election(
    election: schemas.ElectionCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
):
    db_election = models.Election(
        **election.model_dump(),
        created_by=current_user.id,
        is_active=True,
    )
    db.add(db_election)
    db.commit()
    db.refresh(db_election)
    db_election.candidates = []
    return db_election

@router.get("/{election_id}/candidates", response_model=List[schemas.CandidateOut])
def get_candidates(election_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Candidate).options(
        joinedload(models.Candidate.student)
    ).filter_by(election_id=election_id).all()

@router.post("/{election_id}/candidates", response_model=schemas.CandidateOut)
async def add_candidate(
    election_id: int,
    student_id: int = Form(...),
    manifesto: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    election = db.query(models.Election).filter(models.Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    existing = db.query(models.Candidate).filter_by(
        election_id=election_id, student_id=student_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already a candidate in this election")

    student = db.query(models.StudentProfile).filter(models.StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    photo_url = None
    photo_public_id = None
    if photo:
        upload = upload_file(photo, folder="lotsa/candidates")
        photo_url = upload["url"]
        photo_public_id = upload["public_id"]

    db_candidate = models.Candidate(
        election_id=election_id,
        student_id=student_id,
        manifesto=manifesto,
        photo_url=photo_url,
        photo_public_id=photo_public_id
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.delete("/{election_id}/candidates/{candidate_id}")
def remove_candidate(
    election_id: int,
    candidate_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    candidate = db.query(models.Candidate).filter(
        models.Candidate.id == candidate_id,
        models.Candidate.election_id == election_id
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if candidate.photo_public_id:
        delete_file(candidate.photo_public_id)

    db.delete(candidate)
    db.commit()
    return {"message": "Candidate removed"}

@router.post("/{election_id}/vote")
def vote(
    election_id: int,
    vote_data: schemas.VoteCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db),
):
    election = db.query(models.Election).filter(models.Election.id == election_id).first()
    if (
        not election
        or not election.is_active
        or election.end_time < datetime.utcnow()
    ):
        raise HTTPException(status_code=400, detail="Election not active")

    if election.require_membership:
        membership = db.query(models.MembershipCard).filter(
            models.MembershipCard.user_id == current_user.id,
            models.MembershipCard.is_active == True,
            models.MembershipCard.expiry_date > datetime.utcnow()
        ).first()
        if not membership:
            raise HTTPException(
                status_code=403,
                detail="Active membership card required to vote. Please apply for membership."
            )

    if not current_user.profile:
        raise HTTPException(status_code=400, detail="Student profile required to vote")

    existing = (
        db.query(models.Vote)
        .filter_by(election_id=election_id, student_id=current_user.profile.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already voted")

    vote = models.Vote(
        election_id=election_id,
        candidate_id=vote_data.candidate_id,
        student_id=current_user.profile.id,
    )
    db.add(vote)
    db.commit()
    return {"message": "Vote cast successfully"}

@router.get("/my-votes", response_model=List[schemas.VoteOut])
def my_votes(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db),
):
    if not current_user.profile:
        return []
    return db.query(models.Vote).filter_by(student_id=current_user.profile.id).all()

@router.get("/{election_id}/results")
def results(
    election_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db),
):
    election = (
        db.query(models.Election).filter(models.Election.id == election_id).first()
    )
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    if (
        current_user.role not in [models.UserRole.ADMIN, models.UserRole.LEADER]
        and election.end_time > datetime.utcnow()
    ):
        raise HTTPException(status_code=403, detail="Results not available yet")

    res = (
        db.query(models.Candidate, func.count(models.Vote.id).label("vote_count"))
        .outerjoin(models.Vote)
        .filter(models.Candidate.election_id == election_id)
        .group_by(models.Candidate.id)
        .all()
    )

    max_votes = max((r.vote_count for r in res), default=0)

    return [
        {
            "candidate_id": r.Candidate.id,
            "name": r.Candidate.student.full_name if r.Candidate.student else "Unknown",
            "photo_url": r.Candidate.photo_url,
            "votes": r.vote_count,
            "vote_percentage": round((r.vote_count / max_votes * 100), 1) if max_votes > 0 else 0,
        }
        for r in res
    ]

@router.get("/{election_id}/voters")
def get_voters(
    election_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
):
    election = db.query(models.Election).filter(models.Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    votes = db.query(models.Vote).options(
        joinedload(models.Vote.student),
        joinedload(models.Vote.candidate).joinedload(models.Candidate.student)
    ).filter_by(election_id=election_id).all()

    return {
        "election_title": election.title,
        "position": election.position,
        "total_votes": len(votes),
        "voters": [
            {
                "student_id": v.student_id,
                "name": v.student.full_name if v.student else "Unknown",
                "admission_number": v.student.admission_number if v.student else "Unknown",
                "course": v.student.course if v.student else "Unknown",
                "voted_at": v.voted_at,
                "candidate_voted": v.candidate.student.full_name if v.candidate and v.candidate.student else "Unknown"
            }
            for v in votes
        ]
    }