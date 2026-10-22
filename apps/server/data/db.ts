/**
 * The /hirkezelo/ SQLite database (see AGENT.md 6.15) - replaces the earlier
 * JSON-file store now that real publishing needs real, indexed lookups
 * (finding a post by its public slug) rather than a linear scan.
 */
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import { CAPABILITY } from '../../../shared/pnw/types.ts'
import { DATA_DIR, DATABASE_FILE } from '../config.ts'

mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(DATABASE_FILE)
db.pragma('journal_mode = WAL')

/** Read before the CREATE below, so migrate() can tell a first boot of the Szerkesztő (AGENT.md 6.19). */
const hadPagesTable =
  db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'pages'").get() !== undefined

/** Likewise for the Dokumentumtár's permission: the first boot that has the library table grants it (see migrate()). */
const hadLibraryTable =
  db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'site_library'").get() !== undefined

/**
 * `route` is the key: `/nyilt-nap/` for a page created in the Szerkesztő (its
 * `slug` is `nyilt-nap`), `/nyolcadikos/` for an edit of a mirrored page. A
 * mirrored route with no row means "use the bundled default"; `deleted` is the
 * tombstone of a deleted one and has no document.
 */
const PAGES_DDL = (name: string) => `
  CREATE TABLE IF NOT EXISTS ${name} (
    id TEXT PRIMARY KEY,
    route TEXT NOT NULL UNIQUE,
    origin TEXT NOT NULL DEFAULT 'custom',
    template TEXT NOT NULL DEFAULT 'builder',
    deleted INTEGER NOT NULL DEFAULT 0,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    document TEXT,
    status TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    modified_at TEXT NOT NULL,
    modified_by_id TEXT
  );
`

if (hadPagesTable && !(db.pragma('table_info(pages)') as { name: string }[]).some((column) => column.name === 'route')) {
  // The v1 table (AGENT.md 6.19), where only pages created in the Szerkesztő lived: keyed by slug, no tombstones.
  // Rebuilt under the generalised schema; every old row is a custom page.
  db.exec('ALTER TABLE pages RENAME TO pages_v1')
  db.exec(PAGES_DDL('pages'))
  db.exec(`
    INSERT INTO pages (id, route, origin, template, deleted, slug, title, description, document, status, author_id, created_at, modified_at)
    SELECT id, '/' || slug || '/', 'custom', 'builder', 0, slug, title, description, document, status, author_id, created_at, modified_at
    FROM pages_v1
  `)
  db.exec('DROP TABLE pages_v1')
} else {
  db.exec(PAGES_DDL('pages'))
}

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    category_ids TEXT NOT NULL,
    tag_ids TEXT NOT NULL DEFAULT '[]',
    featured_image TEXT,
    image_position TEXT NOT NULL DEFAULT 'top',
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
    permissions TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS terms (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    route TEXT,
    created_at TEXT NOT NULL,
    created_by_id TEXT
  );

  CREATE INDEX IF NOT EXISTS terms_kind_idx ON terms(kind);

  -- The Szerkesztő (AGENT.md 6.20): every page saved in it - created there, or
  -- an edit/tombstone of a mirrored route (PAGES_DDL) - and the edited menu.
  -- Every JSON column is validated on the way in (server/lib/validation.ts).

  CREATE TABLE IF NOT EXISTS site_menu (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    modified_at TEXT NOT NULL
  );

  -- The edited Dokumentumtár: one row, the whole library as JSON.
  CREATE TABLE IF NOT EXISTS site_library (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    modified_at TEXT NOT NULL
  );
`)

db.exec(`
  -- Every media file (mirrored /media/... and uploaded /uploads/...) - see data/media-repo.ts.
  CREATE TABLE IF NOT EXISTS media_files (
    path TEXT PRIMARY KEY,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    modified_at TEXT NOT NULL,
    data BLOB NOT NULL
  );
`)

function columnNames(table: string): Set<string> {
  return new Set((db.pragma(`table_info(${table})`) as { name: string }[]).map((column) => column.name))
}

/**
 * Databases created before AGENT.md 6.16 (roles) and 6.15's first schema have
 * columns this code no longer knows about, and miss ones it needs. Everything
 * here is idempotent and runs on every boot, so an old file and a brand-new
 * one end up identical - the server is started by hand (or by compose), with
 * no migration step anyone would remember to run separately.
 */
function migrate(): void {
  const posts = columnNames('posts')
  if (!posts.has('tag_ids')) {
    db.exec(`ALTER TABLE posts ADD COLUMN tag_ids TEXT NOT NULL DEFAULT '[]'`)
  }
  if (!posts.has('image_position')) {
    db.exec(`ALTER TABLE posts ADD COLUMN image_position TEXT NOT NULL DEFAULT 'top'`)
  }

  const users = columnNames('users')
  if (!users.has('permissions')) {
    db.exec(`ALTER TABLE users ADD COLUMN permissions TEXT NOT NULL DEFAULT '[]'`)
  }
  if (users.has('role')) {
    // The three roles this re-implementation used to have, expanded into the
    // capabilities they granted, so nobody loses access when the roles go.
    const legacy: Record<string, string[]> = {
      petrik_mk_leader: [CAPABILITY.SUBMIT_NEWS],
      petrik_deputy_director: [
        CAPABILITY.REVIEW_NEWS,
        CAPABILITY.MANAGE_PUBLISHED,
        CAPABILITY.VIEW_AUDIT_LOG,
        CAPABILITY.MANAGE_TERMS,
        CAPABILITY.MANAGE_USERS,
      ],
      petrik_director: [
        CAPABILITY.REVIEW_NEWS,
        CAPABILITY.MANAGE_PUBLISHED,
        CAPABILITY.VIEW_AUDIT_LOG,
        CAPABILITY.MANAGE_TERMS,
        CAPABILITY.MANAGE_USERS,
      ],
    }
    const update = db.prepare('UPDATE users SET permissions = ? WHERE role = ?')
    for (const [role, capabilities] of Object.entries(legacy)) {
      update.run(JSON.stringify(capabilities), role)
    }
    db.exec('ALTER TABLE users DROP COLUMN role')
  }
  if (users.has('allowed_category_ids')) {
    // Per-account category restrictions are gone - everyone may use every
    // category and tag now (AGENT.md 6.16).
    db.exec('ALTER TABLE users DROP COLUMN allowed_category_ids')
  }

  if (!hadPagesTable) {
    // The first boot with the Szerkesztő: whoever can already manage accounts
    // gets the new right too, so an existing database has someone who can
    // open /szerkeszto/ (and hand the right on) without editing SQL. Only
    // this once - revoking it later on the Fiókok screen sticks.
    const managers = db.prepare('SELECT id, permissions FROM users').all() as { id: string; permissions: string }[]
    const update = db.prepare('UPDATE users SET permissions = ? WHERE id = ?')
    for (const user of managers) {
      const permissions = JSON.parse(user.permissions) as string[]
      if (permissions.includes(CAPABILITY.MANAGE_USERS) && !permissions.includes(CAPABILITY.MANAGE_PAGES)) {
        update.run(JSON.stringify([...permissions, CAPABILITY.MANAGE_PAGES]), user.id)
      }
    }
  }

  if (!hadLibraryTable) {
    // The first boot with the Dokumentumtár: whoever could edit pages keeps
    // being able to touch the documents, so nobody loses access they had.
    // Only this once - revoking it later on the Fiókok screen sticks.
    const editors = db.prepare('SELECT id, permissions FROM users').all() as { id: string; permissions: string }[]
    const update = db.prepare('UPDATE users SET permissions = ? WHERE id = ?')
    for (const user of editors) {
      const permissions = JSON.parse(user.permissions) as string[]
      if (permissions.includes(CAPABILITY.MANAGE_PAGES) && !permissions.includes(CAPABILITY.MANAGE_LIBRARY)) {
        update.run(JSON.stringify([...permissions, CAPABILITY.MANAGE_LIBRARY]), user.id)
      }
    }
  }
}

migrate()
