from app.services.llm_service import LLMService
from app.core.prompt_loader import load_prompt
from app.core.modes import get_mode_config


class RewriterAgent:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/rewriter_prompt.txt")

    def build_prompt(self, input_data: dict, analysis: dict) -> str:
        mode = input_data.get("mode")
        mode_config = get_mode_config(mode)

        role = (
            mode_config["role"]
            if mode_config
            else analysis.get("recommended_structure", {}).get("role")
        )
        constraints = (
            mode_config["constraints"]
            if mode_config
            else analysis.get("recommended_structure", {}).get("constraints")
        )

        return self.prompt_template.format(
            prompt=input_data.get("prompt"),
            mode=mode,
            context=input_data.get("context"),
            preferences=input_data.get("preferences"),
            intent=analysis.get("intent"),
            domain=analysis.get("domain"),
            complexity=analysis.get("complexity_level"),
            missing_context=analysis.get("missing_context"),
            recommended_structure={"role": role, "constraints": constraints},
        )

    def run(self, input_data: dict, analysis: dict, llm: LLMService):
        prompt = self.build_prompt(input_data, analysis)

        output = llm.generate(prompt)

        debug = {"rewriter_prompt": prompt, "rewriter_output": output}

        return output.strip(), debug

    def stream(self, input_data: dict, analysis: dict):
        prompt = self.build_prompt(input_data, analysis)

        for chunk in self.llm.stream(prompt):
            yield chunk
