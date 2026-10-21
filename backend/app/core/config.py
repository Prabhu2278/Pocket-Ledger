import os

class Settings:
    PROJECT_NAME: str = "Pocket Ledger API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./expenses.db")
    CORS_ORIGINS: list = ["*"]

settings = Settings()
