from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, or_
from datetime import datetime, date, timedelta
import calendar
from typing import Optional, List

from app.models import Expense, Budget
from app.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    BudgetCreate,
    BudgetResponse,
    InsightsSummary,
    CategorySpending,
    DaySpending,
    ActivityLog,
    CATEGORY_COLORS,
)

def serialize_expense(e: Expense) -> ExpenseResponse:
    spent_str = e.spent_on.isoformat() if isinstance(e.spent_on, (date, datetime)) else str(e.spent_on)
    return ExpenseResponse(
        id=e.id,
        amount=float(e.amount),
        amt=float(e.amount),
        category=e.category or "Other",
        cat=e.category or "Other",
        note=e.note or "",
        date=spent_str,
        spent_on=spent_str,
        payment_method=e.payment_method or "UPI",
        type=e.type or "EXPENSE",
        created_at=e.created_at,
    )

def get_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 500,
    category: Optional[str] = None,
    search: Optional[str] = None,
    month_key: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "desc"
) -> List[ExpenseResponse]:
    query = db.query(Expense)

    if category and category.strip().lower() != "all":
        query = query.filter(func.lower(Expense.category) == category.strip().lower())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(
            Expense.note.ilike(term),
            Expense.category.ilike(term)
        ))

    if month_key and "-" in month_key:
        try:
            year, month = map(int, month_key.split("-"))
            _, last_day = calendar.monthrange(year, month)
            start_d = date(year, month, 1)
            end_d = date(year, month, last_day)
            query = query.filter(Expense.spent_on >= start_d, Expense.spent_on <= end_d)
        except Exception:
            pass

    order_col = Expense.spent_on if sort_by in ("date", "spent_on") else (
        Expense.amount if sort_by in ("amt", "amount") else Expense.id
    )
    query = query.order_by(desc(order_col) if sort_order.lower() == "desc" else asc(order_col), desc(Expense.id))

    records = query.offset(skip).limit(limit).all()
    return [serialize_expense(r) for r in records]

def get_expense(db: Session, expense_id: int) -> Optional[ExpenseResponse]:
    r = db.query(Expense).filter(Expense.id == expense_id).first()
    return serialize_expense(r) if r else None

def create_expense(db: Session, expense_in: ExpenseCreate) -> ExpenseResponse:
    amt = expense_in.resolve_amount()
    cat = expense_in.resolve_category()
    note = expense_in.resolve_note()
    d = expense_in.resolve_date()

    expense = Expense(
        amount=amt,
        category=cat,
        note=note,
        spent_on=d,
        payment_method=expense_in.payment_method or "UPI",
        type=expense_in.type or "EXPENSE"
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return serialize_expense(expense)

def update_expense(db: Session, expense_id: int, expense_in: ExpenseUpdate) -> Optional[ExpenseResponse]:
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        return None

    if expense_in.amount is not None or expense_in.amt is not None:
        val = expense_in.amount if expense_in.amount is not None else expense_in.amt
        expense.amount = float(val)

    if expense_in.category is not None or expense_in.cat is not None:
        expense.category = (expense_in.category or expense_in.cat).strip()

    if expense_in.note is not None or expense_in.title is not None:
        expense.note = (expense_in.note if expense_in.note is not None else expense_in.title).strip()

    if expense_in.spent_on is not None or expense_in.date is not None:
        expense.spent_on = expense_in.spent_on or expense_in.date

    if expense_in.payment_method is not None:
        expense.payment_method = expense_in.payment_method

    if expense_in.type is not None:
        expense.type = expense_in.type

    db.commit()
    db.refresh(expense)
    return serialize_expense(expense)

def delete_expense(db: Session, expense_id: int) -> bool:
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True

# --- Budget & Insights CRUD ---

def get_or_create_budget(db: Session, month_key: str, default_target: float = 20000.0) -> BudgetResponse:
    b = db.query(Budget).filter(Budget.month_key == month_key).first()
    if not b:
        b = Budget(month_key=month_key, target_amount=default_target)
        db.add(b)
        db.commit()
        db.refresh(b)
    return BudgetResponse(
        id=b.id,
        month_key=b.month_key,
        target_amount=float(b.target_amount),
        budget=float(b.target_amount),
        created_at=b.created_at,
    )

def set_budget(db: Session, budget_in: BudgetCreate) -> BudgetResponse:
    target = budget_in.resolve_target()
    b = db.query(Budget).filter(Budget.month_key == budget_in.month_key).first()
    if b:
        b.target_amount = target
    else:
        b = Budget(month_key=budget_in.month_key, target_amount=target)
        db.add(b)
    db.commit()
    db.refresh(b)
    return BudgetResponse(
        id=b.id,
        month_key=b.month_key,
        target_amount=float(b.target_amount),
        budget=float(b.target_amount),
        created_at=b.created_at,
    )

def get_insights(db: Session, month_key: str) -> InsightsSummary:
    b_resp = get_or_create_budget(db, month_key)
    target_budget = b_resp.target_amount

    # Month bounds
    year, month = map(int, month_key.split("-"))
    _, last_day = calendar.monthrange(year, month)
    start_d = date(year, month, 1)
    end_d = date(year, month, last_day)

    month_expenses = db.query(Expense).filter(
        Expense.spent_on >= start_d,
        Expense.spent_on <= end_d
    ).all()

    total_spent = sum(float(e.amount) for e in month_expenses)
    remaining = target_budget - total_spent
    pct_used = (total_spent / target_budget) if target_budget > 0 else 0.0

    # Category breakdown
    cat_totals = {}
    cat_counts = {}
    for e in month_expenses:
        c = e.category or "Other"
        cat_totals[c] = cat_totals.get(c, 0.0) + float(e.amount)
        cat_counts[c] = cat_counts.get(c, 0) + 1

    sorted_cats = sorted(cat_totals.keys(), key=lambda c: cat_totals[c], reverse=True)
    top_cat = sorted_cats[0] if sorted_cats else None

    breakdown = []
    for c in sorted_cats:
        amt = cat_totals[c]
        pct = round((amt / total_spent * 100), 1) if total_spent > 0 else 0.0
        color = CATEGORY_COLORS.get(c, "#64748b")
        breakdown.append(CategorySpending(
            category=c,
            amount=round(amt, 2),
            percentage=pct,
            count=cat_counts[c],
            color=color,
        ))

    # Last 7 days spending
    today = date.today()
    last_7_days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_expenses = db.query(Expense).filter(Expense.spent_on == d).all()
        day_amt = sum(float(e.amount) for e in day_expenses)
        day_name = d.strftime("%a")
        last_7_days.append(DaySpending(
            index=i,
            date=d.isoformat(),
            day_name=day_name,
            amount=round(day_amt, 2),
            is_today=(i == 0),
        ))

    # Recent activity logs from recent expenses
    recent_db_tx = db.query(Expense).order_by(desc(Expense.spent_on), desc(Expense.id)).limit(10).all()
    recent_logs = []
    for tx in recent_db_tx:
        note_str = f' "{tx.note}"' if tx.note else ""
        recent_logs.append(ActivityLog(
            t=int(datetime.combine(tx.spent_on, datetime.min.time()).timestamp() * 1000),
            txt=f"Spent ₹{round(float(tx.amount)):,} on {tx.category}{note_str}",
        ))

    return InsightsSummary(
        month_key=month_key,
        total_spent=round(total_spent, 2),
        budget_target=round(target_budget, 2),
        budget=round(target_budget, 2),
        remaining_budget=round(remaining, 2),
        budget_percentage_used=round(pct_used, 4),
        expense_count=len(month_expenses),
        top_category=top_cat,
        category_breakdown=breakdown,
        last_7_days=last_7_days,
        recent_activity=recent_logs,
    )
