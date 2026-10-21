from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Dict

class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    date: date
    payment_method: Optional[str] = "UPI"
    notes: Optional[str] = ""

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    month_key: str
    target_amount: float = Field(..., gt=0)

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategorySpending(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int

class InsightsSummary(BaseModel):
    month_key: str
    total_spent: float
    budget_target: float
    remaining_budget: float
    budget_percentage_used: float
    expense_count: int
    top_category: Optional[str] = None
    category_breakdown: List[CategorySpending] = []
