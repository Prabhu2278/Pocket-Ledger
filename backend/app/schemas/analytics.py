from pydantic import BaseModel
from typing import List, Dict

class CategoryBreakdownItem(BaseModel):
    category: str
    total: float
    percentage: float
    count: int

class AnalyticsSummaryResponse(BaseModel):
    month_key: str
    total_spent: float
    total_income: float
    net_savings: float
    budget_target: float
    budget_remaining: float
    budget_utilization_pct: float
    categories: List[CategoryBreakdownItem]
