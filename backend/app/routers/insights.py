from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.schemas import InsightsSummary, BudgetCreate, BudgetResponse
from app import crud

router = APIRouter(prefix="/insights", tags=["Insights & Budgets"])

@router.get("", response_model=InsightsSummary)
def read_insights(
    month_key: str = Query(None, description="Month format YYYY-MM"),
    db: Session = Depends(get_db)
):
    if not month_key:
        now = datetime.now()
        month_key = f"{now.year:04d}-{now.month:02d}"
    return crud.get_insights(db, month_key=month_key)

@router.get("/budget", response_model=BudgetResponse)
def read_budget(
    month_key: str = Query(None),
    db: Session = Depends(get_db)
):
    if not month_key:
        now = datetime.now()
        month_key = f"{now.year:04d}-{now.month:02d}"
    return crud.get_or_create_budget(db, month_key=month_key)

@router.post("/budget", response_model=BudgetResponse, status_code=status.HTTP_200_OK)
def update_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db)
):
    return crud.set_budget(db, budget_in=budget_in)
