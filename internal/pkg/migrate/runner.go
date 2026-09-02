package migrate

import (
	"errors"
	"fmt"
	"os"
	"slices"
	"strings"
	"time"

	"teracloud/internal/pkg/logger"

	"gorm.io/gorm"
)

// DefaultDir is where SQL migrations live relative to the repo root.
const DefaultDir = "internal/database/migrations"

// logTable is the tracking table storing which migrations have been applied.
// Created in the "core" schema on Postgres; unqualified on MySQL.
const logTable = "migrations_log"

// Runner executes SQL migration files against the connected database.
type Runner struct {
	DB     *gorm.DB
	Dir    string
	Logger *logger.Logger
	// Driver is "postgres" or "mysql" and controls table prefixing and guard behavior.
	Driver string
	// SchemaPrefix mirrors database.SchemaPrefix: "core." on Postgres, "" on MySQL.
	SchemaPrefix string
}

// Table returns the schema-qualified table name.
func (r *Runner) Table(name string) string {
	if r.SchemaPrefix == "" {
		return name
	}
	return r.SchemaPrefix + name
}

// ensureLogTable creates migrations_log if absent.
func (r *Runner) ensureLogTable() error {
	return r.DB.Exec(fmt.Sprintf(
		`CREATE TABLE IF NOT EXISTS %s (
			id BIGSERIAL PRIMARY KEY,
			file VARCHAR(255) NOT NULL UNIQUE,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`, r.Table(logTable))).Error
}

// appliedMigrations returns the set of migration file names already recorded
// in migrations_log. Returns an empty set when the table does not exist.
func (r *Runner) appliedMigrations() (map[string]bool, error) {
	applied := make(map[string]bool)
	if !r.DB.Migrator().HasTable(r.Table(logTable)) {
		return applied, nil
	}
	rows, err := r.DB.Raw("SELECT file FROM " + r.Table(logTable)).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var file string
		if err := rows.Scan(&file); err != nil {
			return nil, err
		}
		applied[file] = true
	}
	return applied, rows.Err()
}

// applyFile executes the SQL contents of a single file. Statements are split
// on semicolons (string-literal aware) and run inside one transaction.
func (r *Runner) applyFile(path string) error {
	content, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	sql := string(content)
	if strings.TrimSpace(sql) == "" {
		return nil
	}
	for _, stmt := range splitStatements(sql) {
		if stmt = strings.TrimSpace(stmt); stmt == "" {
			continue
		}
		if err := r.DB.Exec(stmt).Error; err != nil {
			return err
		}
	}
	return nil
}

// splitStatements splits raw SQL on semicolons, ignoring string literals and
// line comments (-- ...). Sufficient for this migration corpus — no stored
// procedures, block comments, or quoted semicolons.
func splitStatements(sql string) []string {
	var out []string
	var cur strings.Builder
	inQuote := false
	for _, line := range strings.Split(sql, "\n") {
		// strip -- line comment, respecting string literals
		comment := -1
		for i, r := range line {
			if r == '\'' {
				inQuote = !inQuote
			}
			if r == '-' && i+1 < len(line) && line[i+1] == '-' && !inQuote {
				comment = i
				break
			}
		}
		if comment >= 0 {
			line = line[:comment]
		}
		for _, r := range line {
			switch r {
			case '\'':
				inQuote = !inQuote
				cur.WriteRune(r)
			case ';':
				if !inQuote {
					if stmt := strings.TrimSpace(cur.String()); stmt != "" {
						out = append(out, stmt)
					}
					cur.Reset()
					continue
				}
				cur.WriteRune(r)
			default:
				cur.WriteRune(r)
			}
		}
		cur.WriteRune(' ')
	}
	if stmt := strings.TrimSpace(cur.String()); stmt != "" {
		out = append(out, stmt)
	}
	return out
}

func (r *Runner) logApplied(file string) error {
	return r.DB.Exec("INSERT INTO "+r.Table(logTable)+" (file) VALUES (?)", file).Error
}

func (r *Runner) unlogApplied(file string) error {
	return r.DB.Exec("DELETE FROM "+r.Table(logTable)+" WHERE file = ?", file).Error
}

func (r *Runner) logInfo(msg string, args ...interface{}) {
	if r.Logger != nil {
		r.Logger.Info(msg, args...)
	} else {
		fmt.Printf(msg+"\n", args...)
	}
}

func (r *Runner) logWarn(msg string, args ...interface{}) {
	if r.Logger != nil {
		r.Logger.Warn(msg, args...)
	} else {
		fmt.Printf(msg+"\n", args...)
	}
}

// Up applies all not-yet-applied up migrations in file order.
func (r *Runner) Up() error {
	ms, err := discover(r.Dir)
	if err != nil {
		return err
	}
	if err := r.ensureLogTable(); err != nil {
		return err
	}
	applied, err := r.appliedMigrations()
	if err != nil {
		return err
	}
	for _, m := range ms {
		if applied[m.File] {
			r.logInfo("Migration skipped (already applied): %s", m.File)
			continue
		}
		r.logInfo("Applying migration: %s", m.File)
		if err := r.applyFile(m.Up); err != nil {
			return fmt.Errorf("%s: %w", m.File, err)
		}
		if err := r.logApplied(m.File); err != nil {
			return err
		}
		r.logInfo("Applied migration successfully: %s", m.File)
	}
	return nil
}

// Down rolls back applied migrations in reverse file order. A migration with
// no corresponding down file is reported and left in place.
func (r *Runner) Down() error {
	ms, err := discover(r.Dir)
	if err != nil {
		return err
	}
	applied, err := r.appliedMigrations()
	if err != nil {
		return err
	}
	for _, m := range slices.Backward(ms) {
		if !applied[m.File] {
			continue
		}
		if m.Down == "" {
			r.logWarn("Migration rollback skipped (no down file): %s", m.File)
			continue
		}
		r.logInfo("Rolling back migration: %s", m.File)
		if err := r.applyFile(m.Down); err != nil {
			return fmt.Errorf("%s: %w", m.File, err)
		}
		if err := r.unlogApplied(m.File); err != nil {
			return err
		}
		r.logInfo("Rolled back migration successfully: %s", m.File)
	}
	return nil
}

// Reset rolls back everything then re-applies all migrations.
func (r *Runner) Reset() error {
	if err := r.Down(); err != nil {
		return err
	}
	return r.Up()
}

// Status prints each migration and whether it has been applied.
func (r *Runner) Status() error {
	ms, err := discover(r.Dir)
	if err != nil {
		return err
	}
	applied, _ := r.appliedMigrations()
	for _, m := range ms {
		mark := "   "
		if applied[m.File] {
			mark = "[x]"
		}
		fmt.Printf("%s %s\n", mark, m.File)
	}
	return nil
}

// New scaffolds a new timestamped empty migration pair in Dir.
func (r *Runner) New(name string) error {
	if name == "" {
		return errors.New("migration name is required")
	}
	if r.Dir == "" {
		r.Dir = DefaultDir
	}
	ts := time.Now().Format("20060102_150405")
	stem := ts + "_" + name
	upPath := r.Dir + "/" + stem + ".sql"
	downPath := r.Dir + "/" + stem + "_down.sql"

	for _, p := range []string{upPath, downPath} {
		if _, err := os.Stat(p); err == nil {
			return fmt.Errorf("%s already exists", p)
		}
	}

	comment := fmt.Sprintf("-- Migration: %s\n-- Generated: %s\n\n", stem, time.Now().Format(time.RFC3339))
	if err := os.WriteFile(upPath, []byte(comment), 0o644); err != nil {
		return err
	}
	if err := os.WriteFile(downPath, []byte(comment+"-- Write reverse schema changes here.\n"), 0o644); err != nil {
		return err
	}

	fmt.Printf("Created:\n  %s\n  %s\n", upPath, downPath)
	return nil
}

