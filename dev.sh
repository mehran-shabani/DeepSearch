#!/bin/bash

# Deep Search Development Script
# Runs both backend and frontend concurrently

set -e

echo "🚀 Starting Deep Search in development mode..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your actual API keys and configuration."
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo -e "\n🛑 Stopping services..."
    pkill -P $$
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}Starting Backend on http://localhost:8000${NC}"
cd "$(dirname "$0")"

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Install backend dependencies and run
poetry install --no-interaction --no-ansi &> /tmp/poetry-install.log &
POETRY_PID=$!

# Start frontend
echo -e "${BLUE}Starting Frontend on http://localhost:5173${NC}"
cd deep-search-ui

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Run frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait for poetry install to complete
wait $POETRY_PID

# Run backend
cd ..
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo -e "\n${GREEN}✅ Services started!${NC}"
echo -e "${GREEN}Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}API Docs: http://localhost:8000/docs${NC}"
echo -e "\nPress Ctrl+C to stop all services.\n"

# Wait for all background processes
wait
