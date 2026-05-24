from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import UserSettings, PlatformSettings, User
from ..schemas import UserSettingsUpdate, UserSettingsOut, PlatformSettingsUpdate, PlatformSettingsOut
from ..auth import get_current_user, require_admin

router = APIRouter()

# ==================== USER SETTINGS ====================

@router.get("/me", response_model=Optional[UserSettingsOut])
def get_my_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        # Auto-create default settings
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/me", response_model=UserSettingsOut)
def update_my_settings(
    update: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    for field, value in update.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

# ==================== PLATFORM SETTINGS (Admin Only) ====================

@router.get("/platform", response_model=PlatformSettingsOut)
def get_platform_settings(db: Session = Depends(get_db)):
    settings = db.query(PlatformSettings).first()
    if not settings:
        settings = PlatformSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/platform", response_model=PlatformSettingsOut)
def update_platform_settings(
    update: PlatformSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    settings = db.query(PlatformSettings).first()
    if not settings:
        settings = PlatformSettings()
        db.add(settings)
    
    for field, value in update.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    
    settings.updated_by = admin.id
    db.commit()
    db.refresh(settings)
    return settings