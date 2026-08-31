-- Up Migration: Change icon and thumbnail_url to TEXT in plans table
ALTER TABLE hosting.plans ALTER COLUMN icon TYPE TEXT;
ALTER TABLE hosting.plans ALTER COLUMN thumbnail_url TYPE TEXT;
