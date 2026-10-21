"""
Compatibility bridge pointing to app.core.security.
All password hashing, verification, and JWT management are canonically defined in app.core.security.
"""
from app.core.security import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

__all__ = [
    "SECRET_KEY",
    "ALGORITHM",
    "ACCESS_TOKEN_EXPIRE_MINUTES",
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
]
