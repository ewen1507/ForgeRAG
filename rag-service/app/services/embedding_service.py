import os

from openai import OpenAI
from app.core.config import settings


class EmbeddingService:
    def __init__(self) -> None:
        self.client = OpenAI(
            base_url=os.getenv("OPENAI_BASE_URL", "http://host.docker.internal:1234/v1"),
            api_key=os.getenv("OPENAI_API_KEY", "lm-studio"),
        )
        self.model = os.getenv(
            "EMBEDDING_MODEL",
            "text-embedding-nomic-embed-text-v1.5",
        )


    def embed_query(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            model=self.model,
            input=text,
        )
        return response.data[0].embedding

    def embed_document(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            model=self.model,
            input=text,
        )
        return response.data[0].embedding