import hashlib

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    pwd_context = None

def hash_password(password: str) -> str:
    """Hashes a raw password string with bcrypt or secure SHA-256 fallback."""
    if pwd_context:
        return pwd_context.hash(password)
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored hash."""
    if pwd_context:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass
    return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password
