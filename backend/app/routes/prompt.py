from fastapi import APIRouter, Depends, HTTPException
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.db_service import (
    save_prompt,
    save_evaluation,
    track_usage,
    check_usage_limit,
)
from app.services.llm_service import LLMService
from app.schemas.prompt_schema import PromptRequest
from app.graph.workflow import build_graph

router = APIRouter()

graph = build_graph()


@router.post("/enhance")
def enhance_prompt(request: PromptRequest, db: Session = Depends(get_db)):
    data = request.model_dump()

    metadata = data.get("metadata", {}) or {}
    user_id = metadata.get("user_id", "anonymous")
    user_api_key = metadata.get("api_key")

    allowed, mode = check_usage_limit(db, user_id, bool(user_api_key))

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="Free usage limit exceeded. Please provide your API key.",
        )

    llm = LLMService(api_key=user_api_key)

    result = graph.invoke(
        {
            "input": data,
            "debug": {},
            "evaluate": data.get("evaluate", False),
            "llm": llm,
        }
    )

    if mode == "free":
        track_usage(db, user_id)

    prompt_record = save_prompt(
        db, {**data, "enhanced_prompt": result.get("enhanced_prompt")}
    )

    if result.get("evaluation"):
        save_evaluation(db, prompt_record.id, result["evaluation"])

    return {
        "enhanced_prompt": result.get("enhanced_prompt"),
        "analysis": result.get("analysis"),
        "evaluation": result.get("evaluation"),
        "critic": result.get("critic"),
        "usage_mode": mode,
        "debug": result.get("debug"),
    }
