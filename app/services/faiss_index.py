"""
Faiss index management for vector similarity search.
"""
import os
from pathlib import Path
from typing import List, Tuple

import faiss
import numpy as np

from app.core.config import settings


class FaissIndexManager:
    """Manages Faiss index for vector search."""

    def __init__(self):
        """Initialize Faiss index manager."""
        self.index: faiss.Index = None
        self.dimension = settings.embedding_dimensions
        self.index_path = settings.faiss_index_path
        self.doc_ids: List[int] = []  # Maps index position to document ID

    def load_or_create_index(self) -> faiss.Index:
        """
        Load existing Faiss index from disk or create new one.

        Returns:
            Faiss index instance
        """
        index_file = Path(self.index_path)

        if index_file.exists():
            # Load existing index
            self.index = faiss.read_index(str(index_file))
            # Load document IDs mapping
            doc_ids_file = index_file.with_suffix(".ids.npy")
            if doc_ids_file.exists():
                self.doc_ids = np.load(str(doc_ids_file)).tolist()
        else:
            # Create new index using Inner Product (cosine similarity with normalized vectors)
            self.index = faiss.IndexFlatIP(self.dimension)
            self.doc_ids = []
            # Ensure directory exists
            index_file.parent.mkdir(parents=True, exist_ok=True)

        return self.index

    def save_index(self) -> None:
        """Save Faiss index and document IDs mapping to disk."""
        index_file = Path(self.index_path)
        index_file.parent.mkdir(parents=True, exist_ok=True)

        # Save index
        faiss.write_index(self.index, str(index_file))

        # Save document IDs mapping
        doc_ids_file = index_file.with_suffix(".ids.npy")
        np.save(str(doc_ids_file), np.array(self.doc_ids))

    def add_vectors(self, vectors: np.ndarray, doc_ids: List[int]) -> None:
        """
        Add vectors to the index.

        Args:
            vectors: Numpy array of shape (n, dimension)
            doc_ids: List of document IDs corresponding to vectors
        """
        # Normalize vectors for cosine similarity
        faiss.normalize_L2(vectors)
        self.index.add(vectors)
        self.doc_ids.extend(doc_ids)
        self.save_index()

    async def search(
        self, query_vector: List[float], top_k: int = 5
    ) -> Tuple[List[float], List[int]]:
        """
        Search for similar vectors in the index.

        Args:
            query_vector: Query embedding vector
            top_k: Number of results to return

        Returns:
            Tuple of (scores, document_ids)
        """
        # Convert to numpy and normalize
        query_array = np.array([query_vector], dtype=np.float32)
        faiss.normalize_L2(query_array)

        # Search
        scores, indices = self.index.search(query_array, top_k)

        # Map indices to document IDs
        doc_ids = [self.doc_ids[idx] for idx in indices[0] if idx < len(self.doc_ids)]
        scores_list = scores[0].tolist()[: len(doc_ids)]

        return scores_list, doc_ids


# Global index manager instance
index_manager = FaissIndexManager()
