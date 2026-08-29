// Command migrate runs the SQL migration files in internal/database/migrations.
//
// Usage:
//
//	go run ./cmd/migrate up          # apply pending migrations
//	go run ./cmd/migrate down        # revert applied migrations (reverse order)
//	go run ./cmd/migrate reset       # down then up
//	go run ./cmd/migrate status      # list migrations + applied state
//	go run ./cmd/migrate new <name>  # scaffold timestamped up/down pair
//
// Configuration comes from .env (see internal/pkg/config). This runner is
// Postgres-oriented: the SQL files use BIGSERIAL/TIMESTAMPTZ and the "core"
// schema. On MySQL the same dialing applies but the SQL corpus is not
// portable — use the app's GORM AutoMigrate there instead.
package main

import (
	"fmt"
	"log"
	"os"

	"ruang-tukar/internal/pkg/config"
	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/internal/pkg/migrate"
)

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(1)
	}
	if err := config.Initialize(); err != nil {
		log.Fatalf("error loading config: %v", err)
	}

	dbModel := &database.DBModel{
		ServerMode:   config.GetString("SERVER_MODE"),
		Driver:       config.GetString("DB_DRIVER"),
		Host:         config.GetString("DB_HOST"),
		Port:         config.GetString("DB_PORT"),
		Name:         config.GetString("DB_NAME"),
		Username:     config.GetString("DB_USERNAME"),
		Password:     config.GetString("DB_PASSWORD"),
		MaxIdleConn:  config.GetInt("POOL_CONN_IDLE"),
		MaxOpenConn:  config.GetInt("POOL_CONN_MAX"),
		ConnLifeTime: config.GetInt("POOL_CONN_LIFETIME"),
	}
	db, errPtr := dbModel.OpenDB()
	if errPtr != nil {
		log.Fatalf("cannot connect to database: %v", *errPtr)
	}

	r := &migrate.Runner{
		DB:           db,
		Dir:          migrate.DefaultDir,
		Driver:       dbModel.Driver,
		SchemaPrefix: database.SchemaPrefix,
	}

	cmd := os.Args[1]
	switch cmd {
	case "up":
		errExit("migrate up", r.Up())
	case "down":
		errExit("migrate down", r.Down())
	case "reset":
		errExit("migrate reset", r.Reset())
	case "status":
		errExit("migrate status", r.Status())
	case "new":
		name := ""
		if len(os.Args) >= 3 {
			name = os.Args[2]
		}
		errExit("migrate new", r.New(name))
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n\n", cmd)
		usage()
		os.Exit(1)
	}
}

func errExit(label string, err error) {
	if err != nil {
		log.Fatalf("%s failed: %v", label, err)
	}
}

func usage() {
	fmt.Fprintln(os.Stderr, `usage:
  go run ./cmd/migrate up          apply pending migrations
  go run ./cmd/migrate down        revert applied migrations (reverse order)
  go run ./cmd/migrate reset       down then up
  go run ./cmd/migrate status      list migrations + applied state
  go run ./cmd/migrate new <name>  scaffold timestamped up/down pair`)
}