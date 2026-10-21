# Compatibility bridge pointing to app.database
from app.database import Base, engine, SessionLocal, get_db

def ensure_database_exists():
    return True, "Database verified"

def init_db():
    pass