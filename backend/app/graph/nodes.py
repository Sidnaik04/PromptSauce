from app.agents.analyzer import AnalyzerAgent
from app.agents.rewriter import RewriterAgent
from app.agents.evaluator import EvaluatorAgent
from app.agents.critic import CriticAgent
from app.services.llm_service import LLMService

analyzer = AnalyzerAgent()
rewriter = RewriterAgent()
evaluator = EvaluatorAgent()
critic = CriticAgent()


def analyzer_node(state):
    data = state["input"]
    llm = state["llm"]

    analysis, debug = analyzer.run(data, llm)

    return {
        "analysis": analysis,
        "debug": {**state.get("debug", {}), "analyzer": debug},
    }


def rewriter_node(state):
    data = state["input"]
    analysis = state["analysis"]
    llm = state["llm"]

    enhanced_prompt, debug = rewriter.run(data, analysis, llm)

    return {
        "enhanced_prompt": enhanced_prompt,
        "debug": {**state.get("debug", {}), "rewriter": debug},
    }


def evaluator_node(state):
    original = state["input"]["prompt"]
    enhanced = state["enhanced_prompt"]
    llm = state["llm"]

    evaluation, debug = evaluator.run(original, enhanced, llm)

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
