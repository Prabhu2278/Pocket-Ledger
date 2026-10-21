import csv
import io
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.expense import Expense

class CsvService:
    @staticmethod
    def parse_csv_stream(file_content: bytes) -> List[Dict[str, Any]]:
        """Parses CSV text into standard transaction dictionaries."""
        text = file_content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(text))
        rows = []
        for r in reader:
            # Normalize column keys
            normalized = {k.strip().lower(): v.strip() for k, v in r.items() if k}
            amount = float(normalized.get("amount", 0.0) or 0.0)
            date_str = normalized.get("date") or normalized.get("spent_on") or datetime.now().strftime("%Y-%m-%d")
            category = normalized.get("category", "General")
            note = normalized.get("note") or normalized.get("title") or "Imported Transaction"
            tx_type = normalized.get("type", "EXPENSE").upper()
            rows.append({
                "amount": amount,
                "date": date_str,
                "category": category,
                "note": note,
                "type": tx_type
            })
        return rows

    @staticmethod
    def bulk_import(db: Session, transactions: List[Dict[str, Any]]) -> int:
        count = 0
        for tx in transactions:
            spent_date = datetime.strptime(tx["date"][:10], "%Y-%m-%d").date() if isinstance(tx["date"], str) else tx["date"]
            record = Expense(
                amount=tx["amount"],
                category=tx["category"],
                note=tx["note"],
                spent_on=spent_date,
                type=tx.get("type", "EXPENSE")
            )
            db.add(record)
            count += 1
        db.commit()
        return count
