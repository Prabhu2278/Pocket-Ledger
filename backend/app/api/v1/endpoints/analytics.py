from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.expense import Expense
from app.services.budget_service import BudgetService
from app.schemas.analytics import AnalyticsSummaryResponse, CategoryBreakdownItem

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary/{month_key}", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(month_key: str, db: Session = Depends(get_db)):
    budget = BudgetService.get_by_month(db, month_key)
    
    # Query all expenses for the month
    expenses = db.query(Expense).all()
    # Filter by month_key (spent_on starts with month_key)
    month_expenses = [
        e for e in expenses
        if e.spent_on and str(e.spent_on).startswith(month_key)
    ]
    
    total_spent = sum(e.amount for e in month_expenses if (e.type or "EXPENSE").upper() == "EXPENSE")
    total_income = sum(e.amount for e in month_expenses if (e.type or "").upper() == "INCOME")
    net_savings = total_income - total_spent
    
    target = budget.target_amount or 100000.0
    remaining = max(0.0, target - total_spent)
    utilization = (total_spent / target * 100) if target > 0 else 0.0
    
    # Category totals
    cat_map = {}
    for e in month_expenses:
        if (e.type or "EXPENSE").upper() == "EXPENSE":
            cat = e.category or "Other"
            cat_map[cat] = cat_map.get(cat, {"total": 0.0, "count": 0})
            cat_map[cat]["total"] += e.amount
            cat_map[cat]["count"] += 1
            
    cat_items = [
        CategoryBreakdownItem(
            category=k,
            total=v["total"],
            count=v["count"],
            percentage=round((v["total"] / total_spent * 100), 1) if total_spent > 0 else 0.0
        )
        for k, v in sorted(cat_map.items(), key=lambda x: x[1]["total"], reverse=True)
    ]
    
    return AnalyticsSummaryResponse(
        month_key=month_key,
        total_spent=total_spent,
        total_income=total_income,
        net_savings=net_savings,
        budget_target=target,
        budget_remaining=remaining,
        budget_utilization_pct=round(utilization, 1),
        categories=cat_items
    )
