from pydantic import BaseModel, Field, field_validator
from typing import Optional
import datetime as dt

SUPPORTED_CURRENCIES = ["INR", "USD", "EUR", "GBP"]

class CurrencySettingBase(BaseModel):
    currency_code: str = Field(default="INR")

    @field_validator("currency_code")
    def validate_code(cls, v: str) -> str:
        code = (v or "").strip().upper()
        if code not in SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported currency: {v}. Supported currencies are {', '.join(SUPPORTED_CURRENCIES)}")
        return code

class CurrencySettingUpdate(BaseModel):
    currency_code: Optional[str] = None
    currency: Optional[str] = None  # alias for backward-compatibility

    @field_validator("currency_code", "currency")
    def validate_code(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        code = v.strip().upper()
        if code not in SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported currency: {v}. Supported currencies are {', '.join(SUPPORTED_CURRENCIES)}")
        return code

    def get_currency_code(self) -> Optional[str]:
        return self.currency_code or self.currency

class CurrencySettingResponse(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    currency_code: str = "INR"
    currency: str = "INR"
    created_at: Optional[dt.datetime] = None
    updated_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True
