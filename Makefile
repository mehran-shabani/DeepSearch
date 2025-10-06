.PHONY: dev install build clean test docker-up docker-down help

# Default target
.DEFAULT_GOAL := help

help:  ## Show this help message
	@echo "Deep Search - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev:  ## Run development servers (backend + frontend)
	@bash dev.sh

install:  ## Install all dependencies
	@echo "📦 Installing backend dependencies..."
	poetry install
	@echo "📦 Installing frontend dependencies..."
	cd deep-search-ui && npm install
	@echo "✅ All dependencies installed!"

build:  ## Build for production
	@echo "🏗️  Building backend..."
	poetry build
	@echo "🏗️  Building frontend..."
	cd deep-search-ui && npm run build
	@echo "✅ Build complete!"

test:  ## Run tests
	@echo "🧪 Running tests..."
	poetry run pytest
	@echo "✅ Tests complete!"

lint:  ## Run linters
	@echo "🔍 Running linters..."
	poetry run ruff check app/
	poetry run black --check app/
	@echo "✅ Linting complete!"

format:  ## Format code
	@echo "✨ Formatting code..."
	poetry run black app/
	poetry run ruff check --fix app/
	@echo "✅ Formatting complete!"

docker-up:  ## Start services with Docker Compose
	docker compose up --build

docker-down:  ## Stop Docker Compose services
	docker compose down

clean:  ## Clean build artifacts and cache
	@echo "🧹 Cleaning..."
	rm -rf dist/ build/ *.egg-info
	rm -rf deep-search-ui/dist/ deep-search-ui/node_modules/.vite
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleaned!"
