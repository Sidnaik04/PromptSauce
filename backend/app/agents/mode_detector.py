from app.core.prompt_loader import load_prompt


class ModeDetector:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/mode_detector_prompt.txt")

    def run(self, prompt: str, llm):
        try:
            formatted = self.prompt_template.format(prompt=prompt)
            output = llm.generate(formatted).strip().lower()

            return output

        except Exception:
            return "study"
