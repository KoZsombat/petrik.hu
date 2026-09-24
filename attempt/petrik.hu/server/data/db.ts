/**
 * The /hirkezelo/ SQLite database (see AGENT.md 6.15) - replaces the earlier
 * JSON-file store now that real publishing needs real, indexed lookups
 * (finding a post by its public slug) rather than a linear scan.
 */
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import { DATA_DIR, DATABASE_FILE } from '../config.ts'

mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(DATABASE_FILE)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    category_ids TEXT NOT NULL,
    featured_image TEXT,
    author_id TEXT NOT NULL,
    status TEXT NOT NULL,
    review_note TEXT,
    last_reviewer_id TEXT,
    last_reviewed_at TEXT,
    scheduled_for TEXT,
    scheduled_by_id TEXT,
    archived_at TEXT,
    archived_by_id TEXT,
    created_at TEXT NOT NULL,
    modified_at TEXT NOT NULL,
    date TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
  CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id);

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT,
    action TEXT NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS audit_post_idx ON audit_log(post_id);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed_category_ids TEXT
  );
`)
