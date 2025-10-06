"""
Tests for search endpoint.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_embed(monkeypatch):
    """Mock the embed function to return fake embeddings."""
    async def fake_embed(text: str):
        # Return a fake embedding vector (1536 dimensions for text-embedding-3-small)
        return [0.1] * 1536
    
    # Monkeypatch the embed function
    monkeypatch.setattr("app.api.v1.endpoints.embed", fake_embed)
    return fake_embed


@pytest.fixture
def mock_index_manager(monkeypatch):
    """Mock the Faiss index manager."""
    mock_manager = MagicMock()
    
    async def fake_search(query_vector, top_k):
        # Return fake scores and doc IDs
        return [0.95, 0.89, 0.82], [1, 2, 3]
    
    mock_manager.search = fake_search
    monkeypatch.setattr("app.api.v1.endpoints.index_manager", mock_manager)
    return mock_manager


def test_search_endpoint_success(client, mock_embed, mock_index_manager, monkeypatch):
    """Test successful search request."""
    # Mock the database session and query
    mock_doc = MagicMock()
    mock_doc.id = 1
    mock_doc.content = "Test document content"
    mock_doc.metadata = {"source": "test"}
    
    mock_query = MagicMock()
    mock_query.filter.return_value.all.return_value = [mock_doc]
    
    mock_db = MagicMock()
    mock_db.query.return_value = mock_query
    
    # Mock the get_db dependency
    def override_get_db():
        yield mock_db
    
    from app.models.document import get_db
    app.dependency_overrides[get_db] = override_get_db
    
    try:
        # Make search request
        response = client.post(
            "/api/v1/search",
            json={
                "query": "test query",
                "top_k": 5
            }
        )
        
        # Assert response
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "test query"
        assert data["total"] >= 0
        assert "results" in data
        assert isinstance(data["results"], list)
    finally:
        # Cleanup
        app.dependency_overrides.clear()


def test_search_endpoint_empty_query(client):
    """Test search with empty query returns validation error."""
    response = client.post(
        "/api/v1/search",
        json={
            "query": "",
            "top_k": 5
        }
    )
    
    # Should return 422 for validation error
    assert response.status_code == 422


def test_search_endpoint_invalid_top_k(client):
    """Test search with invalid top_k returns validation error."""
    response = client.post(
        "/api/v1/search",
        json={
            "query": "test query",
            "top_k": 0  # Invalid: must be >= 1
        }
    )
    
    # Should return 422 for validation error
    assert response.status_code == 422


def test_search_endpoint_no_results(client, mock_embed, monkeypatch):
    """Test search with no results."""
    # Mock index manager to return no results
    mock_manager = MagicMock()
    
    async def fake_search_empty(query_vector, top_k):
        return [], []
    
    mock_manager.search = fake_search_empty
    monkeypatch.setattr("app.api.v1.endpoints.index_manager", mock_manager)
    
    # Mock the database
    mock_db = MagicMock()
    
    def override_get_db():
        yield mock_db
    
    from app.models.document import get_db
    app.dependency_overrides[get_db] = override_get_db
    
    try:
        response = client.post(
            "/api/v1/search",
            json={
                "query": "test query",
                "top_k": 5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "test query"
        assert data["total"] == 0
        assert data["results"] == []
    finally:
        app.dependency_overrides.clear()
