import { Router } from 'express'
import bcrypt from 'bcryptjs'
import type { LoginErrorCode } from '../../../shared/pnw/types.ts'
import { findUserByUsername } from '../data/users-repo.ts'
import { sessionUser } from '../middleware/auth.ts'
import { SHOW_DEMO_LOGINS } from '../config.ts'

const router = Router()

function loginError(res: import('express').Response, code: LoginErrorCode): void {
  res.status(401).json({ error: code })
}

/** Ported from PNW_Frontend_Login/PNW_Actions::frontend_login(). */
router.post('/login', async (req, res) => {
  const login = typeof req.body?.login === 'string' ? req.body.login.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!login || !password) {
    loginError(res, 'empty_fields')
    return
  }

  const user = findUserByUsername(login)
  if (!user) {
    loginError(res, 'invalid_credentials')
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    loginError(res, 'invalid_credentials')
    return
  }

  // PNW_Roles::has_manager_role() has no counterpart: there are no roles
  // (AGENT.md 6.16). An account with an empty permission list can still log
  // in and is shown the "no permission" screen, exactly as the plugin's own
  // render_unauthorized() branch does.
  req.session.userId = user.id
  res.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      permissions: user.permissions,
    },
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
