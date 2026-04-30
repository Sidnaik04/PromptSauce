from sqlalchemy.orm import Session
from app.db import models


def save_prompt(db: Session, data: dict):
    prompt = models.Prompt(
        user_id=data.get("metadata", {}).get("user_id"),
        original_prompt=data.get("prompt"),
        mode=data.get("mode"),
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    return prompt


def save_prompt_version(
    db: Session, prompt_id: int, enhanced_prompt: str, score: float = None
):
    existing_versions = (
        db.query(models.PromptVersion).filter_by(prompt_id=prompt_id).count()
    )

    version = models.PromptVersion(
        prompt_id=prompt_id,
        version_number=existing_versions + 1,
        enhanced_prompt=enhanced_prompt,
        score=score,
    )

    db.add(version)
    db.commit()
    db.refresh(version)

    return version


def mark_best_version(db: Session, prompt_id: int, best_version_id: int):
    db.query(models.PromptVersion).filter_by(prompt_id=prompt_id).update(
        {"is_best": False}
    )

    db.query(models.PromptVersion).filter_by(id=best_version_id).update(
        {"is_best": True}
    )

    db.commit()


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


def get_user_prompts(db: Session, user_id: str):
    return (
        db.query(models.Prompt)
        .filter_by(user_id=user_id)
        .order_by(models.Prompt.created_at.desc())
        .all()
    )


def get_prompt_versions(db: Session, prompt_id: int):
    return (
        db.query(models.PromptVersion)
        .filter_by(prompt_id=prompt_id)
        .order_by(models.PromptVersion.version_number.asc())
        .all()
    )


def get_best_version(db: Session, prompt_id: int):
    return (
        db.query(models.PromptVersion)
        .filter_by(prompt_id=prompt_id, is_best=True)
        .first()
    )


def get_latest_version(db: Session, prompt_id: int):
    return (
        db.query(models.PromptVersion)
        .filter_by(prompt_id=prompt_id)
        .order_by(models.PromptVersion.version_number.desc())
        .first()
    )


def get_top_prompts(db, user_id: str, limit: int = 5):
    return (
        db.query(models.PromptVersion, models.Prompt)
        .join(models.Prompt, models.Prompt.id == models.PromptVersion.prompt_id)
        .filter(models.Prompt.user_id == user_id)
        .filter(models.PromptVersion.score != None)
        .order_by(
            models.PromptVersion.score.desc(), models.PromptVersion.created_at.desc()
        )
        .limit(limit)
        .all()
    )


def delete_prompt(db: Session, prompt_id: int, user_id: str) -> bool:
    prompt = db.query(models.Prompt).filter_by(id=prompt_id, user_id=user_id).first()
    if not prompt:
        return False

    db.query(models.PromptVersion).filter_by(prompt_id=prompt_id).delete(
        synchronize_session=False
    )
    db.query(models.Evaluation).filter_by(prompt_id=prompt_id).delete(
        synchronize_session=False
    )
    db.delete(prompt)
    db.commit()
    return True
