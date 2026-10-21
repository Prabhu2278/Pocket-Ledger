from pydantic import BaseModel, Field
import datetime as dt
from typing import Optional, List, Any

# Standard Prototype Category Colors
CATEGORY_COLORS = {
    "Food": "#b42c45",
    "Transport": "#2563eb",
    "Home": "#0d7a6f",
    "Fun": "#9333ea",
    "Health": "#15803d",
    "Shopping": "#b45309",
    "Other": "#64748b",
}

class ExpenseBase(BaseModel):
    amount: Optional[float] = None
    amt: Optional[float] = None
    category: Optional[str] = None
    cat: Optional[str] = None
    note: Optional[str] = ""
    title: Optional[str] = None
    date: Optional[dt.date] = None
    spent_on: Optional[dt.date] = None
    payment_method: Optional[str] = "UPI"
    type: Optional[str] = "EXPENSE"

class ExpenseCreate(ExpenseBase):
    def resolve_amount(self) -> float:
        val = self.amount if self.amount is not None else self.amt
        if val is None or float(val) <= 0:
            raise ValueError("Amount must be greater than 0")
        return float(val)

    def resolve_category(self) -> str:
        return (self.category or self.cat or "Other").strip()

    def resolve_note(self) -> str:
        return (self.note or self.title or "").strip()

    def resolve_date(self) -> dt.date:
        return self.spent_on or self.date or dt.date.today()

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    amt: Optional[float] = None
    category: Optional[str] = None
    cat: Optional[str] = None
    note: Optional[str] = None
    title: Optional[str] = None
    date: Optional[dt.date] = None
    spent_on: Optional[dt.date] = None
    payment_method: Optional[str] = None
    type: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    amt: float
    category: str
    cat: str
    note: str
    date: str
    spent_on: str
    payment_method: Optional[str] = "UPI"
    type: Optional[str] = "EXPENSE"
    created_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    month_key: str
    target_amount: Optional[float] = None
    budget: Optional[float] = None
    amount: Optional[float] = None

class BudgetCreate(BudgetBase):
    def resolve_target(self) -> float:
        val = self.target_amount if self.target_amount is not None else (self.budget if self.budget is not None else self.amount)
        if val is None or float(val) < 0:
            return 20000.0
        return float(val)

class BudgetResponse(BaseModel):
    id: int
    month_key: str
    target_amount: float
    budget: float
    created_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True

class CategorySpending(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int
    color: str

class DaySpending(BaseModel):
    index: int
    date: str
    day_name: str
    amount: float
    is_today: bool

class ActivityLog(BaseModel):
    t: int
    txt: str

class InsightsSummary(BaseModel):
    month_key: str
    total_spent: float
    budget_target: float
    budget: float
    remaining_budget: float
    budget_percentage_used: float
    expense_count: int
    top_category: Optional[str] = None
    category_breakdown: List[CategorySpending] = []
    last_7_days: List[DaySpending] = []
    recent_activity: List[ActivityLog] = []
