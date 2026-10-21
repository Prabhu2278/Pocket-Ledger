from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, or_
from datetime import datetime, date
from typing import Optional, List
from app.models import Expense, Budget
from app.schemas import ExpenseCreate, ExpenseUpdate, BudgetCreate, InsightsSummary, CategorySpending

# --- Expense CRUD ---

def get_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    month_key: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "desc"
) -> List[Expense]:
    query = db.query(Expense)

    if category and category.lower() != "all":
        query = query.filter(func.lower(Expense.category) == category.lower())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(
            Expense.title.ilike(term),
            Expense.category.ilike(term),
            Expense.notes.ilike(term)
        ))

    if month_key:
        try:
            year, month = map(int, month_key.split("-"))
            import calendar
            _, last_day = calendar.monthrange(year, month)
            start_d = date(year, month, 1)
            end_d = date(year, month, last_day)
            query = query.filter(Expense.date >= start_d, Expense.date <= end_d)
        except Exception:
            pass

    order_col = Expense.date if sort_by == "date" else Expense.amount if sort_by == "amount" else Expense.id
    query = query.order_by(desc(order_col) if sort_order == "desc" else asc(order_col))

    return query.offset(skip).limit(limit).all()

def get_expense(db: Session, expense_id: int) -> Optional[Expense]:
    return db.query(Expense).filter(Expense.id == expense_id).first()

def create_expense(db: Session, expense_in: ExpenseCreate) -> Expense:
    expense = Expense(
        title=expense_in.title,
        amount=expense_in.amount,
        category=expense_in.category,
        date=expense_in.date,
        payment_method=expense_in.payment_method,
        notes=expense_in.notes or ""
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def update_expense(db: Session, expense_id: int, expense_in: ExpenseUpdate) -> Optional[Expense]:
    expense = get_expense(db, expense_id)
    if not expense:
        return None
    data = expense_in.model_dump(exclude_unset=True)
    for field, val in data.items():
        setattr(expense, field, val)
    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, expense_id: int) -> bool:
    expense = get_expense(db, expense_id)
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True

# --- Budget & Insights CRUD ---

def get_or_create_budget(db: Session, month_key: str, default_target: float = 100000.0) -> Budget:
    budget = db.query(Budget).filter(Budget.month_key == month_key).first()
    if not budget:
        budget = Budget(month_key=month_key, target_amount=default_target)
        db.add(budget)
        db.commit()
        db.refresh(budget)
    return budget

def set_budget(db: Session, budget_in: BudgetCreate) -> Budget:
    budget = db.query(Budget).filter(Budget.month_key == budget_in.month_key).first()
    if budget:
        budget.target_amount = budget_in.target_amount
    else:
        budget = Budget(month_key=budget_in.month_key, target_amount=budget_in.target_amount)
        db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

def get_insights(db: Session, month_key: str) -> InsightsSummary:
    budget = get_or_create_budget(db, month_key)
    
    # Query all expenses in this month
    year, month = map(int, month_key.split("-"))
    import calendar
    _, last_day = calendar.monthrange(year, month)
    start_d = date(year, month, 1)
    end_d = date(year, month, last_day)

    expenses = db.query(Expense).filter(Expense.date >= start_d, Expense.date <= end_d).all()
    total_spent = sum(e.amount for e in expenses)
    remaining = max(0.0, budget.target_amount - total_spent)
    pct_used = round((total_spent / budget.target_amount * 100), 1) if budget.target_amount > 0 else 0.0

    # Category breakdown
    cat_totals = {}
    cat_counts = {}
    for e in expenses:
        cat_totals[e.category] = cat_totals.get(e.category, 0.0) + e.amount
        cat_counts[e.category] = cat_counts.get(e.category, 0) + 1

    breakdown = []
    top_cat = None
    max_cat_spent = -1.0
    for cat, amt in cat_totals.items():
        if amt > max_cat_spent:
            max_cat_spent = amt
            top_cat = cat
        breakdown.append(CategorySpending(
            category=cat,
            amount=round(amt, 2),
            percentage=round((amt / total_spent * 100), 1) if total_spent > 0 else 0.0,
            count=cat_counts[cat]
        ))

    breakdown.sort(key=lambda x: x.amount, reverse=True)

    return InsightsSummary(
        month_key=month_key,
        total_spent=round(total_spent, 2),
        budget_target=round(budget.target_amount, 2),
        remaining_budget=round(remaining, 2),
        budget_percentage_used=pct_used,
        expense_count=len(expenses),
        top_category=top_cat,
        category_breakdown=breakdown
    )
