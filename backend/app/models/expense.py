from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    note = Column(String(255), default="", nullable=False)
    spent_on = Column(Date, nullable=False, index=True)
    payment_method = Column(String(30), default="UPI", nullable=True)
    user_id = Column(Integer, nullable=True, index=True)
    type = Column(String(20), default="EXPENSE", nullable=False, index=True)  # EXPENSE, INCOME, TRANSFER
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="SET NULL"), nullable=True, index=True)
    to_wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    wallet = relationship("Wallet", foreign_keys=[wallet_id], back_populates="transactions")
    to_wallet = relationship("Wallet", foreign_keys=[to_wallet_id])

    @property
    def amt(self):
        return self.amount

    @property
    def cat(self):
        return self.category

    @property
    def date(self):
        return self.spent_on

    @property
    def title(self):
        return self.note
