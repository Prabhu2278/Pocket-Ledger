from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User
from app.schemas.setting import SettingsUpdate, SettingsResponse
from app.deps import get_optional_current_user
from app import crud

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
def get_settings(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    setting = crud.get_user_settings(db, user_id)
    return SettingsResponse(
        id=setting.id,
        user_id=setting.user_id,
        theme=setting.theme or "dark",
        currency=setting.currency or "INR",
        updated_at=getattr(setting, "updated_at", None),
    )

@router.put("", response_model=SettingsResponse)
def update_settings(
    update_in: SettingsUpdate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    setting = crud.update_user_settings(db, user_id, update_in)
    return SettingsResponse(
        id=setting.id,
        user_id=setting.user_id,
        theme=setting.theme or "dark",
        currency=setting.currency or "INR",
        updated_at=getattr(setting, "updated_at", None),
    )
