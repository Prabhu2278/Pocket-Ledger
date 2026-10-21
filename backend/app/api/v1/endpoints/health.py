from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health():
    return {"status": "ok", "app": "Pocket Ledger API", "version": "1.0.0"}
