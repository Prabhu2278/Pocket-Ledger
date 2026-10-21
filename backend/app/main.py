from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import User, Expense, Income, Budget
from app.routers import expenses, income, insights, auth, transactions
from app.api.v1.router import api_router as v1_router

# Create tables in PostgreSQL on startup if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pocket Ledger API",
    description="Clean, modern REST API for tracking expenses, income, monthly budgets, user authentication, and financial insights.",
    version="1.1.0"
)

# CORS middleware to allow Vite frontend and credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under both /api and root / for maximum frontend compatibility
app.include_router(v1_router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(income.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(insights.router, prefix="/api")

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(transactions.router)
app.include_router(insights.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "pocket-ledger-api", "version": "1.1.0"}

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Pocket Ledger API is running",
        "docs": "/docs",
        "endpoints": ["/api/auth", "/api/expenses", "/api/income", "/api/insights"]
    }
