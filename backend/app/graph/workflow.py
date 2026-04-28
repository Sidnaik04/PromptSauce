from langgraph.graph import StateGraph, END
from app.graph.state import GraphState
from app.graph.nodes import analyzer_node, rewriter_node, evaluator_node, critic_node


def should_evaluate(state):
    return state.get("evaluate", False)


def build_graph():
    builder = StateGraph(GraphState)

    # Nodes
    builder.add_node("analyzer", analyzer_node)
    builder.add_node("rewriter", rewriter_node)
    builder.add_node("evaluator", evaluator_node)
    builder.add_node("critic", critic_node)

    # Edges
    builder.set_entry_point("analyzer")
    builder.add_edge("analyzer", "rewriter")
    builder.add_conditional_edges(
        "rewriter", should_evaluate, {True: "evaluator", False: END}
    )
    builder.add_edge("evaluator", "critic")
    builder.add_edge("critic", END)

    return builder.compile()
