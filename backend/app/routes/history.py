from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.core.logger import logger
from app.services.db_service import (
    get_user_prompts,
    get_prompt_versions,
    get_best_version,
    get_top_prompts,
    delete_prompt,
    get_latest_version,
)

router = APIRouter()


@router.get("/prompts")
def get_history(db: Session = Depends(get_db), user=Depends(get_current_user)):
    user_id = str(user.id)
    logger.info(f"Fetching history for user_id: {user_id}")

    prompts = get_user_prompts(db, user_id)
    logger.info(f"Found {len(prompts)} prompts for user {user_id}")

    result = []
    for p in prompts:
        best = get_best_version(db, p.id)
        latest = get_latest_version(db, p.id) if not best else None
        version = best or latest
        result.append(
            {
                "prompt_id": p.id,
                "original_prompt": p.original_prompt,
                "mode": p.mode,
                "created_at": p.created_at,
                "best_version": (
                    {
                        "enhanced_prompt": version.enhanced_prompt if version else "",
                        "explanation": "",
                        "insights": "",
                        "score": version.score if version else 0,
                    }
                    if version
                    else None
                ),
            }
        )

    return result


@router.delete("/prompts/{prompt_id}")
def delete_history_item(
    prompt_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    user_id = str(user.id)
    removed = delete_prompt(db, prompt_id, user_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return {"status": "deleted"}


@router.get("/prompts/{prompt_id}/versions")
def get_versions(
    prompt_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    versions = get_prompt_versions(db, prompt_id)

    return [
        {
            "version": v.version_number,
            "enhanced_prompt": v.enhanced_prompt,
            "score": v.score,
            "is_best": v.is_best,
        }
        for v in versions
    ]


@router.get("/prompts/{prompt_id}/best")
def get_best(
    prompt_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    best = get_best_version(db, prompt_id)

    if not best:
        return {"message": "No best version found"}

    return {
        "version": best.version_number,
        "enhanced_prompt": best.enhanced_prompt,
        "score": best.score,
    }


@router.get("/debug/all-prompts")
def debug_all_prompts(db: Session = Depends(get_db)):
    """Debug endpoint - lists ALL prompts in database"""
    from app.db import models

    all_prompts = db.query(models.Prompt).all()
    logger.info(f"Total prompts in DB: {len(all_prompts)}")

    return [
        {
            "prompt_id": p.id,
            "user_id": p.user_id,
            "original_prompt": p.original_prompt,
            "mode": p.mode,
            "created_at": p.created_at,
        }
        for p in all_prompts
    ]


@router.get("/suggestions")
def get_suggestions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    results = get_top_prompts(db, str(user.id))

    reason = "High clarity and strong structure"

    suggestions = []

    for version, prompt in results:
        suggestions.append(
            {
                "prompt_id": prompt.id,
                "original_prompt": prompt.original_prompt,
                "best_version": version.enhanced_prompt,
                "score": version.score,
                "mode": prompt.mode,
                "why": reason,
            }
        )

    return suggestions
