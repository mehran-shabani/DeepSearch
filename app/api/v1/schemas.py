"""
Pydantic schemas for API request/response models.
"""
from typing import Any, Optional

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Search request schema."""

    query: str = Field(..., description="Search query text", min_length=1)
    top_k: int = Field(default=5, description="Number of results to return", ge=1, le=100)
    filter: Optional[dict[str, Any]] = Field(default=None, description="Optional metadata filter")


class SearchResult(BaseModel):
    """Single search result schema."""

    id: int = Field(..., description="Document ID")
    content: str = Field(..., description="Document content")
    score: float = Field(..., description="Similarity score")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Document metadata")


class SearchResponse(BaseModel):
    """Search response schema."""

    results: list[SearchResult] = Field(..., description="List of search results")
    query: str = Field(..., description="Original query")
    total: int = Field(..., description="Total number of results returned")


class IngestRequest(BaseModel):
    """Ingest request schema."""

    content: str = Field(..., description="Document content to index", min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict, description="Optional document metadata")


class IngestResponse(BaseModel):
    """Ingest response schema."""

    id: int = Field(..., description="Document ID")
    message: str = Field(..., description="Success message")
