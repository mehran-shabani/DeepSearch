# 🔍 Deep Search MVP

A full-stack semantic search application powered by FastAPI, Faiss, OpenAI embeddings, and React.

## 🏗️ Architecture

### Backend (FastAPI + Faiss + OpenAI)
- **FastAPI** for REST API
- **Faiss** for vector similarity search (IndexFlatIP for cosine similarity)
- **OpenAI** for text embeddings (text-embedding-3-small)
- **SQLAlchemy** for document storage (SQLite)
- Fully async implementation

### Frontend (React + Vite + TypeScript)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- Clean, modern UI with real-time search

## 📋 Prerequisites

- Python 3.12+
- Node.js 20+
- Poetry (Python dependency management)
- OpenAI API key

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Clone and enter the project
cd /path/to/deep-search

# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
nano .env  # or your preferred editor
```

### 2. Option A: Run with Make (Recommended)

```bash
# Install all dependencies
make install

# Start development servers (backend + frontend)
make dev
```

### 2. Option B: Run with dev.sh

```bash
# Make script executable (already done)
chmod +x dev.sh

# Run both services
./dev.sh
```

### 2. Option C: Run Manually

**Terminal 1 - Backend:**
```bash
# Install dependencies
poetry install

# Run backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd deep-search-ui

# Install dependencies
npm install

# Run frontend
npm run dev
```

### 2. Option D: Run with Docker

```bash
# Make sure .env is configured with your API keys
cp .env.example .env
# Edit .env with your values

# Start services
docker compose up --build

# Or with Make
make docker-up
```

## 🌐 Access the Application

Once running, access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📝 API Endpoints

### POST `/api/v1/search`
Search for documents using semantic similarity.

**Request:**
```json
{
  "query": "your search query",
  "top_k": 5,
  "filter": {}
}
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "content": "document content...",
      "score": 0.95,
      "metadata": {}
    }
  ],
  "query": "your search query",
  "total": 1
}
```

### POST `/api/v1/ingest`
Ingest a new document into the search index.

**Request:**
```json
{
  "content": "document content to index",
  "metadata": {
    "source": "example",
    "date": "2025-10-06"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "message": "Document 1 ingested successfully"
}
```

### GET `/api/v1/documents/{document_id}`
Retrieve a specific document by ID.

## 🗂️ Project Structure

```
.
├── app/                          # Backend application
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints.py      # API routes (/search, /ingest)
│   │       └── schemas.py        # Pydantic models
│   ├── core/
│   │   ├── config.py             # Settings & configuration
│   │   └── embeddings.py         # OpenAI embedding generation
│   ├── models/
│   │   └── document.py           # SQLAlchemy document model
│   ├── services/
│   │   ├── faiss_index.py        # Faiss index management
│   │   └── ingest.py             # Document ingestion service
│   └── main.py                   # FastAPI app initialization
├── deep-search-ui/               # Frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx          # Main search page
│   │   ├── App.tsx               # App root
│   │   └── main.tsx              # Entry point
│   └── package.json
├── data/                         # Generated data directory
│   ├── faiss_index.bin           # Faiss vector index
│   ├── faiss_index.ids.npy       # Document ID mapping
│   └── documents.db              # SQLite database
├── pyproject.toml                # Python dependencies
├── Dockerfile                    # Backend Docker image
├── docker-compose.yml            # Multi-container setup
├── dev.sh                        # Development script
├── Makefile                      # Make commands
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🔧 Configuration

All configuration is done via environment variables in `.env`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Faiss Configuration
FAISS_INDEX_PATH=data/faiss_index.bin

# Database Configuration
DATABASE_URL=sqlite:///data/documents.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## 🧪 Testing

```bash
# Run tests
make test

# Or with poetry
poetry run pytest
```

## 🎨 Code Quality

```bash
# Run linters
make lint

# Format code
make format

# Or manually
poetry run black app/
poetry run ruff check --fix app/
```

## 🐳 Docker Commands

```bash
# Start services
make docker-up
# or
docker compose up --build

# Stop services
make docker-down
# or
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up --build --force-recreate
```

## 📚 Usage Example

### 1. Ingest Documents

```bash
curl -X POST http://localhost:8000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Python is a high-level programming language.",
    "metadata": {"category": "programming"}
  }'
```

### 2. Search Documents

```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "programming languages",
    "top_k": 5
  }'
```

Or use the web interface at http://localhost:5173

## 🔍 How It Works

1. **Ingestion**: Documents are converted to embeddings using OpenAI API and stored in:
   - **Faiss index** for fast vector similarity search
   - **SQLite database** for document content and metadata

2. **Search**: Query is embedded and compared against indexed vectors using cosine similarity (via Faiss IndexFlatIP)

3. **Results**: Top-K most similar documents are retrieved and returned with similarity scores

## 🚀 Scaling Considerations

This MVP is designed for easy scaling:

- **Database**: Replace SQLite with PostgreSQL by changing `DATABASE_URL`
- **Vector Store**: Replace Faiss with Pinecone, Weaviate, or Milvus
- **Embeddings**: Swap OpenAI with local models (sentence-transformers)
- **API**: Add caching (Redis), rate limiting, authentication
- **Frontend**: Deploy to Vercel, Netlify, or CDN

## 📝 Make Commands

```bash
make help          # Show all available commands
make install       # Install all dependencies
make dev           # Run development servers
make build         # Build for production
make test          # Run tests
make lint          # Run linters
make format        # Format code
make docker-up     # Start with Docker
make docker-down   # Stop Docker services
make clean         # Clean build artifacts
```

## 🛠️ Troubleshooting

### Backend won't start
- Check `.env` file exists and has valid `OPENAI_API_KEY`
- Ensure Python 3.12+ is installed
- Try: `poetry install --no-cache`

### Frontend won't start
- Ensure Node.js 20+ is installed
- Delete `node_modules` and run `npm install` again
- Check `.env` has correct `VITE_API` URL

### Search returns no results
- First ingest some documents using `/api/v1/ingest` endpoint
- Check Faiss index file exists in `data/` directory

### Docker issues
- Ensure Docker and Docker Compose are installed
- Try: `docker compose down -v` to remove volumes
- Rebuild: `docker compose up --build --force-recreate`

## 📄 License

MIT License - feel free to use this project as a starting point for your own applications.

## 🤝 Contributing

This is an MVP scaffold. Feel free to:
- Add authentication and authorization
- Implement advanced filtering
- Add document management UI
- Integrate with other embedding providers
- Add monitoring and logging
- Implement batch ingestion

---

**Built with ❤️ using FastAPI, React, and OpenAI**
