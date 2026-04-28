from app.services.llm_service import LLMService
from app.core.prompt_loader import load_prompt


class RewriterAgent:
    def __init__(self):
        self.llm = LLMService()
        self.prompt_template = load_prompt("app/core/prompts/rewriter_prompt.txt")

    def build_prompt(self, input_data: dict, analysis: dict) -> str:
        preferences = input_data.get("preferences") or {}

        tone = preferences.get("tone")
        output_format = preferences.get("output_format")

        return self.prompt_template.format(
            prompt=input_data.get("prompt"),
            mode=input_data.get("mode"),
            context=input_data.get("context"),
            preferences={
                "tone": tone if tone else "not specified",
                "output_format": output_format if output_format else "not specified",
            },
            intent=analysis.get("intent"),
            domain=analysis.get("domain"),
            complexity=analysis.get("complexity_level"),
            missing_context=analysis.get("missing_context"),
            recommended_structure=analysis.get("recommended_structure"),
        )

    def run(self, input_data: dict, analysis: dict):
        prompt = self.build_prompt(input_data, analysis)

        output = self.llm.generate(prompt)

        debug = {"rewriter_prompt": prompt, "rewriter_output": output}

        return output.strip(), debug

    def stream(self, input_data: dict, analysis: dict):
        prompt = self.build_prompt(input_data, analysis)

        for chunk in self.llm.stream(prompt):
            yield chunk
