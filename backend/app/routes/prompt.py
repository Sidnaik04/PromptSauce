from fastapi import APIRouter
from app.schemas.prompt_schema import PromptRequest
from app.agents.analyzer import AnalyzerAgent

router = APIRouter()

analyzer = AnalyzerAgent()


@router.post("/enhance")
def enhance_prompt(request: PromptRequest):
    analysis, debug = analyzer.run(request.model_dump())

    return {"analysis": analysis, "debug": {"analyzer": debug}}
