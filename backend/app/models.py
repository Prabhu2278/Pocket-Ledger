from sqlalchemy import Column, Integer, Float, String, Date, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    payment_method = Column(String(30), default="UPI", nullable=True)
    notes = Column(String(255), default="", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    month_key = Column(String(10), unique=True, index=True, nullable=False)  # Format: "YYYY-MM"
    target_amount = Column(Float, default=100000.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
