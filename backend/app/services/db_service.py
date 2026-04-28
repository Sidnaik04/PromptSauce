from sqlalchemy.orm import Session
from app.db import models


def save_prompt(db: Session, data: dict):
    prompt = models.Prompt(
        user_id=data.get("metadata", {}).get("user_id"),
        original_prompt=data.get("prompt"),
        enhanced_prompt=data.get("enhanced_prompt"),
        mode=data.get("mode"),
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    return prompt


def save_evaluation(db: Session, prompt_id: int, evaluation: dict):
    orig = evaluation["scores"]["original"]
    enh = evaluation["scores"]["enhanced"]

    original_score = sum(orig.values()) / 3
    enhanced_score = sum(enh.values()) / 3

    record = models.Evaluation(
        prompt_id=prompt_id,
        original_score=original_score,
        enhanced_score=enhanced_score,
        improvement_score=enhanced_score - original_score,
        feedback=evaluation.get("reasoning"),
    )

    db.add(record)
    db.commit()


def track_usage(db: Session, user_id: str):
    usage = db.query(models.Usage).filter_by(user_id=user_id).first()

    if not usage:
        usage = models.Usage(user_id=user_id, request_count=1)
        db.add(usage)
    else:
        usage.request_count += 1

    db.commit()
    return usage.request_count


FREE_LIMIT = 3


def check_usage_limit(db, user_id: str, has_api_key: bool):
    usage = db.query(models.Usage).filter_by(user_id=user_id).first()

    if has_api_key:
        return True, "user_key"

    if not usage:
        return True, "free"

    if usage.request_count < FREE_LIMIT:
        return True, "free"

    return False, "limit_exceeded"
