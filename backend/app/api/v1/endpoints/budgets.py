from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.budget import BudgetResponse, BudgetUpdate
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("/{month_key}", response_model=BudgetResponse)
def get_budget(month_key: str, db: Session = Depends(get_db)):
    return BudgetService.get_by_month(db, month_key)

@router.post("/{month_key}", response_model=BudgetResponse)
def set_budget(month_key: str, data: BudgetUpdate, db: Session = Depends(get_db)):
    return BudgetService.set_budget(db, month_key, data.target_amount)
