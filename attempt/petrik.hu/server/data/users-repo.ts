/**
 * Hírkezelő accounts, in SQLite (see AGENT.md 6.15) - replaces the earlier
 * hardcoded seed-users.ts now that accounts are managed from inside the app
 * (Users.tsx) rather than by editing source and restarting the server.
 *
 * An account carries a plain list of capabilities and **no role** (AGENT.md
 * 6.16); db.ts migrates the old `role` column into one of these lists.
 */
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { CAPABILITY } from '../../shared/pnw/types.ts'
import type { Capability } from '../../shared/pnw/types.ts'
import { isCapability } from '../../shared/pnw/permissions.ts'
import { db } from './db.ts'

export type UserRecord = {
  id: string
  username: string
  displayName: string
  passwordHash: string
  permissions: Capability[]
}

type Row = {
  id: string
  username: string
  display_name: string
  password_hash: string
  permissions: string
}

function parsePermissions(raw: string): Capability[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCapability)
  } catch {
    return []
  }
}

function fromRow(row: Row): UserRecord {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    permissions: parsePermissions(row.permissions),
  }
}

function toRow(user: UserRecord): Row {
  return {
    id: user.id,
    username: user.username,
    display_name: user.displayName,
    password_hash: user.passwordHash,
    permissions: JSON.stringify(user.permissions),
  }
}

const COLUMNS = 'id, username, display_name, password_hash, permissions'

const selectAll = db.prepare(`SELECT ${COLUMNS} FROM users ORDER BY display_name COLLATE NOCASE`)
const selectById = db.prepare(`SELECT ${COLUMNS} FROM users WHERE id = ?`)
const selectByUsername = db.prepare(`SELECT ${COLUMNS} FROM users WHERE lower(username) = lower(?)`)
const countAll = db.prepare('SELECT COUNT(*) AS n FROM users')
const insertStatement = db.prepare(`
  INSERT INTO users (id, username, display_name, password_hash, permissions)
  VALUES (@id, @username, @display_name, @password_hash, @permissions)
`)
const updateStatement = db.prepare(`
  UPDATE users SET username = @username, display_name = @display_name, password_hash = @password_hash,
    permissions = @permissions
  WHERE id = @id
`)
const deleteStatement = db.prepare('DELETE FROM users WHERE id = ?')

export function allUsers(): UserRecord[] {
  return (selectAll.all() as Row[]).map(fromRow)
}

export function findUserById(id: string): UserRecord | undefined {
  const row = selectById.get(id) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function findUserByUsername(username: string): UserRecord | undefined {
  const row = selectByUsername.get(username.trim()) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function insertUser(user: UserRecord): void {
  insertStatement.run(toRow(user))
}

export function updateUser(id: string, updater: (user: UserRecord) => UserRecord): UserRecord {
  const existing = findUserById(id)
  if (!existing) throw new Error(`no such user: ${id}`)
  const next = updater(existing)
  updateStatement.run(toRow(next))
  return next
}

export function removeUser(id: string): void {
  deleteStatement.run(id)
}

/**
 * The three original demo accounts (see 6.15), seeded once into an empty
 * table - so a fresh database still boots with working logins, but after
 * that these are ordinary rows, editable/removable from the Users.tsx
 * screen exactly like any account created there. Their permission sets are
 * what the deleted roles used to grant them (AGENT.md 6.16), plus the
 * Szerkesztő's right for the two leaders (6.19).
 */
export function seedInitialUsers(): void {
  const { n } = countAll.get() as { n: number }
  if (n > 0) return

  const reviewerPermissions: Capability[] = [
    CAPABILITY.REVIEW_NEWS,
    CAPABILITY.MANAGE_PUBLISHED,
    CAPABILITY.VIEW_AUDIT_LOG,
    CAPABILITY.MANAGE_TERMS,
    CAPABILITY.MANAGE_USERS,
    // The Szerkesztő (AGENT.md 6.19); mk.vezeto deliberately has no such right.
    CAPABILITY.MANAGE_PAGES,
  ]

  const seed: { username: string; displayName: string; password: string; permissions: Capability[] }[] = [
    {
      username: 'mk.vezeto',
      displayName: 'Kovács Anna',
      password: 'PetrikMK2026!',
      permissions: [CAPABILITY.SUBMIT_NEWS],
    },
    {
      username: 'helyettes',
      displayName: 'Nagy Péter',
      password: 'PetrikHelyettes2026!',
      permissions: reviewerPermissions,
    },
    {
      username: 'igazgato',
      displayName: 'Szabó Éva',
      password: 'PetrikIgazgato2026!',
      permissions: reviewerPermissions,
    },
  ]

  for (const user of seed) {
    insertUser({
      id: randomUUID(),
      username: user.username,
      displayName: user.displayName,
      permissions: user.permissions,
      passwordHash: bcrypt.hashSync(user.password, 10),
    })
  }
}
