from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.wallet import WalletCreate, WalletUpdate, WalletResponse
from app.schemas.auth import UserRegister, UserLogin, UserResponse

from pydantic import BaseModel
from typing import Optional, List

class BudgetCreate(BaseModel):
    month_key: str
    target_amount: float

class BudgetResponse(BaseModel):
    id: int
    month_key: str
    target_amount: float

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

__all__ = [
    "ExpenseCreate", "ExpenseUpdate", "ExpenseResponse",
    "WalletCreate", "WalletUpdate", "WalletResponse",
    "UserRegister", "UserLogin", "UserResponse",
    "BudgetCreate", "BudgetResponse", "CategorySpending", "InsightsSummary"
]
