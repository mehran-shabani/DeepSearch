"""
Embedding generation using OpenAI API.
"""

import asyncio

from openai import AsyncOpenAI

from app.core.config import settings

# Initialize OpenAI client
client = AsyncOpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url,
)


async def embed(text: str) -> list[float]:
    """
    Generate embedding vector for given text using OpenAI API.

    Args:
        text: Input text to embed

    Returns:
        List of floats representing the embedding vector
    """
    response = await client.embeddings.create(
        model=settings.embedding_model,
        input=text,
    )
    return response.data[0].embedding


async def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple texts in batch.

    Args:
        texts: List of input texts to embed

    Returns:
        List of embedding vectors
    """
    tasks = [embed(text) for text in texts]
    return await asyncio.gather(*tasks)
