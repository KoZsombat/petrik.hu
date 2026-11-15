/**
 * The /hirkezelo/ backend - see AGENT.md 6.15 for why this exists and what it
 * knowingly does differently from the real WordPress plugin it re-implements.
 *
 * Run it with `npm run server` (= `node --experimental-strip-types index.ts` in apps/server),
 * exactly like scripts/*.ts already run in this repo - no separate build step.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import express from 'express'
import session from 'express-session'
import { STATUS } from '../../shared/pnw/types.ts'
import {
  assertProductionConfig,
  DIST_DIR,
  PORT,
  SCHEDULE_CHECK_INTERVAL_MS,
  SESSION_SECRET,
  MEDIA_SEED_DIR,
  MEDIA_URL_PREFIX,
  UPLOADS_DIR,
  UPLOADS_URL_PREFIX,
} from './config.ts'
import { attachUser } from './middleware/auth.ts'
import { allPosts, updatePost } from './data/posts-repo.ts'
import { seedInitialUsers } from './data/users-repo.ts'
import { seedInitialTerms } from './data/terms-repo.ts'
import { importDirectory, mediaRouter } from './lib/media.ts'
import { SqliteSessionStore } from './lib/session-store.ts'
import { logAudit } from './lib/audit.ts'
import { notifyScheduledPublished } from './lib/notifications.ts'
import authRoutes from './routes/auth.ts'
import postRoutes from './routes/posts.ts'
import publicRoutes from './routes/public.ts'
import auditRoutes from './routes/audit.ts'
import statisticsRoutes from './routes/statistics.ts'
import usersRoutes from './routes/users.ts'
import termsRoutes from './routes/terms.ts'
import pageRoutes from './routes/pages.ts'
import libraryRoutes from './routes/library.ts'

// Before anything reads or writes data: a public start with the repo's own
// session secret, or with demo passwords about to be seeded, is refused.
assertProductionConfig()

seedInitialUsers()
seedInitialTerms()

// Media lives in the database; copy in whatever the folders still hold (once - see lib/media.ts).
for (const [dir, prefix] of [[UPLOADS_DIR, UPLOADS_URL_PREFIX], [MEDIA_SEED_DIR, MEDIA_URL_PREFIX]] as const) {
  const added = importDirectory(dir, prefix)
  if (added > 0) console.log(`[pnw] imported ${added} files from ${dir} into the database`)
}

const app = express()

// nginx (apps/client/nginx.conf) is the only hop in front of this process and
// forwards the original scheme in X-Forwarded-Proto, so req.secure and the
// session cookie's Secure flag follow the public HTTPS origin.
app.set('trust proxy', 1)

// A Szerkesztő page document (AGENT.md 6.20) easily outgrows express's 100 KB default
// (the staff page alone is ~120 KB; nginx's client_max_body_size is 10m).
app.use(express.json({ limit: '8mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    name: 'pnw.sid',
    secret: SESSION_SECRET,
    // Sessions outlive the process (lib/session-store.ts): a restart or a
    // redeploy no longer logs everyone out.
    store: new SqliteSessionStore(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // Secure exactly when the request arrived over HTTPS: the public site
      // always does, a local http://localhost does not, and neither breaks.
      secure: 'auto',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
)
app.use(attachUser)

// Uploads get a fresh uuid name each, the mirrored files never change: both cache hard.
app.use(UPLOADS_URL_PREFIX, mediaRouter(UPLOADS_URL_PREFIX, 31536000))
app.use(MEDIA_URL_PREFIX, mediaRouter(MEDIA_URL_PREFIX, 86400))

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/terms', termsRoutes)
// Before /api/pages, whose router would refuse everyone without MANAGE_PAGES.
app.use('/api/pages/library', libraryRoutes)
app.use('/api/pages', pageRoutes)

// The rest of the site is a static pixel-port that needs no server at all;
// this only serves it too so `npm run server` is a complete way to run the
// whole app after `npm run build` in one process. In Docker the client is a
// separate nginx container (apps/client/Dockerfile) and DIST_DIR is absent.
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith(UPLOADS_URL_PREFIX) || req.path.startsWith(MEDIA_URL_PREFIX + '/')) {
      next()
      return
    }
    res.sendFile(join(DIST_DIR, 'index.html'))
  })
}

/** Ported from PNW_Actions::track_scheduled_publication() - WP-Cron has no equivalent here. */
function sweepScheduledPosts(): void {
  const due = allPosts().filter(
    (post) => post.status === STATUS.FUTURE && new Date(post.date).getTime() <= Date.now(),
  )

  for (const post of due) {
    updatePost(post.id, (p) => ({ ...p, status: STATUS.PUBLISH }))
    logAudit(
      post.id,
      'scheduled_published',
      STATUS.FUTURE,
      STATUS.PUBLISH,
      'Az időzített hír automatikusan megjelent.',
    )
    notifyScheduledPublished(post)
  }
}

setInterval(() => {
  try {
    sweepScheduledPosts()
  } catch (error) {
    console.error('[pnw] scheduled-publish sweep failed', error)
  }
}, SCHEDULE_CHECK_INTERVAL_MS)

app.listen(PORT, () => {
  console.log(`[pnw] Hírkezelő backend listening on http://localhost:${PORT}`)
})
