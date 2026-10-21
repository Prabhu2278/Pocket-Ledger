from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class ExpenseBase(BaseModel):
    amount: float
    category: str
    note: Optional[str] = ""
    spent_on: date
    payment_method: Optional[str] = "UPI"
    user_id: Optional[int] = None
    type: Optional[str] = "EXPENSE"
    wallet_id: Optional[int] = None
    to_wallet_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    note: Optional[str] = None
    spent_on: Optional[date] = None
    payment_method: Optional[str] = None
    type: Optional[str] = None
    wallet_id: Optional[int] = None
    to_wallet_id: Optional[int] = None

class ExpenseResponse(ExpenseBase):
    id: int
    wallet_name: Optional[str] = None
    to_wallet_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
