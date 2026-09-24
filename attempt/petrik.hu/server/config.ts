/**
 * Shared configuration for the /hirkezelo/ Express backend - see AGENT.md
 * 6.15. Mirrors the shape of scripts/mirror.ts's constants, one level up: a
 * single file every other server module reads paths and flags from.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SERVER_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)))
export const PROJECT_ROOT = resolve(SERVER_ROOT, '..')

export const DATA_DIR = resolve(SERVER_ROOT, 'data/db')
export const DATABASE_FILE = resolve(DATA_DIR, 'hirkezelo.db')

export const UPLOADS_DIR = resolve(SERVER_ROOT, 'uploads')
export const UPLOADS_URL_PREFIX = '/uploads'

export const DIST_DIR = resolve(PROJECT_ROOT, 'dist')

export const PORT = Number(process.env.PNW_PORT ?? 4000)

/**
 * A real secret in production is an env var, not this fallback - but there is
 * no deployment pipeline for this yet, so a fixed dev default keeps `npm run
 * server` working out of the box for a pilot with a handful of known users.
 */
export const SESSION_SECRET = process.env.PNW_SESSION_SECRET ?? 'petrik-news-workflow-dev-secret-change-me'

/**
 * The real plugin's PNW_TEST_MODE, ported as a real toggle rather than
 * hard-coded true - by explicit user request, approving a submission here
 * really publishes it (GET /api/public/posts, the /hirek/:slug/ page, the
 * site's recent-posts widgets - see AGENT.md 6.15). It never touches the
 * real petrik.hu mirror data (src/data/posts.ts) either way; this is its
 * own, separate SQLite database. Flip to `true` to restore the pilot's
 * approve-but-never-publish behavior without touching any route logic -
 * every TEST_MODE check in server/routes/posts.ts reads this one constant.
 */
export const TEST_MODE = false as const

/** How often the schedule-publish sweep runs (ms). */
export const SCHEDULE_CHECK_INTERVAL_MS = 60_000
