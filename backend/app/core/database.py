from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import urlparse
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from app.core.config import settings

Base = declarative_base()

engine = None
SessionLocal = None

def ensure_database_exists():
    """Checks if the target database exists; creates it if connected to postgres server."""
    try:
        parsed = urlparse(settings.DATABASE_URL)
        dbname = parsed.path.lstrip("/") or "expense_tracker"
        user = parsed.username or "postgres"
        password = parsed.password or ""
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432

        # Connect to default postgres DB to check/create target DB
        conn = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=password,
            host=host,
            port=port,
            connect_timeout=3,
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (dbname,))
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f'CREATE DATABASE "{dbname}";')
            print(f"[Database] Created database '{dbname}' successfully.")
        else:
            print(f"[Database] Database '{dbname}' already exists.")
        cursor.close()
        conn.close()
        return True, "Database verified"
    except Exception as exc:
        return False, str(exc)

def init_db():
    global engine, SessionLocal
    success, msg = ensure_database_exists()
    if not success:
        print(f"[Database Warning] Could not verify/create database: {msg}")

    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Ensure models are loaded
        import app.models  # noqa: F401
        Base.metadata.create_all(bind=engine)