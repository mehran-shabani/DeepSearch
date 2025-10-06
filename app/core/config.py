"""
Application configuration using Pydantic settings.
"""
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # OpenAI Configuration
    openai_api_key: str = Field(..., description="OpenAI API key")
    openai_base_url: str = Field(
        default="https://api.openai.com/v1",
        description="OpenAI API base URL",
    )
    embedding_model: str = Field(
        default="text-embedding-3-small",
        description="OpenAI embedding model name",
    )
    embedding_dimensions: int = Field(
        default=1536,
        description="Embedding vector dimensions",
    )

    # Faiss Configuration
    faiss_index_path: str = Field(
        default="data/faiss_index.bin",
        description="Path to Faiss index file",
    )

    # Database Configuration
    database_url: str = Field(
        default="sqlite:///data/documents.db",
        description="SQLAlchemy database URL",
    )

    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8000, description="API port")

    def ensure_data_directory(self) -> None:
        """Ensure data directory exists."""
        data_dir = Path(self.faiss_index_path).parent
        data_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
