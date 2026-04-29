from app.core.prompt_loader import load_prompt


class DifficultyDetector:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/difficulty_prompt.txt")

    def run(self, prompt: str, llm):
        try:
            formatted = self.prompt_template.format(prompt=prompt)
            output = llm.generate(formatted).strip().lower()

            if output not in ["simple", "medium", "complex"]:
                return "medium"

            return output

        except Exception:
            return "medium"
