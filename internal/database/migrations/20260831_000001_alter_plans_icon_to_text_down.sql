-- Down Migration: Revert icon and thumbnail_url back to VARCHAR
ALTER TABLE hosting.plans ALTER COLUMN icon TYPE VARCHAR(100);
ALTER TABLE hosting.plans ALTER COLUMN thumbnail_url TYPE VARCHAR(255);
