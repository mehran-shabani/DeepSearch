"""
Document ingestion service.
"""
import numpy as np
from sqlalchemy.orm import Session

from app.core.embeddings import embed
from app.models.document import Document
from app.services.faiss_index import index_manager


async def ingest_document(
    content: str, doc_metadata: dict, db: Session
) -> Document:
    """
    Ingest a document: generate embedding, store in DB, and add to Faiss index.

    Args:
        content: Document content text
        doc_metadata: Document metadata dictionary
        db: Database session

    Returns:
        Created Document instance
    """
    # Generate embedding
    embedding_vector = await embed(content)

    # Create document in database
    document = Document(
        content=content,
        doc_metadata=doc_metadata,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Add to Faiss index
    vector_array = np.array([embedding_vector], dtype=np.float32)
    index_manager.add_vectors(vector_array, [document.id])

    return document
