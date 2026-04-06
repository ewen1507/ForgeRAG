import chromadb
from app.core.config import settings


class VectorStore:
    def __init__(self) -> None:
        self.client = chromadb.PersistentClient(path=settings.chroma_path)
        self.collection = self.client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"description": "ForgeRAG chunks"},
        )

    def add_chunks(
            self,
            ids: list[str],
            embeddings: list[list[float]],
            documents: list[str],
            metadatas: list[dict],
    ) -> None:
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def query(self, query_embedding: list[float], top_k: int = 4) -> dict:
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
        )
    def count(self) -> int:
        return self.collection.count()

    def peek(self, limit: int = 10) -> dict:
        result = self.collection.peek(limit=limit)

        return {
            "ids": result["ids"],
            "documents": result["documents"],
            "metadatas": result["metadatas"],
            "count": len(result["ids"]),
        }

    def delete_by_document_id(self, document_id: str) -> None:
        self.collection.delete(
            where={"document_id": document_id}
        )

    def reset_collection(self) -> None:
        self.client.delete_collection(settings.chroma_collection_name)
        self.collection = self.client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"description": "ForgeRAG chunks"},
        )