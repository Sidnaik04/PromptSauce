from langgraph.graph import StateGraph, END
from app.graph.state import GraphState
from app.graph.nodes import (
    analyzer_node,
    rewriter_node,
    evaluator_node,
    critic_node,
    mode_node,
    difficulty_node,
    explainer_node,
    insight_node,
)


def should_evaluate(state):
    return state.get("evaluate", False)


def build_graph():
    builder = StateGraph(GraphState)

    # Nodes
    builder.add_node("analyzer", analyzer_node)
    builder.add_node("rewriter", rewriter_node)
    builder.add_node("evaluator", evaluator_node)
    builder.add_node("critic", critic_node)
    builder.add_node("mode_detector", mode_node)
    builder.add_node("difficulty_detector", difficulty_node)
    builder.add_node("explainer", explainer_node)
    builder.add_node("insight", insight_node)

    # Edges
    builder.set_entry_point("mode_detector")
    builder.add_edge("mode_detector", "difficulty_detector")
    builder.add_edge("difficulty_detector", "analyzer")
    builder.add_edge("analyzer", "rewriter")
    builder.add_edge("rewriter", "explainer")
    builder.add_conditional_edges(
        "explainer", should_evaluate, {True: "evaluator", False: END}
    )
    builder.add_edge("evaluator", "critic")
    builder.add_edge("critic", "insight")
    builder.add_edge("insight", END)

    return builder.compile()
