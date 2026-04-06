from pydantic import BaseModel, Field
from typing import List, Optional


class GenerateRequest(BaseModel):
    prompt: str


class EmbedRequest(BaseModel):
    text: str
    is_query: bool = True


class IngestRequest(BaseModel):
    document_id: str
    filename: str
    text: str
    source_type: str = "text"
    chunk_size: int = 800
    chunk_overlap: int = 120


class RetrievedChunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    source_type: str
    text: str
    score: float


class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 4


class RetrieveResponse(BaseModel):
    results: List[RetrievedChunk]


class RagQueryRequest(BaseModel):
    question: str
    top_k: int = 4
    system_prompt: Optional[str] = Field(
        default="You are a helpful RAG assistant. Answer only from the provided context. "
                "If the answer is not in the context, say that you don't know."
    )

class UploadDocumentResponse(BaseModel):
    status: str
    document_id: str
    filename: str
    chunks_count: int