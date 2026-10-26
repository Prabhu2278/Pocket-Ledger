from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    from_wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="SET NULL"), nullable=True, index=True)
    to_wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Float, nullable=False)
    transferred_on = Column(Date, nullable=False, index=True)
    note = Column(String(255), default="", nullable=False)
    payment_method = Column(String(30), default="Wallet Transfer", nullable=True)
    category = Column(String(50), default="Transfer", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    from_wallet = relationship("Wallet", foreign_keys=[from_wallet_id])
    to_wallet = relationship("Wallet", foreign_keys=[to_wallet_id])
    user = relationship("User")

    # Compatibility properties for unified transactions & services
    @property
    def wallet_id(self):
        return self.from_wallet_id

    @wallet_id.setter
    def wallet_id(self, val):
        self.from_wallet_id = val

    @property
    def amt(self):
        return self.amount

    @property
    def cat(self):
        return self.category or "Transfer"

    @property
    def date(self):
        return self.transferred_on

    @property
    def spent_on(self):
        return self.transferred_on

    @property
    def received_on(self):
        return self.transferred_on

    @property
    def title(self):
        return self.note

    @property
    def type(self):
        return "TRANSFER"
