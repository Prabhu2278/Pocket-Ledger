from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    month_key: str
    target_amount: float

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    target_amount: float

class BudgetResponse(BudgetBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
