from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from typing import List, Optional
from fastapi import HTTPException

from app.models.expense import Expense
from app.models.wallet import Wallet
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse

class ExpenseService:
    @staticmethod
    def format_expense_dto(db: Session, exp: Expense) -> ExpenseResponse:
        w_name = None
        to_w_name = None
        if exp.wallet_id:
            w = db.query(Wallet).filter(Wallet.id == exp.wallet_id).first()
            if w:
                w_name = w.name
        if exp.to_wallet_id:
            tw = db.query(Wallet).filter(Wallet.id == exp.to_wallet_id).first()
            if tw:
                to_w_name = tw.name

        return ExpenseResponse(
            id=exp.id,
            amount=exp.amount,
            category=exp.category,
            note=exp.note,
            spent_on=exp.spent_on,
            payment_method=exp.payment_method,
            user_id=exp.user_id,
            type=exp.type or "EXPENSE",
            wallet_id=exp.wallet_id,
            to_wallet_id=exp.to_wallet_id,
            wallet_name=w_name,
            to_wallet_name=to_w_name,
            created_at=exp.created_at,
        )

    @classmethod
    def get_expenses(
        cls,
        db: Session,
        category: Optional[str] = None,
        txn_type: Optional[str] = None,
        wallet_id: Optional[int] = None,
        search: Optional[str] = None,
        user_id: Optional[int] = None,
        username: Optional[str] = None,
    ) -> List[ExpenseResponse]:
        query = db.query(Expense)
        target_user_id = user_id
        if target_user_id is None and username and username.strip():
            matched_user = db.query(User).filter(func.lower(User.username) == username.strip().lower()).first()
            if matched_user:
                target_user_id = matched_user.id
            else:
                return []

        if target_user_id is not None:
            query = query.filter(Expense.user_id == target_user_id)
        if txn_type and txn_type.upper() != "ALL":
            query = query.filter(Expense.type == txn_type.upper())
        if wallet_id is not None:
            query = query.filter(or_(Expense.wallet_id == wallet_id, Expense.to_wallet_id == wallet_id))
        if category and category != "All":
            query = query.filter(Expense.category == category)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Expense.note.ilike(term),
                    Expense.category.ilike(term),
                    Expense.payment_method.ilike(term),
                )
            )

        records = query.order_by(desc(Expense.spent_on), desc(Expense.id)).all()
        return [cls.format_expense_dto(db, r) for r in records]

    @classmethod
    def create(cls, db: Session, expense_in: ExpenseCreate) -> ExpenseResponse:
        expense = Expense(
            amount=expense_in.amount,
            category=expense_in.category,
            note=expense_in.note,
            spent_on=expense_in.spent_on,
            payment_method=expense_in.payment_method or "UPI",
            user_id=expense_in.user_id,
            type=expense_in.type or "EXPENSE",
            wallet_id=expense_in.wallet_id,
            to_wallet_id=expense_in.to_wallet_id,
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return cls.format_expense_dto(db, expense)

    @classmethod
    def get_by_id(cls, db: Session, expense_id: int) -> ExpenseResponse:
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return cls.format_expense_dto(db, expense)

    @classmethod
    def update(cls, db: Session, expense_id: int, expense_in: ExpenseUpdate) -> ExpenseResponse:
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        update_data = expense_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)