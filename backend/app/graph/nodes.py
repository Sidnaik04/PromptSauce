from app.agents.analyzer import AnalyzerAgent
from app.agents.rewriter import RewriterAgent
from app.agents.evaluator import EvaluatorAgent
from app.agents.critic import CriticAgent
from app.agents.mode_detector import ModeDetector
from app.agents.difficulty_detector import DifficultyDetector
from app.agents.explainer import ExplainerAgent
from app.agents.insight_agent import InsightAgent
from app.services.llm_service import LLMService

analyzer = AnalyzerAgent()
rewriter = RewriterAgent()
evaluator = EvaluatorAgent()
critic = CriticAgent()
mode_detector = ModeDetector()
difficulty_detector = DifficultyDetector()
explainer = ExplainerAgent()
insight_agent = InsightAgent()


def analyzer_node(state):
    data = state["input"]
    llm = state["llm"]

    mode = state.get("mode") or state["input"]["mode"]
    data["mode"] = mode

    analysis, debug = analyzer.run(data, llm)

    return {
        "analysis": analysis,
        "debug": {**state.get("debug", {}), "analyzer": debug},
    }


async def rewriter_node(state):
    data = state["input"]
    analysis = state["analysis"]
    llm = state["llm"]

    mode = state.get("mode") or state["input"]["mode"]
    data["mode"] = mode

    try:
        enhanced_prompt, debug = await rewriter.arun(data, analysis, llm)
    except Exception as e:
        return {
            "enhanced_prompt": "Error generating prompt",
            "debug": {**state.get("debug", {}), "rewriter_error": str(e)},
        }

    return {
        "enhanced_prompt": enhanced_prompt,
        "debug": {**state.get("debug", {}), "rewriter": debug},
    }


def evaluator_node(state):
    original = state["input"]["prompt"]
    enhanced = state["enhanced_prompt"]
    mode = state["input"]["mode"]
    llm = state["llm"]

    # Skip evaluation if rewriter failed
    if "Error generating prompt" in enhanced:
        return {
            "evaluation": None,
            "debug": {
                **state.get("debug", {}),
                "evaluator": "Skipped due to rewriter error",
            },
        }

    evaluation, debug = evaluator.run(original, enhanced, mode, llm)

    return {
        "evaluation": evaluation,
        "debug": {**state.get("debug", {}), "evaluator": debug},
    }


def critic_node(state):
    evaluation = state["evaluation"]
    llm = state["llm"]

    critic_result, debug = critic.run(evaluation, llm)

    return {
        "critic": critic_result,
        "debug": {**state.get("debug", {}), "critic": debug},
    }


def mode_node(state):
    data = state["input"]
    llm = state["llm"]

    if data.get("mode") != "auto":
        return {"mode": data["mode"]}

    detected = mode_detector.run(data["prompt"], llm)

    return {"mode": detected}


def difficulty_node(state):
    data = state["input"]
    llm = state["llm"]

    difficulty = difficulty_detector.run(data["prompt"], llm)

    return {"difficulty": difficulty}


def explainer_node(state):
    original = state["input"]["prompt"]
    enhanced = state["enhanced_prompt"]
    llm = state["llm"]

    explanation, debug = explainer.run(original, enhanced, llm)

    return {
        "explanation": explanation,
        "debug": {**state.get("debug", {}), "explainer": debug},
    }


def insight_node(state):
    if not state.get("evaluation"):
        return {}

    llm = state["llm"]
    evaluation = state["evaluation"]

    insights, debug = insight_agent.run(evaluation, llm)

    return {"insights": insights, "debug": {**state.get("debug", {}), "insight": debug}}
