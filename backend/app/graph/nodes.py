from app.agents.analyzer import AnalyzerAgent
from app.agents.rewriter import RewriterAgent
from app.agents.evaluator import EvaluatorAgent
from app.agents.critic import CriticAgent

analyzer = AnalyzerAgent()
rewriter = RewriterAgent()
evaluator = EvaluatorAgent()
critic = CriticAgent()


def analyzer_node(state):
    data = state["input"]

    analysis, debug = analyzer.run(data)

    return {
        "analysis": analysis,
        "debug": {**state.get("debug", {}), "analyzer": debug},
    }


def rewriter_node(state):
    data = state["input"]
    analysis = state["analysis"]

    enhanced_prompt, debug = rewriter.run(data, analysis)

    return {
        "enhanced_prompt": enhanced_prompt,
        "debug": {**state.get("debug", {}), "rewriter": debug},
    }
    
def evaluator_node(state):
    original = state["input"]["prompt"]
    enhanced = state["enhanced_prompt"]

    evaluation, debug = evaluator.run(original, enhanced)

    return {
        "evaluation": evaluation,
        "debug": {
            **state.get("debug", {}),
            "evaluator": debug
        }
    }
    
def critic_node(state):
    evaluation = state["evaluation"]

    critic_result, debug = critic.run(evaluation)

    return {
        "critic": critic_result,
        "debug": {
            **state.get("debug", {}),
            "critic": debug
        }
    }
