from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.prompt_schema import PromptRequest
from app.graph.workflow import build_graph

router = APIRouter()

graph = build_graph()


@router.post("/enhance")
def enhance_prompt(request: PromptRequest):
    data = request.model_dump()

    result = graph.invoke(
        {"input": data, "debug": {}, "evaluate": data.get("evaluate", False)}
    )

    return {
        "enhanced_prompt": result.get("enhanced_prompt"),
        "analysis": result.get("analysis"),
        "evaluation": result.get("evaluation"),
        "critic": result.get("critic"),
        "debug": result.get("debug"),
    }
