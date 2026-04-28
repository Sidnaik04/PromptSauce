from typing import Optional, Generator
from app.core.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential


class LLMService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.provider = settings.LLM_PROVIDER

    def _get_client(self):
        if self.provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI

            return ChatGoogleGenerativeAI(
                model="gemini-2.5-flash", google_api_key=self.api_key, temperature=0.3
            )
        else:
            raise ValueError("Unsupported LLM provider")

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def generate(self, prompt: str) -> str:
        client = self._get_client()
        response = client.invoke(prompt)
        return response.content

    def stream(self, prompt: str) -> Generator[str, None, None]:
        client = self._get_client()
        for chunk in client.stream(prompt):
            yield chunk.content
