"""
API endpoints for search and ingestion.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import (
    IngestRequest,
    IngestResponse,
    SearchRequest,
    SearchResponse,
    SearchResult,
)
from app.core.embeddings import embed
from app.models.document import Document, get_db
from app.services.faiss_index import index_manager
from app.services.ingest import ingest_document

router = APIRouter()

# Initialize Faiss index on startup
index_manager.load_or_create_index()


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest, db: Session = Depends(get_db)):
    """
    Search for documents using semantic similarity.

    Args:
        request: Search request with query and parameters
        db: Database session

    Returns:
        Search response with results
    """
    try:
        # Generate query embedding
        query_vector = await embed(request.query)

        # Search in Faiss index
        scores, doc_ids = await index_manager.search(query_vector, request.top_k)

        if not doc_ids:
            return SearchResponse(results=[], query=request.query, total=0)

        # Fetch documents from database
        documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()

        # Create mapping for quick lookup
        doc_map = {doc.id: doc for doc in documents}

        # Build results in order of relevance
        results: List[SearchResult] = []
        for doc_id, score in zip(doc_ids, scores):
            if doc_id in doc_map:
                doc = doc_map[doc_id]
                results.append(
                    SearchResult(
                        id=doc.id,
                        content=doc.content,
                        score=float(score),
                        metadata=doc.doc_metadata or {},
                    )
                )

        return SearchResponse(
            results=results,
            query=request.query,
            total=len(results),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/ingest", response_model=IngestResponse)
async def ingest(request: IngestRequest, db: Session = Depends(get_db)):
    """
    Ingest a new document into the search index.

    Args:
        request: Ingest request with document content and metadata
        db: Database session

    Returns:
        Ingest response with document ID
    """
    try:
        document = await ingest_document(
            content=request.content,
            doc_metadata=request.metadata,
            db=db,
        )

        return IngestResponse(
            id=document.id,
            message=f"Document {document.id} ingested successfully",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@router.get("/documents/{document_id}", response_model=SearchResult)
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Get a document by ID.

    Args:
        document_id: Document ID
        db: Database session

    Returns:
        Document details
    """
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return SearchResult(
        id=document.id,
        content=document.content,
        score=1.0,
        metadata=document.doc_metadata or {},
    )
