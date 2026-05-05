import os

from tempfile import NamedTemporaryFile
from app.models.schemas import (
    GenerateRequest,
    EmbedRequest,
    IngestRequest,
    RetrieveRequest,
    RetrieveResponse,
    RetrievedChunk,
    RagQueryRequest,
    UploadDocumentResponse,
)
from app.services.lmstudio_client import LMStudioClient
from app.services.embedding_service import EmbeddingService
from app.services.chunking_service import ChunkingService
from app.services.vector_store import VectorStore
from app.services.rag_pipeline import RagPipeline

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, HTTPException
from app.services.file_ingestion_service import FileIngestionService

app = FastAPI(title="ForgeRAG Python Service")

llm_client = LMStudioClient()
embedding_service = EmbeddingService()
chunking_service = ChunkingService()
vector_store = VectorStore()
rag_pipeline = RagPipeline(
    embedding_service=embedding_service,
    vector_store=vector_store,
    llm_client=llm_client,
)

file_ingestion_service = FileIngestionService()

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate(req: GenerateRequest):
    answer = llm_client.generate(req.prompt)
    return {"answer": answer}


@app.post("/embed")
def embed(req: EmbedRequest):
    if req.is_query:
        vector = embedding_service.embed_query(req.text)
    else:
        vector = embedding_service.embed_document(req.text)

    return {
        "dimension": len(vector),
        "embedding": vector,
    }


@app.post("/ingest")
def ingest(req: IngestRequest):
    try:
        return rag_pipeline.ingest_document(
            document_id=req.document_id,
            filename=req.filename,
            text=req.text,
            source_type=req.source_type,
            chunk_size=req.chunk_size,
            chunk_overlap=req.chunk_overlap,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/retrieve", response_model=RetrieveResponse)
def retrieve(req: RetrieveRequest):
    results = rag_pipeline.retrieve(req.query, top_k=req.top_k)
    return RetrieveResponse(results=[RetrievedChunk(**item) for item in results])


@app.post("/rag/query")
def rag_query(req: RagQueryRequest):
    return rag_pipeline.answer(
        question=req.question,
        top_k=req.top_k,
        system_prompt=req.system_prompt,
    )

@app.get("/vector-store/count")
def vector_store_count():
    return {"count": vector_store.count()}


@app.get("/vector-store/peek")
def vector_store_peek(limit: int = 10):
    return vector_store.peek(limit=limit)

@app.delete("/vector-store/reset")
def vector_store_reset():
    vector_store.reset_collection()
    return {"status": "reset"}

@app.post("/documents/upload", response_model=UploadDocumentResponse)
async def upload_document(
        file: UploadFile = File(...),
        document_id: str = Form(...),
        chunk_size: int = Form(800),
        chunk_overlap: int = Form(120),
):
    print(f"Received file: {file.filename}, document_id: {document_id}, chunk_size: {chunk_size}, chunk_overlap: {chunk_overlap}")
    try:
        # Lire le contenu du fichier depuis la mémoire
        content = await file.read()

        print(f"File content size: {len(content)} bytes")

        # Optionnel : Valider le fichier en mémoire
        file_ingestion_service.validate_file(content, file.filename)

        print("File validation passed")

        # Extraire le texte du fichier (en mémoire)
        text = await file_ingestion_service.extract_text(content, file.filename)

        # Traiter le fichier (par exemple, avec un pipeline RAG)
        result = rag_pipeline.ingest_document(
            document_id=document_id,
            filename=file.filename or "unknown",
            text=text,
            source_type="file",
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        # Retourner la réponse
        return UploadDocumentResponse(**result)

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")