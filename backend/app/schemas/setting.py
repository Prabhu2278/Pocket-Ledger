from pydantic import BaseModel
from typing import Optional
import datetime as dt

class SettingsBase(BaseModel):
    theme: Optional[str] = "dark"
    currency: Optional[str] = "INR"

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    currency: Optional[str] = None

class SettingsResponse(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    theme: str = "dark"
    currency: str = "INR"
    updated_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True
