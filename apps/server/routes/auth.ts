import { Router } from 'express'
import type { Response } from 'express'
import bcrypt from 'bcryptjs'
import type { LoginErrorCode } from '../../../shared/pnw/types.ts'
import { findUserByUsername } from '../data/users-repo.ts'
import { sessionUser } from '../middleware/auth.ts'
import { SHOW_DEMO_LOGINS } from '../config.ts'

const router = Router()

function loginError(res: Response, code: LoginErrorCode): void {
  res.status(401).json({ error: code })
}

/**
 * Brute-force throttle, in memory: 10 failures per account per 15 minutes.
 * bcrypt alone makes guessing slow but does not stop it, and the login form is
 * on a public site. Keyed by the submitted login rather than the IP, because
 * every request arrives from nginx/the tunnel and would share one bucket -
 * which would turn this into a way to lock everyone out. The tradeoff is that
 * a known account can be locked out for 15 minutes by an attacker; that is
 * preferable to unlimited guesses against it.
 */
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 10
const MAX_TRACKED = 1000

type FailureBucket = { count: number; resetAt: number }
const failures = new Map<string, FailureBucket>()

/** Seconds the caller has to wait, or 0 when this key may try again now. */
function retryAfterSeconds(key: string): number {
  const bucket = failures.get(key)
  if (!bucket || bucket.resetAt <= Date.now()) return 0
  return bucket.count >= MAX_FAILURES ? Math.ceil((bucket.resetAt - Date.now()) / 1000) : 0
}

function recordFailure(key: string): void {
  const now = Date.now()
  const bucket = failures.get(key)
  if (!bucket || bucket.resetAt <= now) {
    // Do not let the map grow without bound: drop expired buckets first.
    if (failures.size >= MAX_TRACKED) {
      for (const [tracked, value] of failures) if (value.resetAt <= now) failures.delete(tracked)
    }
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }
  bucket.count += 1
}

/** Ported from PNW_Frontend_Login/PNW_Actions::frontend_login(). */
router.post('/login', async (req, res) => {
  const login = typeof req.body?.login === 'string' ? req.body.login.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!login || !password) {
    loginError(res, 'empty_fields')
    return
  }

  // Case-insensitive, like findUserByUsername().
  const key = login.toLowerCase()
  const retryAfter = retryAfterSeconds(key)
  if (retryAfter > 0) {
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ error: 'too_many_attempts' satisfies LoginErrorCode })
    return
  }

  const user = findUserByUsername(login)
  if (!user) {
    recordFailure(key)
    loginError(res, 'invalid_credentials')
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    recordFailure(key)
    loginError(res, 'invalid_credentials')
    return
  }

  failures.delete(key)

  // PNW_Roles::has_manager_role() has no counterpart: there are no roles
  // (AGENT.md 6.16). An account with an empty permission list can still log
  // in and is shown the "no permission" screen, exactly as the plugin's own
  // render_unauthorized() branch does.
  //
  // A new session id on login (fixation): the pre-login cookie is discarded,
  // so it can never be promoted to an authenticated session.
  req.session.regenerate((regenerateError) => {
    if (regenerateError) {
      console.error('[pnw] login: session regenerate failed', regenerateError)
      res.status(500).json({ error: 'login_failed' })
      return
    }

    req.session.userId = user.id
    req.session.save((saveError) => {
      if (saveError) {
        console.error('[pnw] login: session save failed', saveError)
        res.status(500).json({ error: 'login_failed' })
        return
      }

      res.json({
        user: {
          id: user.id,
          displayName: user.displayName,
          permissions: user.permissions,
        },
      })
    })
  })
})

/** What the login card may show before anyone is logged in - see SHOW_DEMO_LOGINS. */
router.get('/config', (_req, res) => {
  res.json({ demoLogins: SHOW_DEMO_LOGINS })
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true })
  })
})

router.get('/me', (req, res) => {
  const user = sessionUser(req)
  if (!user) {
    res.status(401).json({ error: 'not_logged_in' })
    return
  }
  res.json({ user })
})

export default router
