"""
SQLAlchemy document model.
"""
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Column, DateTime, Integer, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

Base = declarative_base()


class Document(Base):
    """Document model for storing indexed documents."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    content = Column(Text, nullable=False, index=True)
    metadata = Column(JSON, default={}, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        """String representation of document."""
        return f"<Document(id={self.id}, content={self.content[:50]}...)>"


# Database setup
settings.ensure_data_directory()
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    """
    Get database session dependency.

    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
