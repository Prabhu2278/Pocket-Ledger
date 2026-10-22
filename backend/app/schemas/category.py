from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
import datetime as dt

CategoryType = Literal["income", "expense"]

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., description="'income' or 'expense'")
    icon: Optional[str] = None
    color: Optional[str] = None

    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        cleaned = (v or "").strip()
        if not cleaned:
            raise ValueError("Category name cannot be empty")
        return cleaned

    @field_validator("type")
    def validate_type(cls, v: str) -> str:
        val = (v or "").strip().lower()
        if val not in ("income", "expense"):
            raise ValueError("Category type must be either 'income' or 'expense'")
        return val

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("name")
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Category name cannot be empty")
        return cleaned

class CategoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    type: str
    icon: Optional[str] = None
    color: Optional[str] = None
    is_default: bool
    is_active: bool
    created_at: Optional[dt.datetime] = None
    updated_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True

class CategoryDeleteResponse(BaseModel):
    status: str
    message: str
    category_id: int
    is_active: bool
