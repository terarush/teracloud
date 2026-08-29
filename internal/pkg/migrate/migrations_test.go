package migrate

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDiscoverPairsUpAndDown(t *testing.T) {
	dir := t.TempDir()
	pair := map[string]string{
		"20260101_000001_users.sql":         "CREATE TABLE users(id INT);",
		"20260101_000001_users_down.sql":    "DROP TABLE users;",
		"20260101_000002_sessions.sql":      "CREATE TABLE sessions(id INT);",
		"20260101_000002_sessions_down.sql": "DROP TABLE sessions;",
	}
	for name, sql := range pair {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(sql), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	upOnly := "20260101_000003_orphan.sql"
	if err := os.WriteFile(filepath.Join(dir, upOnly), []byte("-- x"), 0o644); err != nil {
		t.Fatal(err)
	}

	ms, err := discover(dir)
	if err != nil {
		t.Fatalf("discover error: %v", err)
	}
	if len(ms) != 3 {
		t.Fatalf("want 3 migrations, got %d", len(ms))
	}
	// Sorted by name ascending.
	if ms[0].File != "20260101_000001_users.sql" {
		t.Errorf("first file = %s", ms[0].File)
	}
	if ms[0].Down == "" {
		t.Error("users migration should have a down file")
	}
	// Orphan gets no down file.
	if ms[2].File != "20260101_000003_orphan.sql" || ms[2].Down != "" {
		t.Errorf("orphan pairing wrong: %+v", ms[2])
	}
}