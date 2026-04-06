from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore
from app.services.lmstudio_client import LMStudioClient


class RagPipeline:
    def __init__(
            self,
            embedding_service: EmbeddingService,
            vector_store: VectorStore,
            llm_client: LMStudioClient,
    ) -> None:
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.llm_client = llm_client

    def retrieve(self, query: str, top_k: int = 4) -> list[dict]:
        query_embedding = self.embedding_service.embed_query(query)
        raw = self.vector_store.query(query_embedding=query_embedding, top_k=top_k)

        ids = raw.get("ids", [[]])[0]
        docs = raw.get("documents", [[]])[0]
        metadatas = raw.get("metadatas", [[]])[0]
        distances = raw.get("distances", [[]])[0] if raw.get("distances") else [0.0] * len(ids)

        results = []
        for idx, chunk_id in enumerate(ids):
            meta = metadatas[idx] or {}
            results.append({
                "chunk_id": chunk_id,
                "document_id": meta.get("document_id", ""),
                "filename": meta.get("filename", ""),
                "source_type": meta.get("source_type", ""),
                "text": docs[idx],
                "score": float(distances[idx]),
            })

        return results

    def answer(self, question: str, top_k: int = 4, system_prompt: str | None = None) -> dict:
        retrieved_chunks = self.retrieve(question, top_k=top_k)

        context_blocks = []
        for chunk in retrieved_chunks:
            context_blocks.append(
                f"[{chunk['chunk_id']}] file={chunk['filename']} doc={chunk['document_id']}\n{chunk['text']}"
            )

        context = "\n\n".join(context_blocks) if context_blocks else "No context found."

        user_prompt = (
            f"Context:\n{context}\n\n"
            f"Question:\n{question}\n\n"
            f"Instructions:\n"
            f"- Answer only from the context.\n"
            f"- If the answer is missing, say you don't know.\n"
            f"- Cite chunk ids when relevant.\n"
        )

        answer = self.llm_client.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )

        return {
            "answer": answer,
            "sources": retrieved_chunks,
        }

    def ingest_document(
            self,
            document_id: str,
            filename: str,
            text: str,
            source_type: str = "file",
            chunk_size: int = 800,
            chunk_overlap: int = 120,
    ) -> dict:
        from app.services.chunking_service import ChunkingService

        chunks = ChunkingService.chunk_text(
            text=text,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        if not chunks:
            raise ValueError("No chunk could be generated from input text.")

        self.vector_store.delete_by_document_id(document_id)

        ids: list[str] = []
        embeddings: list[list[float]] = []
        documents: list[str] = []
        metadatas: list[dict] = []

        for index, chunk in enumerate(chunks):
            chunk_id = f"{document_id}-chunk-{index}"
            embedding = self.embedding_service.embed_document(chunk)

            ids.append(chunk_id)
            embeddings.append(embedding)
            documents.append(chunk)
            metadatas.append(
                {
                    "document_id": document_id,
                    "filename": filename,
                    "source_type": source_type,
                    "chunk_index": index,
                }
            )

        self.vector_store.add_chunks(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

        return {
            "status": "ingested",
            "document_id": document_id,
            "filename": filename,
            "chunks_count": len(chunks),
        }