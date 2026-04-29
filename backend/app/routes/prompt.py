from fastapi import APIRouter, Depends, HTTPException
from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.logger import logger
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.services.db_service import (
    save_prompt,
    save_evaluation,
    track_usage,
    check_usage_limit,
)
from app.services.llm_service import LLMService
from app.services.cache_service import get_cached, set_cache
from app.schemas.prompt_schema import PromptRequest
from app.graph.workflow import build_graph

router = APIRouter()

graph = build_graph()


@router.post("/enhance")
def enhance_prompt(
    request: PromptRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    data = request.model_dump()

    if len(data.get("prompt", "")) > 2000:
        raise HTTPException(status_code=400, detail="Prompt too long")

    metadata = data.get("metadata", {}) or {}
    user_id = str(user.id)
    user_api_key = metadata.get("api_key")

    allowed, mode = check_usage_limit(db, user_id, bool(user_api_key))
    logger.info(f"User: {user_id}, Mode: {mode}")

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="Free usage limit exceeded. Please provide your API key.",
        )

    llm = LLMService(api_key=user_api_key)

    cache_input = {
        "prompt": data.get("prompt"),
        "mode": data.get("mode"),
        "context": data.get("context"),
        "preferences": data.get("preferences"),
        "evaluate": data.get("evaluate"),
    }

    cached = None
    if not user_api_key:
        cached = get_cached(cache_input)

    if cached:
        logger.info(f"Cache hit for user: {user_id}")
        return {**cached, "cached": True}

    result = graph.invoke(
        {
            "input": data,
            "debug": {},
            "evaluate": data.get("evaluate", False),
            "llm": llm,
        }
    )

    response_data = {
        "enhanced_prompt": result.get("enhanced_prompt"),
        "analysis": result.get("analysis"),
        "evaluation": result.get("evaluation"),
        "critic": result.get("critic"),
        "usage_mode": mode,
    }

    if not user_api_key:
        set_cache(cache_input, response_data)

    if mode == "free":
        track_usage(db, user_id)

    prompt_record = save_prompt(
        db,
        {
            **data,
            "enhanced_prompt": result.get("enhanced_prompt"),
            "metadata": {"user_id": user_id},
        },
    )

    if result.get("evaluation"):
        save_evaluation(db, prompt_record.id, result["evaluation"])

    response = {
        "enhanced_prompt": result.get("enhanced_prompt"),
        "analysis": result.get("analysis"),
        "evaluation": result.get("evaluation"),
        "critic": result.get("critic"),
        "usage_mode": mode,
    }

    if settings.DEBUG:
        response["debug"] = result.get("debug")

    return response
