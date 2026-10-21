from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    password = Column(String(255), nullable=False)
    currency = Column(String(10), default="INR", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    @property
    def name(self):
        return self.full_name or self.username or (self.email.split("@")[0] if self.email else "User")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    note = Column(String(255), default="", nullable=False)
    spent_on = Column(Date, nullable=False, index=True)
    payment_method = Column(String(30), default="UPI", nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String(20), default="EXPENSE", nullable=True, index=True)
    wallet_id = Column(Integer, nullable=True)
    to_wallet_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

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

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # Salary, Freelance, Business, Investments, Gifts, Other
    note = Column(String(255), default="", nullable=False)
    received_on = Column(Date, nullable=False, index=True)
    payment_method = Column(String(30), default="Bank Transfer", nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    @property
    def amt(self):
        return self.amount

    @property
    def cat(self):
        return self.category

    @property
    def date(self):
        return self.received_on

    @property
    def spent_on(self):
        return self.received_on

    @property
    def title(self):
        return self.note

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    month_key = Column(String(10), index=True, nullable=False)  # Format: "YYYY-MM"
    target_amount = Column(Float, default=20000.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    @property
    def budget(self):
        return self.target_amount
