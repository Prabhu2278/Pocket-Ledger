from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserRegister, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = AuthService.register(db, data)
    return user

@router.post("/login", response_model=UserResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.login(db, data)
    return user
