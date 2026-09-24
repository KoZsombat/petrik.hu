/**
 * Hírkezelő account management - no equivalent in the real plugin, which
 * relies on wp-admin's own user screen. Added by user request; both
 * DEPUTY and DIRECTOR get the `pnw_manage_users` capability (see
 * shared/pnw/roles.ts) - see AGENT.md 6.15.
 */
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { ALL_ROLES, canManageUsers } from '../../shared/pnw/roles.ts'
import type { Role } from '../../shared/pnw/types.ts'
import { categories } from '../../shared/pnw/categories.ts'
import { allUsers, findUserByUsername, findUserById, insertUser, removeUser, updateUser } from '../data/users-repo.ts'
import type { UserRecord } from '../data/users-repo.ts'
import { requireCapability, requireLogin } from '../middleware/auth.ts'

const router = Router()

const ALLOWED_CATEGORY_IDS = new Set(categories.map((category) => category.id))
const MIN_PASSWORD_LENGTH = 8

function toPublic(user: UserRecord) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    allowedCategoryIds: user.allowedCategoryIds,
  }
}

function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ALL_ROLES as string[]).includes(value)
}

function sanitizeCategoryIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ids = value.filter((id): id is string => typeof id === 'string' && ALLOWED_CATEGORY_IDS.has(id))
  return ids.length > 0 ? ids : undefined
}

/**
 * A minimal public directory (no password hashes) so the frontend can turn
 * a post's authorId / audit entry's userId into a display name and role
 * label, and (for account managers) power the Users.tsx screen.
 */
router.get('/', requireLogin, (_req, res) => {
  res.json({ users: allUsers().map(toPublic) })
})

router.post('/', requireCapability('pnw_manage_users'), (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const role = req.body?.role

  if (!username || !displayName) {
    res.status(422).json({ error: 'missing_fields' })
    return
  }
  if (!isValidRole(role)) {
    res.status(422).json({ error: 'invalid_role' })
    return
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(422).json({ error: 'password_too_short' })
    return
  }
  if (findUserByUsername(username)) {
    res.status(409).json({ error: 'username_taken' })
    return
  }

  const user: UserRecord = {
    id: randomUUID(),
    username,
    displayName,
    role,
    allowedCategoryIds: role === 'petrik_mk_leader' ? sanitizeCategoryIds(req.body?.allowedCategoryIds) : undefined,
    passwordHash: bcrypt.hashSync(password, 10),
  }
  insertUser(user)
  res.json({ user: toPublic(user) })
})

router.put('/:id', requireCapability('pnw_manage_users'), (req, res) => {
  const existing = findUserById(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'not_found' })
    return
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const role = req.body?.role

  if (!username || !displayName) {
    res.status(422).json({ error: 'missing_fields' })
    return
  }
  if (!isValidRole(role)) {
    res.status(422).json({ error: 'invalid_role' })
    return
  }
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    res.status(422).json({ error: 'password_too_short' })
    return
  }
  const clash = findUserByUsername(username)
  if (clash && clash.id !== existing.id) {
    res.status(409).json({ error: 'username_taken' })
    return
  }

  const updated = updateUser(existing.id, (user) => ({
    ...user,
    username,
    displayName,
    role,
    allowedCategoryIds: role === 'petrik_mk_leader' ? sanitizeCategoryIds(req.body?.allowedCategoryIds) : undefined,
    passwordHash: password ? bcrypt.hashSync(password, 10) : user.passwordHash,
  }))
  res.json({ user: toPublic(updated) })
})

router.delete('/:id', requireCapability('pnw_manage_users'), (req, res) => {
  if (req.params.id === req.pnwUser!.id) {
    res.status(400).json({ error: 'cannot_delete_self' })
    return
  }
  const existing = findUserById(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'not_found' })
    return
  }

  const otherManagers = allUsers().filter((user) => user.id !== existing.id && canManageUsers(user.role))
  if (otherManagers.length === 0) {
    res.status(400).json({ error: 'last_manager' })
    return
  }

  removeUser(existing.id)
  res.json({ ok: true })
})

export default router
