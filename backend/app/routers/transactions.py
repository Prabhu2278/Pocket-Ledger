from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import datetime as dt
import calendar
import csv
import io
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import Expense, Income, User
from app.deps import get_optional_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

class TransactionItemCreate(BaseModel):
    type: str = Field(..., description="Transaction type: 'income' or 'expense'")
    amount: Optional[float] = None
    amt: Optional[float] = None
    category: Optional[str] = None
    cat: Optional[str] = None
    note: Optional[str] = None
    title: Optional[str] = None
    date: Optional[dt.date] = None
    spent_on: Optional[dt.date] = None
    received_on: Optional[dt.date] = None
    payment_method: Optional[str] = None

    def resolve_amount(self) -> float:
        val = self.amount if self.amount is not None else self.amt
        if val is None or val <= 0:
            raise ValueError("Amount must be greater than 0.")
        return float(val)

    def resolve_category(self) -> str:
        cat = self.category or self.cat or ("Other" if self.type.lower() == "expense" else "Salary")
        return cat.strip()

    def resolve_note(self) -> str:
        return (self.note if self.note is not None else self.title or "").strip()

    def resolve_date(self) -> dt.date:
        d = self.date or self.spent_on or self.received_on or dt.date.today()
        return d

class BulkTransactionImport(BaseModel):
    transactions: List[TransactionItemCreate]

def serialize_unified(item, item_type: str) -> dict:
    d = str(getattr(item, "received_on", None) or getattr(item, "spent_on", None) or getattr(item, "date", ""))
    note = getattr(item, "note", None) or getattr(item, "title", "") or ""
    return {
        "id": item.id,
        "type": item_type,
        "amount": float(item.amount),
        "amt": float(item.amount),
        "category": item.category,
        "cat": item.category,
        "note": note,
        "title": note,
        "date": d,
        "spent_on": d,
        "received_on": d,
        "payment_method": getattr(item, "payment_method", "UPI"),
        "user_id": item.user_id,
        "created_at": item.created_at.isoformat() if getattr(item, "created_at", None) else None,
    }

def fetch_transactions(
    db: Session,
    month_key: Optional[str] = None,
    item_type: str = "all",
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    limit: int = 500,
    user_id: Optional[int] = None,
) -> List[dict]:
    type_clean = (item_type or "all").strip().lower()
    results = []

    # Filter date range if month_key provided
    start_d, end_d = None, None
    if month_key and len(month_key.split("-")) == 2:
        try:
            year, month = map(int, month_key.split("-"))
            _, last_day = calendar.monthrange(year, month)
            start_d = dt.date(year, month, 1)
            end_d = dt.date(year, month, last_day)
        except Exception:
            pass

    # 1. Fetch Expenses
    if type_clean in ("all", "expense", "expenses"):
        eq = db.query(Expense)
        if user_id is not None:
            eq = eq.filter(Expense.user_id == user_id)
        if start_d and end_d:
            eq = eq.filter(Expense.spent_on >= start_d, Expense.spent_on <= end_d)
        if category and category != "All":
            eq = eq.filter(Expense.category == category)
        expenses = eq.all()
        for e in expenses:
            results.append(serialize_unified(e, "expense"))

    # 2. Fetch Incomes
    if type_clean in ("all", "income", "incomes"):
        iq = db.query(Income)
        if user_id is not None:
            iq = iq.filter(Income.user_id == user_id)
        if start_d and end_d:
            iq = iq.filter(Income.received_on >= start_d, Income.received_on <= end_d)
        if category and category != "All":
            iq = iq.filter(Income.category == category)
        incomes = iq.all()
        for i in incomes:
            results.append(serialize_unified(i, "income"))

    # 3. Search filtering
    if search:
        s = search.strip().lower()
        results = [
            r for r in results
            if s in r["note"].lower() or s in r["category"].lower() or s in str(r["amount"])
        ]

    # 4. Sorting
    reverse = (sort_order or "desc").lower() != "asc"
    if sort_by in ("amount", "amt"):
        results.sort(key=lambda x: x["amount"], reverse=reverse)
    else:
        results.sort(key=lambda x: (x["date"], x["id"]), reverse=reverse)

    return results[:limit]

@router.get("")
def get_transactions(
    month_key: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    type: Optional[str] = Query("all", description="Filter by type: 'all', 'income', 'expense'"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term in note or category"),
    sort_by: Optional[str] = Query("date", description="'date' or 'amount'"),
    sort_order: Optional[str] = Query("desc", description="'asc' or 'desc'"),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    return fetch_transactions(
        db=db,
        month_key=month_key,
        item_type=type or "all",
        category=category,
        search=search,
        sort_by=sort_by or "date",
        sort_order=sort_order or "desc",
        limit=limit,
        user_id=user_id,
    )

@router.post("", status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionItemCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    t_type = tx_in.type.strip().lower()

    amt = tx_in.resolve_amount()
    cat = tx_in.resolve_category()
    note = tx_in.resolve_note()
    d = tx_in.resolve_date()

    if t_type == "income":
        item = Income(
            amount=amt,
            category=cat,
            note=note,
            received_on=d,
            payment_method=tx_in.payment_method or "Bank Transfer",
            user_id=user_id,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return serialize_unified(item, "income")
    else:
        item = Expense(
            amount=amt,
            category=cat,
            note=note,
            spent_on=d,
            payment_method=tx_in.payment_method or "UPI",
            user_id=user_id,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return serialize_unified(item, "expense")

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def bulk_import_transactions(
    payload: BulkTransactionImport,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    created_count = 0

    for tx in payload.transactions:
        try:
            amt = tx.resolve_amount()
            cat = tx.resolve_category()
            note = tx.resolve_note()
            d = tx.resolve_date()
            t_type = tx.type.strip().lower()

            if t_type in ("income", "deposit", "credit"):
                item = Income(
                    amount=amt,
                    category=cat,
                    note=note,
                    received_on=d,
                    payment_method=tx.payment_method or "Bank Transfer",
                    user_id=user_id,
                )
                db.add(item)
            else:
                item = Expense(
                    amount=amt,
                    category=cat,
                    note=note,
                    spent_on=d,
                    payment_method=tx.payment_method or "UPI",
                    user_id=user_id,
                )
                db.add(item)
            created_count += 1
        except Exception:
            continue

    db.commit()
    return {
        "success": True,
        "imported": created_count,
        "message": f"Successfully imported {created_count} transactions.",
    }

@router.get("/export-csv")
def export_csv(
    month_key: Optional[str] = Query(None),
    type: Optional[str] = Query("all"),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    txs = fetch_transactions(
        db=db,
        month_key=month_key,
        item_type=type or "all",
        category=category,
        search=search,
        limit=1000,
        user_id=user_id,
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Type", "Category", "Amount", "Note", "Payment Method"])

    for tx in txs:
        writer.writerow([
            tx["date"],
            tx["type"].upper(),
            tx["category"],
            tx["amount"],
            tx["note"],
            tx.get("payment_method", ""),
        ])

    csv_data = output.getvalue()
    filename = f"pocket_ledger_transactions_{month_key or 'all'}.csv"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return PlainTextResponse(content=csv_data, media_type="text/csv", headers=headers)
