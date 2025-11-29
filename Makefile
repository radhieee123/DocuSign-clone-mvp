.PHONY: help build up down restart logs shell clean dev dev-down backup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build production Docker image
	docker-compose build

up: ## Start production containers
	docker-compose up -d
	@echo "Application running at http://localhost:3000"

down: ## Stop production containers
	docker-compose down

restart: ## Restart production containers
	docker-compose restart

logs: ## View production logs
	docker-compose logs -f

shell: ## Access production container shell
	docker-compose exec docusign-mvp sh

clean: ## Remove containers, volumes, and images
	docker-compose down -v
	docker image prune -f

dev: ## Start development containers with hot reload
	docker-compose -f docker-compose.dev.yml up
	@echo "Development server running at http://localhost:3000"

dev-down: ## Stop development containers
	docker-compose -f docker-compose.dev.yml down

backup: ## Backup database
	@mkdir -p backups
	docker cp docusign-mvp:/app/data/dev.db ./backups/backup-$$(date +%Y%m%d-%H%M%S).db
	@echo "Database backed up to backups/"

restore: ## Restore database (usage: make restore FILE=backup.db)
	@if [ -z "$(FILE)" ]; then echo "Usage: make restore FILE=backup.db"; exit 1; fi
	docker cp $(FILE) docusign-mvp:/app/data/dev.db
	docker-compose restart
	@echo "Database restored from $(FILE)"

reset: ## Reset database and start fresh
	docker-compose down -v
	docker-compose up -d
	@echo "Database reset complete"

status: ## Show container status
	docker-compose ps

stats: ## Show resource usage
	docker stats docusign-mvp
