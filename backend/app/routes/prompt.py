from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
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
from app.agents.explainer import ExplainerAgent

router = APIRouter()

graph = build_graph()
analyzer = AnalyzerAgent()
rewriter = RewriterAgent()
explainer = ExplainerAgent()


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

    user_api_key = metadata.get("api_key")

    # If no API key in request, try to retrieve saved API key from database
    if not user_api_key:
        db_user = db.query(models.User).filter_by(id=user.id).first()
        if db_user and db_user.api_key:
            user_api_key = db_user.api_key
            logger.info(f"Retrieved saved API key for user: {user_id}")
        else:
            logger.warning(f"No API key found for user: {user_id}")

    count = 0
    if not user_api_key:
        is_limited, count = is_rate_limited(user_id)
        if is_limited:
            raise HTTPException(
                status_code=429, detail=f"Rate limit exceeded. Try again later."
            )

    allowed, mode = check_usage_limit(db, user_id, bool(user_api_key))
    logger.info(f"User: {user_id}, Mode: {mode}, Has API Key: {bool(user_api_key)}")

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

    logger.info(f"Graph result explanation: {result.get('explanation')}")
    logger.info(f"Graph result insights: {result.get('insights')}")

    response_data = {
        "enhanced_prompt": result.get("enhanced_prompt"),
        "analysis": result.get("analysis"),
        "evaluation": result.get("evaluation"),
        "critic": result.get("critic"),
        "explanation": result.get("explanation") or "Enhancement applied successfully.",
        "insights": result.get("insights"),
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
    logger.info(f"Saved prompt {prompt_record.id} for user {user_id}")

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
        "explanation": result.get("explanation") or "Enhancement applied successfully.",
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

    response["rate_limit"] = {"current": count, "limit": 3}

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
    try:
        data = request.model_dump()
        user_id = str(user.id)

        # Check usage limits
        metadata = data.get("metadata", {}) or {}
        user_api_key = metadata.get("api_key")

        # If no API key in request, try to retrieve saved API key from database
        if not user_api_key:
            db_user = db.query(models.User).filter_by(id=user.id).first()
            if db_user and db_user.api_key:
                user_api_key = db_user.api_key
                logger.info(f"Retrieved saved API key for user: {user_id}")
            else:
                logger.warning(f"No API key found for user: {user_id}")

        if not user_api_key:
            is_limited, _ = is_rate_limited(user_id)
            if is_limited:
                raise HTTPException(
                    status_code=429, detail=f"Rate limit exceeded. Try again later."
                )

        allowed, mode = check_usage_limit(db, user_id, bool(user_api_key))
        logger.info(f"User: {user_id}, Mode: {mode}, Has API Key: {bool(user_api_key)}")

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="Free usage limit exceeded. Please provide your API key.",
            )

        llm = LLMService(api_key=user_api_key)

        async def stream_generator():
            try:
                # Collect streamed chunks
                enhanced_prompt_chunks = []

                # Minimal pipeline: analyzer + rewriter
                analysis, _ = analyzer.run(data, llm)

                async for chunk in rewriter.astream(data, analysis, llm):
                    enhanced_prompt_chunks.append(chunk)
                    yield chunk

                # Combine all chunks
                enhanced_prompt = "".join(enhanced_prompt_chunks)

                # Save prompt after streaming completes
                if enhanced_prompt and "Error" not in enhanced_prompt:
                    prompt_record = save_prompt(
                        db, {**data, "metadata": {"user_id": user_id}}
                    )
                    logger.info(f"Saved prompt {prompt_record.id} for user {user_id}")

                    # Save version
                    version = save_prompt_version(db, prompt_record.id, enhanced_prompt)

                    # Track usage
                    prompt_tokens = estimate_tokens(data.get("prompt", ""))
                    response_tokens = estimate_tokens(enhanced_prompt)

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

            except Exception as e:
                logger.error(f"Stream error: {str(e)}")
                yield f"\n\nError generating response: {str(e)}"

        return StreamingResponse(stream_generator(), media_type="text/plain")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stream setup error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Unable to start streaming response."},
        )
