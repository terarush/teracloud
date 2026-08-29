.DEFAULT_GOAL := help

GO ?= go
DOCKER_COMPOSE := docker compose

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build-backend: ## Build Go binary
	go build -o main .

run-backend: ## Run Go server (needs .env in CWD)
	go run main.go

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
	swag init -d .,./modules/auth,./modules/users -o docs --parseDependency --parseInternal

docker-up: ## Start backend container (ruangtukar-backend)
	$(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up

docker-down: ## Stop all services
	$(DOCKER_COMPOSE) down

docker-up-d: ## Start backend container in background (ruangtukar-backend)
	$(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d

docker-logs: ## Follow logs
	$(DOCKER_COMPOSE) logs -f

deploy: ## Build & run backend+DB (background)
	$(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d
