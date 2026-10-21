from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class WalletBase(BaseModel):
    name: str
    wallet_type: Optional[str] = "BANK"
    initial_balance: Optional[float] = 0.0
    color: Optional[str] = "#10b981"
    user_id: Optional[int] = None

class WalletCreate(WalletBase):
    pass

class WalletUpdate(BaseModel):
    name: Optional[str] = None
    wallet_type: Optional[str] = None
    initial_balance: Optional[float] = None
    color: Optional[str] = None

class WalletResponse(WalletBase):
    id: int
    current_balance: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
