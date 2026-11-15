/**
 * Shared configuration for the /hirkezelo/ Express backend - see AGENT.md
 * 6.15. Mirrors the shape of scripts/mirror.ts's constants, one level up: a
 * single file every other server module reads paths and flags from.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SERVER_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)))
/** The repo root - apps/server is two levels below it since the client/server split. */
export const PROJECT_ROOT = resolve(SERVER_ROOT, '../..')

/** `PNW_DATA_DIR` / `PNW_UPLOADS_DIR` point the server at another database or upload folder - a scratch copy for a migration dry run, say. */
export const DATA_DIR = process.env.PNW_DATA_DIR ? resolve(process.env.PNW_DATA_DIR) : resolve(SERVER_ROOT, 'data/db')
export const DATABASE_FILE = resolve(DATA_DIR, 'hirkezelo.db')

export const UPLOADS_DIR = process.env.PNW_UPLOADS_DIR ? resolve(process.env.PNW_UPLOADS_DIR) : resolve(SERVER_ROOT, 'uploads')
export const UPLOADS_URL_PREFIX = '/uploads'

/**
 * Media lives in the database (data/media-repo.ts). Files found in these
 * folders at startup are copied in once: UPLOADS_DIR is what an install from
 * before that kept its uploads in, and `PNW_MEDIA_SEED_DIR` (default: the
 * client's public/media, where a checkout has the mirrored files) is the
 * mirrored images and PDFs, served as `/media/...`.
 */
export const MEDIA_URL_PREFIX = '/media'
export const MEDIA_SEED_DIR = process.env.PNW_MEDIA_SEED_DIR
  ? resolve(process.env.PNW_MEDIA_SEED_DIR)
  : resolve(PROJECT_ROOT, 'apps/client/public/media')

/**
 * The client's build output. Only used when present - i.e. a local
 * `npm run build` + `npm run server` in one process. In Docker the client is
 * its own nginx container and this folder does not exist in the server image.
 */
export const DIST_DIR = resolve(PROJECT_ROOT, 'apps/client/dist')

export const PORT = Number(process.env.PNW_PORT ?? 4000)

/**
 * A real secret in production is an env var, not this fallback - the fallback
 * only keeps `npm run server` working out of the box locally. A production
 * start with it is refused (assertProductionConfig), because the value is in
 * this repository.
 */
const DEV_SECRET = 'petrik-news-workflow-dev-secret-change-me'
export const SESSION_SECRET = process.env.PNW_SESSION_SECRET || DEV_SECRET

/** The Docker image sets this; a local `npm run server` does not. */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

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

/**
 * Whether the login card prints the three seeded demo accounts and their
 * passwords. On by default for local runs (`npm run server`), off by default
 * in the Docker image (NODE_ENV=production) - a public deployment must never
 * advertise working credentials. `PNW_SHOW_DEMO_LOGINS=true|false` overrides.
 */
export const SHOW_DEMO_LOGINS =
  process.env.PNW_SHOW_DEMO_LOGINS !== undefined
    ? process.env.PNW_SHOW_DEMO_LOGINS === 'true'
    : process.env.NODE_ENV !== 'production'

/**
 * When set, the three accounts seeded into an **empty** database get this
 * password instead of the demo ones in users-repo.ts (which are in the repo,
 * hence public). Has no effect on a database that already has accounts.
 * Required in production - see assertProductionConfig().
 */
export const SEED_PASSWORD = process.env.PNW_SEED_PASSWORD || undefined

/** docker-compose.yml falls back to the same dev string, so this compares the value. */
export const USING_DEFAULT_SECRET = SESSION_SECRET === DEV_SECRET

/**
 * Refuses a public start that would be trivially compromised, rather than
 * logging a warning nobody reads:
 *
 * - the session secret would be the public dev constant, so anyone with the
 *   repo could tamper with login cookies;
 * - the database is empty and no seed password is set, so the three seeded
 *   accounts (`mk.vezeto`, `helyettes`, `igazgato` - the last two with
 *   account/page/library management) would get passwords that are in the
 *   repository.
 *
 * Both are harmless locally, where `NODE_ENV` is not `production` and the
 * demo passwords are the point.
 */
export function assertProductionConfig(): void {
  if (!IS_PRODUCTION) return

  if (USING_DEFAULT_SECRET) {
    console.error(
      '[pnw] PNW_SESSION_SECRET is the public development default. ' +
        'Set a real one (openssl rand -hex 32) and restart.',
    )
    process.exit(1)
  }

  if (!SEED_PASSWORD) {
    console.error(
      '[pnw] PNW_SEED_PASSWORD is empty. On an empty database the seeded accounts would get ' +
        'the demo passwords that are public in this repository. Set it and restart.',
    )
    process.exit(1)
  }
}
