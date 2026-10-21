from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from fastapi import HTTPException

from app.models.wallet import Wallet
from app.models.expense import Expense
from app.schemas.wallet import WalletCreate, WalletUpdate, WalletResponse

class WalletService:
    @staticmethod
    def calculate_wallet_balance(db: Session, wallet: Wallet) -> float:
        incomes = db.query(func.coalesce(func.sum(Expense.amount), 0.0))\
            .filter(Expense.wallet_id == wallet.id, Expense.type == "INCOME").scalar()

        expenses = db.query(func.coalesce(func.sum(Expense.amount), 0.0))\
            .filter(Expense.wallet_id == wallet.id, Expense.type == "EXPENSE").scalar()

        transfers_in = db.query(func.coalesce(func.sum(Expense.amount), 0.0))\
            .filter(Expense.to_wallet_id == wallet.id, Expense.type == "TRANSFER").scalar()

        transfers_out = db.query(func.coalesce(func.sum(Expense.amount), 0.0))\
            .filter(Expense.wallet_id == wallet.id, Expense.type == "TRANSFER").scalar()

        return round(float(wallet.initial_balance) + float(incomes) - float(expenses) + float(transfers_in) - float(transfers_out), 2)

    @classmethod
    def to_response_dto(cls, db: Session, wallet: Wallet) -> WalletResponse:
        bal = cls.calculate_wallet_balance(db, wallet)
        return WalletResponse(
            id=wallet.id,
            name=wallet.name,
            wallet_type=wallet.wallet_type,
            initial_balance=wallet.initial_balance,
            color=wallet.color,
            user_id=wallet.user_id,
            current_balance=bal,
            created_at=wallet.created_at,
        )

    @classmethod
    def get_all(cls, db: Session, user_id: Optional[int] = None) -> List[WalletResponse]:
        query = db.query(Wallet)
        if user_id is not None:
            query = query.filter(Wallet.user_id == user_id)
        wallets = query.order_by(Wallet.id.asc()).all()
        return [cls.to_response_dto(db, w) for w in wallets]

    @classmethod
    def create(cls, db: Session, wallet_in: WalletCreate) -> WalletResponse:
        new_wallet = Wallet(
            name=wallet_in.name,
            wallet_type=wallet_in.wallet_type or "BANK",
            initial_balance=wallet_in.initial_balance or 0.0,
            color=wallet_in.color or "#10b981",
            user_id=wallet_in.user_id,
        )
        db.add(new_wallet)
        db.commit()
        db.refresh(new_wallet)
        return cls.to_response_dto(db, new_wallet)

    @classmethod
    def update(cls, db: Session, wallet_id: int, wallet_in: WalletUpdate) -> WalletResponse:
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        if wallet_in.name is not None:
            wallet.name = wallet_in.name
        if wallet_in.wallet_type is not None:
            wallet.wallet_type = wallet_in.wallet_type
        if wallet_in.initial_balance is not None:
            wallet.initial_balance = wallet_in.initial_balance
        if wallet_in.color is not None:
            wallet.color = wallet_in.color

        db.commit()
        db.refresh(wallet)
        return cls.to_response_dto(db, wallet)

    @classmethod
    def delete(cls, db: Session, wallet_id: int) -> None:
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        db.delete(wallet)
        db.commit()
