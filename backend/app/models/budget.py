from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=True)
    month_key = Column(String(10), unique=True, index=True, nullable=False)
    target_amount = Column(Float, default=100000.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
