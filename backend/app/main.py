from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import expenses, insights
from app.api.v1.router import api_router as v1_router

# Create tables on startup if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pocket Ledger API",
    description="Clean, modern REST API for tracking expenses, monthly budgets, and financial insights.",
    version="1.0.0"
)

# CORS middleware to allow Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under both /api and root / for maximum frontend compatibility
app.include_router(v1_router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(expenses.router)
app.include_router(insights.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "pocket-ledger-api"}

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Pocket Ledger API is running",
        "docs": "/docs",
        "endpoints": ["/api/expenses", "/api/insights"]
    }
