package migrate

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// migration represents a single migration file on disk.
type migration struct {
	// File is the base name of the migration file, e.g.
	// "20260812_000001_create_users_tables.sql".
	File string
	// Up is the absolute path to the up migration file.
	Up string
	// Down is the absolute path to the down migration file; "" if none exists.
	Down string
}

// discover scans dir for migration pairs. Up files end in ".sql" and are
// matched with a sibling "_down.sql" file sharing the same stem. Ordering is
// by file name ascending — the zero-padded timestamp prefix keeps modules in
// creation order and respects FK dependencies (e.g. orders after products).
// Down files (if present) are grouped by module and applied in reverse.
func discover(dir string) ([]migration, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	downs := make(map[string]string) // stem -> down file path
	var ups []string                 // up file paths, unsorted
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}
		if stem, ok := strings.CutSuffix(name, "_down.sql"); ok {
			downs[stem] = filepath.Join(dir, name)
			continue
		}
		ups = append(ups, filepath.Join(dir, name))
	}

	sort.Strings(ups)

	var migrations []migration
	for _, up := range ups {
		base := filepath.Base(up)
		stem := strings.TrimSuffix(base, ".sql")
		m := migration{
			File: base,
			Up:   up,
			Down: downs[stem],
		}
		migrations = append(migrations, m)
	}
	return migrations, nil
}