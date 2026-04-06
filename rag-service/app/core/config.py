from dataclasses import dataclass
import os


@dataclass
class Settings:
    lmstudio_base_url: str = "http://localhost:1234/v1"
    lmstudio_api_key: str = "lm-studio"
    embedding_model_name: str = "text-embedding-nomic-embed-text-v1.5"
    lmstudio_model: str = os.getenv("LMSTUDIO_MODEL", "qwen/qwen3-vl-4b")

    chroma_path: str = os.getenv("CHROMA_PATH", "./chroma_data")
    chroma_collection_name: str = os.getenv("CHROMA_COLLECTION_NAME", "forgerag_chunks")

    default_chunk_size: int = int(os.getenv("DEFAULT_CHUNK_SIZE", "800"))
    default_chunk_overlap: int = int(os.getenv("DEFAULT_CHUNK_OVERLAP", "120"))
    default_top_k: int = int(os.getenv("DEFAULT_TOP_K", "4"))


settings = Settings()