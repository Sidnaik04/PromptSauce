from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.db import models
from sqlalchemy import func

router = APIRouter()


@router.get("/summary")
def usage_summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    user_id = str(user.id)

    total_requests = (
        db.query(func.count(models.UsageLog.id)).filter_by(user_id=user_id).scalar()
    )

    total_prompt_tokens = (
        db.query(func.sum(models.UsageLog.prompt_tokens))
        .filter_by(user_id=user_id)
        .scalar()
        or 0
    )

    total_response_tokens = (
        db.query(func.sum(models.UsageLog.response_tokens))
        .filter_by(user_id=user_id)
        .scalar()
        or 0
    )

    cache_hits = (
        db.query(func.count(models.UsageLog.id))
        .filter_by(user_id=user_id, cached=True)
        .scalar()
    )

    return {
        "total_requests": total_requests,
        "prompt_tokens": total_prompt_tokens,
        "response_tokens": total_response_tokens,
        "cache_hits": cache_hits,
    }
