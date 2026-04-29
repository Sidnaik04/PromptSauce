from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.logger import logger
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.services.db_service import (
    save_prompt,
    track_usage,
    check_usage_limit,
    save_prompt_version,
    mark_best_version,
)
from app.services.llm_service import LLMService
from app.services.rate_limiter import is_rate_limited
from app.services.pattern_service import extract_pattern, update_user_preferences
from app.services.redis_cache import get_cached, set_cache
from app.services.usage_service import estimate_tokens
from app.db import models
from app.schemas.prompt_schema import PromptRequest
from app.graph.workflow import build_graph
from app.agents.analyzer import AnalyzerAgent
from app.agents.rewriter import RewriterAgent

router = APIRouter()

graph = build_graph()
analyzer = AnalyzerAgent()
rewriter = RewriterAgent()


@router.post("/enhance")
async def enhance_prompt(
    request: PromptRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    data = request.model_dump()

    if len(data.get("prompt", "")) > 2000:
        raise HTTPException(status_code=400, detail="Prompt too long")

    metadata = data.get("metadata", {}) or {}
    user_id = str(user.id)

    is_limited, count = is_rate_limited(user_id)

    if is_limited:
        raise HTTPException(
            status_code=429, detail=f"Rate limit exceeded. Try again later."
        )

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
        # Log cached usage
        prompt_tokens = estimate_tokens(data.get("prompt", ""))
        response_tokens = estimate_tokens(cached.get("enhanced_prompt", ""))

        log = models.UsageLog(
            user_id=user_id,
            prompt_tokens=prompt_tokens,
            response_tokens=response_tokens,
            cached=True,
        )
        db.add(log)
        db.commit()

        return {**cached, "cached": True}

    result = await graph.ainvoke(
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

    # Log usage
    prompt_tokens = estimate_tokens(data.get("prompt", ""))
    response_tokens = estimate_tokens(result.get("enhanced_prompt", ""))

    log = models.UsageLog(
        user_id=user_id,
        prompt_tokens=prompt_tokens,
        response_tokens=response_tokens,
        cached=False,
    )
    db.add(log)
    db.commit()

    if mode == "free":
        track_usage(db, user_id)

    prompt_record = save_prompt(db, {**data, "metadata": {"user_id": user_id}})

    version = save_prompt_version(db, prompt_record.id, result.get("enhanced_prompt"))

    if result.get("evaluation"):
        scores = result["evaluation"]["scores"]["enhanced"]
        avg_score = sum(scores.values()) / len(scores)

        version.score = avg_score
        db.commit()

        mark_best_version(db, prompt_record.id, version.id)

        if avg_score >= 8:  # only learn from good outputs
            pattern = extract_pattern(result["enhanced_prompt"])
            update_user_preferences(db, user_id, pattern)

    response = {
        "enhanced_prompt": result.get("enhanced_prompt"),
        "explanation": result.get("explanation"),
        "insights": result.get("insights"),
        "evaluation": result.get("evaluation"),
        "usage_mode": mode,
    }

    # Normalize error responses
    if "Error generating prompt" in result.get("enhanced_prompt", ""):
        return {
            "status": "error",
            "error": "Unable to process request. Please try again.",
        }

    if not result.get("enhanced_prompt"):
        return {
            "status": "error",
            "error": "LLM service unavailable. Try again later.",
        }

    response["rate_limit"] = {"current": count, "limit": 20}

    if settings.DEBUG:
        response["debug"] = result.get("debug")

    return {
        "status": "success",
        "data": response,
    }


@router.post("/enhance/stream")
async def enhance_prompt_stream(
    request: PromptRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    data = request.model_dump()
    user_id = str(user.id)

    llm = LLMService()

    async def stream_generator():
        try:
            # Minimal pipeline: analyzer + rewriter
            analysis, _ = analyzer.run(data, llm)

            async for chunk in rewriter.astream(data, analysis, llm):
                yield chunk

        except Exception as e:
            logger.error(f"Stream error: {str(e)}")
            yield f"\nError generating response: {str(e)}"

    return StreamingResponse(stream_generator(), media_type="text/plain")
