import os
from dotenv import load_dotenv

load_dotenv()

_db_url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:Pra12.22@localhost:5432/expense_tracker")
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

class Settings:
    PROJECT_NAME: str = "Pocket Ledger API"
    DATABASE_URL: str = _db_url
    CORS_ORIGINS: list = ["*"]

settings = Settings()
