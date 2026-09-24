/**
 * The /hirkezelo/ backend - see AGENT.md 6.15 for why this exists and what it
 * knowingly does differently from the real WordPress plugin it re-implements.
 *
 * Run it directly with `node --experimental-strip-types server/index.ts`,
 * exactly like scripts/*.ts already run in this repo - no separate build step.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import express from 'express'
import session from 'express-session'
import { STATUS } from '../shared/pnw/types.ts'
import { DIST_DIR, PORT, SCHEDULE_CHECK_INTERVAL_MS, SESSION_SECRET, UPLOADS_DIR, UPLOADS_URL_PREFIX } from './config.ts'
import { attachUser } from './middleware/auth.ts'
import { allPosts, updatePost } from './data/posts-repo.ts'
import { seedInitialUsers } from './data/users-repo.ts'
import { seedInitialTerms } from './data/terms-repo.ts'
import { logAudit } from './lib/audit.ts'
import { notifyScheduledPublished } from './lib/notifications.ts'
import authRoutes from './routes/auth.ts'
import postRoutes from './routes/posts.ts'
import publicRoutes from './routes/public.ts'
import auditRoutes from './routes/audit.ts'
import statisticsRoutes from './routes/statistics.ts'
import usersRoutes from './routes/users.ts'
import termsRoutes from './routes/terms.ts'

seedInitialUsers()
seedInitialTerms()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    name: 'pnw.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
)
app.use(attachUser)

app.use(UPLOADS_URL_PREFIX, express.static(UPLOADS_DIR))

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/terms', termsRoutes)

// The rest of the site is a static pixel-port that needs no server at all;
// this only serves it too so `node server/index.ts` is a complete way to run
// the whole app after `npm run build` in one process. A plain static host
// works fine for every route except /hirkezelo/.
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith(UPLOADS_URL_PREFIX)) {
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
