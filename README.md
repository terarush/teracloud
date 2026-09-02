# go-starter

> Modular Go backend starter — Echo v5 + GORM + JWT, with a ready-to-use auth module.

Starter template for building modular Go backends. Ships with a complete authentication system (register, login, JWT access/refresh tokens, Google OAuth, password reset, file upload) and a users module — so you can copy the repo and start building features instead of boilerplate.

---

## ✨ Features

- **Modular monolith** — every feature is a self-contained module (`modules/<name>/`) with `domain/entity`, `domain/repository`, `domain/service`, `handler`, and `dto` layers
- **Auth module** — register, login, logout, JWT access + refresh tokens, change/reset password, email & username availability checks
- **Google OAuth2** login with automatic account creation
- **Profile management** — get/update profile, set username, avatar
- **User management** — CRUD + public profile by username (`GET /u/:username`)
- **File upload** — served from `/public/uploads`
- **In-memory event bus** — modules publish events like `user.created` for loose coupling
- **Swagger docs** — auto-generated from handler annotations, served at `/api/docs/`
- **Graceful shutdown**, CORS, request validation, zap logging with rotation

---

## 🛠️ Tech Stack

| Layer    | Tech |
|----------|------|
| Language | Go 1.25 |
| HTTP     | [Echo v5](https://echo.labstack.com/) |
| ORM      | [GORM](https://gorm.io/) (PostgreSQL) |
| Auth     | JWT (HS256) — separate access & refresh keys |
| Validation | [go-playground/validator](https://github.com/go-playground/validator) |
| Logging  | [zap](https://github.com/uber-go/zap) + [lumberjack](https://github.com/natefinch/lumberjack) |
| Config   | 100% env-var via [godotenv](https://github.com/joho/godotenv) |
| OAuth    | Google (`golang.org/x/oauth2`) |
| Docs     | [swaggo/swag](https://github.com/swaggo/swag) |
| Infra    | Docker + docker compose (app, optional PostgreSQL) |

---

## 🚀 Getting Started

### Prerequisites

- Go 1.25+
- PostgreSQL (or Docker)

### Installation

```bash
# 1. Clone the repo
git clone <your-repo-url> go-starter
cd go-starter

# 2. Copy and fill in the environment config
cp .env.example .env
#   - set DB_DRIVER=postgres, DB_HOST, DB_PORT, DB_* creds
#   - set JWT_SIGNATURE_KEY and JWT_REFRESH_KEY to random secrets

# 3. Build & run
go build -o main .
go run main.go
```

Server starts on `:8080` by default. Swagger docs at [http://localhost:8080/api/docs/](http://localhost:8080/api/docs/).

### With Docker

```bash
docker compose up --build        # app only
# Uncomment the db service in docker-compose.yml to run PostgreSQL too
```

### Useful commands

```bash
make build-backend    # go build -o main .
make run-backend      # go run main.go
make test-backend     # go test ./...
make swagger          # regenerate Swagger docs
make docker-up        # build & run app container
make docker-logs      # follow container logs
```

---

## 🏗️ Architecture

### App lifecycle

1. `main.go` creates modules and registers them on `App`
2. `App.Initialize()` → database → event bus → Echo → each module: `Initialize` → `Migrations` → `RegisterRoutes`
3. `App.Start()` runs the HTTP server with graceful shutdown

### Module interface

Every module implements `internal/app/module.go`:

```go
type Module interface {
    Name() string
    Initialize(db *gorm.DB, logger *logger.Logger, event *bus.EventBus) error
    RegisterRoutes(e *echo.Echo, group string)
    Migrations() error
    Logger() *logger.Logger
}
```

### Module layout

```
modules/<name>/
├── domain/
│   ├── entity/        # GORM models
│   ├── repository/    # interface + GORM impl
│   └── service/       # business logic
├── handler/           # Echo handlers + route registration
├── dto/
│   ├── request/
│   └── response/
└── module.go          # module wiring (repo → service → handler)
```

### Shared packages (`internal/pkg/`)

| Package     | Purpose |
|-------------|---------|
| `bus`       | In-memory event bus |
| `cache`     | go-cache wrapper |
| `config`    | env-var config loader |
| `database`  | GORM setup (MySQL/PostgreSQL) |
| `jwt`       | HS256 JWT generate/parse |
| `logger`    | zap + lumberjack |
| `mailer`    | SMTP mailer (password reset) |
| `middleware`| Echo auth/bearer middleware |
| `oauth`     | Google OAuth2 |
| `server`    | HTTP server with graceful shutdown |
| `utils`     | bcrypt, JSON response helpers |
| `validator` | go-playground validator |

---

## 🔌 API Routes

All routes under prefix `/api/v1` (configurable via `API_VERSION`). JWT = requires `Authorization: Bearer <access_token>`.

### Auth (`/api/v1/auth`)

| Method | Path                | Auth | Description |
|--------|---------------------|------|-------------|
| POST   | `/auth/register`    | No   | Register a new user (returns access + refresh tokens) |
| POST   | `/auth/login`       | No   | Login with email + password |
| POST   | `/auth/refresh`     | No   | Exchange refresh token for new access token |
| GET    | `/auth/check-email` | No   | Check email availability |
| GET    | `/auth/check-username` | No | Check username availability |
| POST   | `/auth/forgot-password` | No | Send password reset email |
| GET    | `/auth/verify-reset-token` | No | Verify a reset token |
| POST   | `/auth/reset-password` | No | Reset password with token |
| GET    | `/auth/google/login` | No  | Redirect to Google OAuth consent |
| GET    | `/auth/google/callback` | No | Google OAuth callback |
| GET    | `/auth/profile`     | JWT | Get own profile |
| PUT    | `/auth/profile`     | JWT | Update own profile |
| PUT    | `/auth/username`    | JWT | Set username (first-time Google users) |
| POST   | `/auth/change-password` | JWT | Change password |
| POST   | `/auth/logout`      | JWT | Logout |
| POST   | `/auth/upload`      | JWT | Upload a file (stored in `public/uploads`) |

### Users (`/api/v1`)

| Method | Path             | Auth | Description |
|--------|------------------|------|-------------|
| GET    | `/u/:username`   | No   | Public user profile by username |
| GET    | `/users`         | JWT  | List all users |
| GET    | `/users/:id`     | JWT  | Get user by ID |
| POST   | `/users`         | JWT  | Create user |
| PUT    | `/users/:id`     | JWT  | Update user |
| DELETE | `/users/:id`     | JWT  | Delete user |

### Docs

| Method | Path          | Description |
|--------|---------------|-------------|
| GET    | `/api/docs/`  | Swagger UI |

---

## ⚙️ Configuration

Copy `.env.example` → `.env`. Key variables:

| Variable              | Description |
|-----------------------|-------------|
| `PORT`                | HTTP port (8080 local, 9000 via Docker) |
| `DB_DRIVER`           | `postgres` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | Database connection |
| `JWT_SIGNATURE_KEY`   | Secret for HS256 access tokens |
| `JWT_REFRESH_KEY`     | Secret for refresh tokens (falls back to signature key) |
| `JWT_DAY_EXPIRED`     | Access token expiry in days (default 7) |
| `OAUTH2_GOOGLE_*`     | Google OAuth2 client credentials |
| `SMTP_*`              | SMTP config for password reset emails (optional) |
| `APP_FRONTEND_URL`    | Allowed CORS origin + OAuth redirect target |

---

## 🧩 Adding a New Module

1. Create `modules/<name>/` with entity, repository, service, handler, dto
2. Implement the `Module` interface in `module.go`
3. Register it in `main.go`:

```go
application.RegisterModule(yourmodule.NewModule())
```

4. Add `swag init` target dirs for the new module if it has handler annotations

---

## 📝 Notes

- Module name in `go.mod` is `teracloud`
- Auth module duplicates user creation logic — `auth.CreateUser` has proper bcrypt hashing, `users.CreateUser` does not
- Email uniqueness check is commented out in the user service — duplicate emails allowed
- `internal/pkg/middleware/middleware.go` is empty (only package declaration)
