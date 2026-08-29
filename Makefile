.DEFAULT_GOAL := help

GO ?= go

WEB_DIR := web
DOCKER_COMPOSE := docker compose

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install frontend dependencies
	cd $(WEB_DIR) && npm install

dev: ## Start frontend dev server (:3333)
	cd $(WEB_DIR) && npm dev --host --port 3333

build: ## Build frontend for production
	cd $(WEB_DIR) && npm build

lint: ## Lint frontend
	cd $(WEB_DIR) && npm lint

format: ## Auto-format + lint fix
	cd $(WEB_DIR) && npm format

check: ## Prettier check only
	cd $(WEB_DIR) && npm check

generate-routes: ## Regenerate TanStack Router route tree
	cd $(WEB_DIR) && npm generate-routes

test: ## Run frontend tests
	cd $(WEB_DIR) && npm test

typecheck: ## TypeScript type-check (no emit)
	cd $(WEB_DIR) && npx tsc --noEmit

build-backend: ## Build Go binary
	$(GO) build -o main .

run-backend: ## Run Go server (needs .env in CWD)
	$(GO) run main.go

test-backend: ## Run all Go tests
	$(GO) test ./...

# --- Database migrations ---
# Migrations run from a pre-built host binary (bin/migrate), never via `go run`
# and never inside the app container. A pre-built binary avoids Go compiling a
# second copy (which races the container build's GOCACHE), and keeps the
# migrate step off-container so production app image stays build-only.
.PHONY: migrate-up migrate-down db-reset db-status migrate-new deploy-migrate build-migrate
MIGRATE_BIN := bin/migrate
MIGRATE_CMD := ./$(MIGRATE_BIN)
MIGRATE_SRC := $(wildcard cmd/migrate/*.go) $(wildcard internal/pkg/migrate/*.go)

$(MIGRATE_BIN): $(MIGRATE_SRC)
	$(GO) build -o $(MIGRATE_BIN) ./cmd/migrate

build-migrate: $(MIGRATE_BIN) ## Build the migrate binary once (host, pre-built)

migrate-up: $(MIGRATE_BIN) ## Apply pending database migrations
	$(MIGRATE_CMD) up

migrate-down: $(MIGRATE_BIN) ## Revert applied migrations (reverse order)
	$(MIGRATE_CMD) down

db-reset: $(MIGRATE_BIN) ## Revert all migrations, then re-apply
	$(MIGRATE_CMD) reset

db-status: $(MIGRATE_BIN) ## Show applied vs pending migrations
	$(MIGRATE_CMD) status

migrate-new: $(MIGRATE_BIN) ## Scaffold a new timestamped migration pair (usage: make migrate-new name=add_x)
	$(MIGRATE_CMD) new $(name)

deploy-migrate: $(MIGRATE_BIN) ## Apply pending migrations (CI/deploy: run AFTER build, BEFORE start)
	$(MIGRATE_CMD) up

swagger: ## Regenerate Swagger docs
	swag init -d .,./modules/auth,./modules/users,./modules/product,./modules/payment,./modules/ticket,./modules/download,./modules/affiliate -o docs --parseDependency --parseInternal

docker-up: ## Start backend container (ruangtukar-backend)
	$(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up

docker-down: ## Stop all services
	$(DOCKER_COMPOSE) down

docker-up-d: ## Start backend container in background (ruangtukar-backend)
	$(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d

docker-logs: ## Follow logs
	$(DOCKER_COMPOSE) logs -f

docker-web-up: ## Start frontend container (ruangtukar-frontend)
	cd $(WEB_DIR) && $(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up

docker-web-up-d: ## Start frontend container in background (ruangtukar-frontend)
	cd $(WEB_DIR) && $(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d

deploy: ## Build & run backend+DB; up -d
	$(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d
	cd $(WEB_DIR) && $(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d