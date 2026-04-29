from app.core.prompt_loader import load_prompt


class InsightAgent:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/insight_prompt.txt")

    def run(self, evaluation: dict, llm):
        try:
            prompt = self.prompt_template.format(evaluation=evaluation)
            output = llm.generate(prompt)

            return output.strip(), {}

        except Exception as e:
            return "No insights available.", {"error": str(e)}
