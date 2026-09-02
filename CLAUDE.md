# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product & Design Context

Before any screen-level task, read:
- **`PRODUCT.md`** — product strategy, positioning, brand personality, users (unified creator/buyer role), design principles, anti-references (not a busy marketplace), accessibility target (WCAG 2.2 AA)
- **`DESIGN.md`** — complete design system: The Workshop Bench north star, color palette (Mint Pond teal primary, Soft Violet accent, Ember destructive), typography (Geist Variable, single-family hierarchy), elevation (flat-by-default, ring-1 for cards, shadows only on overlays), component specs (buttons, inputs, cards, badges, dialogs, sidebar, tooltips), do's/don'ts

Key design rules:
- **Accent Sparing Rule**: Mint Pond used on ≤10% of any screen — interactive elements only, never decoration
- **Flat-by-default**: no shadows on cards, `ring-1 ring-foreground/10` for separation
- **Single family**: Geist Variable for everything — hierarchy via weight/size, not font switch
- **Calm commerce**: no marketplace density (no flashing badges, discount carousels, clustered CTAs)
- **Full state vocab**: every interactive component needs default → hover → focus-visible → active → disabled → aria-invalid

## Build & Run

```bash
go build -o main .              # Build Go binary
go run main.go                  # Run Go server (needs .env in CWD)
go test ./...                   # Run all Go tests
docker compose up --build       # Run app + MySQL (app :9000, MySQL :3307)
swag init -d .,... -o docs      # Regenerate swagger docs (see full cmd below)
```

Full swag command:
```
swag init -d .,./modules/auth,./modules/users -o docs --parseDependency --parseInternal
```

## Architecture

**Modular monolith** backend (Go 1.25 + Echo v5 + GORM).

### Backend (`teracloud`)

Module interface at `internal/app/module.go`. Every feature is a module with `Name()`, `Initialize(db, logger, eventBus)`, `RegisterRoutes(e, group)`, `Migrations()`, `Logger()`.

App lifecycle (`internal/app/app.go`):
1. `main.go` creates modules, registers on `App`
2. `App.Initialize()` → DB → event bus → Echo → each module: Initialize → Migrations → RegisterRoutes
3. `App.Start()` runs HTTP server with graceful shutdown

Each module lives under `modules/<name>/` with DDD-ish structure:
- `domain/entity/` — GORM models
- `domain/repository/` — interface + GORM impl
- `domain/service/` — business logic
- `handler/` — Echo handlers + route registration
- `dto/request/` & `dto/response/` — structs
- `module.go` — module registration (wires everything)

**Shared packages** (`internal/pkg/`): bus (in-memory event bus), cache (go-cache), config (env-var via godotenv), database (GORM), jwt (HS256), logger (zap + lumberjack), middleware (Echo auth/bearer), server (HTTP graceful shutdown), utils (bcrypt, JSON response helpers), validator (go-playground)

**Key patterns**:
- DI: manual wiring in module `Initialize()` — repo → service → handler
- Auth: JWT Bearer middleware, configurable per route group
- Events: bus emits events like `user.created` for loose coupling
- API prefix: `/api/v{API_VERSION}` (default `/api/v1`)

### Routes

**Backend API** (prefix `/api/v1`):
| Method | Path | Auth | Module |
|--------|------|------|--------|
| POST | `/api/v1/auth/register` | No | auth |
| POST | `/api/v1/auth/login` | No | auth |
| GET/POST/PUT/DELETE | `/api/v1/users[/:id]` | JWT | users |
| GET | `/api/docs/` | No | — |

## Config

Copy `.env.example` → `.env`. Key vars:

- `PORT` — HTTP port (8080 local, 9000 via Docker)
- `DB_DRIVER` — `mysql` or `postgres`
- `JWT_SIGNATURE_KEY` — secret for HS256 JWT tokens

## Notes

- Module name in `go.mod` is `teracloud`
- Dockerfile targets Go 1.25-alpine; local uses 1.25
- Config is 100% env-var driven — no TOML files despite Dockerfile comment
- Auth module duplicates user creation logic — `auth.CreateUser` has proper bcrypt hashing, `users.CreateUser` does not
- Email uniqueness check is commented out in user service — duplicate emails allowed
- `internal/pkg/middleware/middleware.go` is empty (only package declaration)
