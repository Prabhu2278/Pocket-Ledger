from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    category: Optional[str] = Query(None, description="Filter by category"),
    type: Optional[str] = Query(None, description="Filter by type (EXPENSE, INCOME, TRANSFER)"),
    wallet_id: Optional[int] = Query(None, description="Filter by wallet ID"),
    search: Optional[str] = Query(None, description="Search term for note, category, or payment method"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    username: Optional[str] = Query(None, description="Filter by username"),
    db: Session = Depends(get_db),
):
    return ExpenseService.get_expenses(
        db=db,
        category=category,
        txn_type=type,
        wallet_id=wallet_id,
        search=search,
        user_id=user_id,
        username=username,
    )

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    return ExpenseService.create(db, expense_in)

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return ExpenseService.get_by_id(db, expense_id)

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db)):
    return ExpenseService.update(db, expense_id, expense_in)

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    ExpenseService.delete(db, expense_id)
    return None
