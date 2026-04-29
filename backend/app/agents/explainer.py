from app.core.prompt_loader import load_prompt


class ExplainerAgent:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/explainer_prompt.txt")

    def run(self, original: str, enhanced: str, llm):
        try:
            prompt = self.prompt_template.format(original=original, enhanced=enhanced)

            output = llm.generate(prompt)
            return output.strip(), {}

        except Exception as e:
            return "Could not generate explanation.", {"error": str(e)}
