from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(60), nullable=False)
    wallet_type = Column(String(30), default="BANK", nullable=False)  # BANK, CASH, CREDIT_CARD, WALLET
    initial_balance = Column(Float, default=0.0, nullable=False)
    color = Column(String(20), default="#10b981", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="wallets")
    transactions = relationship(
        "Expense",
        foreign_keys="[Expense.wallet_id]",
        back_populates="wallet"
    )
