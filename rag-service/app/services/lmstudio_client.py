from openai import OpenAI
from app.core.config import settings


class LMStudioClient:
    def __init__(self) -> None:
        self.client = OpenAI(
            base_url=settings.lmstudio_base_url,
            api_key=settings.lmstudio_api_key,
        )
        self.model = settings.lmstudio_model

    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt or "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )
        return response.choices[0].message.content or ""