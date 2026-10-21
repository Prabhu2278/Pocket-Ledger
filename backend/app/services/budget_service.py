from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate

class BudgetService:
    @staticmethod
    def get_by_month(db: Session, month_key: str) -> Budget:
        budget = db.query(Budget).filter(Budget.month_key == month_key).first()
        if not budget:
            # Auto-create default 100,000 INR budget if non-existent
            budget = Budget(month_key=month_key, target_amount=100000.0)
            db.add(budget)
            db.commit()
            db.refresh(budget)
        return budget

    @staticmethod
    def set_budget(db: Session, month_key: str, target_amount: float) -> Budget:
        budget = db.query(Budget).filter(Budget.month_key == month_key).first()
        if budget:
            budget.target_amount = target_amount
        else:
            budget = Budget(month_key=month_key, target_amount=target_amount)
            db.add(budget)
        db.commit()
        db.refresh(budget)
        return budget
