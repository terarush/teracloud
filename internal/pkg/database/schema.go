package database

import (
	"strings"

	"gorm.io/gorm"
)

// SchemaPrefix is the database schema prefix applied to table names.
// Postgres: "core." so tables live in core.users instead of public.users.
// MySQL: empty — MySQL has no schemas, only databases.
var SchemaPrefix string

// T returns the fully-qualified table name for driver-aware schema prefixing.
// Postgres → "core.users", MySQL → "users".
func T(table string) string {
	table = strings.TrimSpace(table)
	if SchemaPrefix == "" {
		return table
	}
	return SchemaPrefix + table
}

// createSchema executes CREATE SCHEMA IF NOT EXISTS on the Postgres connection.
func createSchema(db *gorm.DB, schema string) error {
	return db.Exec("CREATE SCHEMA IF NOT EXISTS " + schema).Error
}