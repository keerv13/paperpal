# backend/utils/vectorstore.py
import os
from sentence_transformers import SentenceTransformer

from chromadb import PersistentClient
from chromadb.config import Settings


CHROMA_DIR = os.getenv("CHROMA_DIR", "./chromadb")
# will auto‐flush writes to CHROMA_DIR; telemetry still off
client = PersistentClient(
    path=CHROMA_DIR,
    settings=Settings(anonymized_telemetry=False),
)


collection = client.get_or_create_collection(name="documents")
model      = SentenceTransformer("all-MiniLM-L6-v2")

def add_chunks_to_store(chunks, user_id, filename, document_id):
    texts      = [c["text"] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=False).tolist()
    metadatas  = [
        {
            "user_id":     user_id,
            "filename":    filename,
            "document_id": str(document_id),
            "section":     c["section"],
            "chunk_index": c["chunk_index"],
        }
        for c in chunks
    ]
    ids = [
        f"{user_id}_{document_id}_{c['section']}_{c['chunk_index']}" for c in chunks
    ]

    collection.add(
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
    )

