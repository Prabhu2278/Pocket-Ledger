from fastapi import APIRouter
from app.api.v1.endpoints import expenses, wallets, budgets, auth, csv_tools, analytics, health

api_router = APIRouter()

api_router.include_router(expenses.router, prefix="", tags=["Expenses"])
api_router.include_router(wallets.router, prefix="", tags=["Wallets"])
api_router.include_router(budgets.router, prefix="", tags=["Budgets"])
api_router.include_router(auth.router, prefix="", tags=["Authentication"])
api_router.include_router(csv_tools.router, prefix="", tags=["CSV Tools"])
api_router.include_router(analytics.router, prefix="", tags=["Analytics"])
api_router.include_router(health.router, prefix="", tags=["Health"])
