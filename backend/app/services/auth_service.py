from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import hash_password, verify_password
from app.core.exceptions import BadRequestException, UnauthorizedException

class AuthService:
    @staticmethod
    def register(db: Session, data: UserRegister) -> User:
        existing = db.query(User).filter(User.username == data.username).first()
        if existing:
            raise BadRequestException("Username already registered")
        user = User(
            username=data.username,
            password=hash_password(data.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, data: UserLogin) -> User:
        user = db.query(User).filter(User.username == data.username).first()
        if not user or not verify_password(data.password, user.password):
            raise UnauthorizedException("Invalid username or password")
        return user
