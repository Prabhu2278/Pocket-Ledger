from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.wallet import WalletCreate, WalletUpdate, WalletResponse
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/wallets", tags=["Wallets"])

@router.get("", response_model=List[WalletResponse])
def get_all_wallets(db: Session = Depends(get_db)):
    return WalletService.get_all_wallets_with_balances(db)

@router.post("", response_model=WalletResponse)
def create_wallet(data: WalletCreate, db: Session = Depends(get_db)):
    return WalletService.create_wallet(db, data)

@router.put("/{wallet_id}", response_model=WalletResponse)
def update_wallet(wallet_id: int, data: WalletUpdate, db: Session = Depends(get_db)):
    return WalletService.update_wallet(db, wallet_id, data)

@router.delete("/{wallet_id}")
def delete_wallet(wallet_id: int, db: Session = Depends(get_db)):
    WalletService.delete_wallet(db, wallet_id)
    return {"message": "Wallet deleted successfully"}
