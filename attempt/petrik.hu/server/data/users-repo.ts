/**
 * Hírkezelő accounts, in SQLite (see AGENT.md 6.15) - replaces the earlier
 * hardcoded seed-users.ts now that accounts are managed from inside the app
 * (Users.tsx) rather than by editing source and restarting the server.
 */
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { ROLE } from '../../shared/pnw/types.ts'
import type { Role } from '../../shared/pnw/types.ts'
import { db } from './db.ts'

export type UserRecord = {
  id: string
  username: string
  displayName: string
  passwordHash: string
  role: Role
  allowedCategoryIds?: string[]
}

type Row = {
  id: string
  username: string
  display_name: string
  password_hash: string
  role: string
  allowed_category_ids: string | null
}

function fromRow(row: Row): UserRecord {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    role: row.role as Role,
    allowedCategoryIds: row.allowed_category_ids ? JSON.parse(row.allowed_category_ids) : undefined,
  }
}

function toRow(user: UserRecord): Row {
  return {
    id: user.id,
    username: user.username,
    display_name: user.displayName,
    password_hash: user.passwordHash,
    role: user.role,
    allowed_category_ids:
      user.allowedCategoryIds && user.allowedCategoryIds.length > 0
        ? JSON.stringify(user.allowedCategoryIds)
        : null,
  }
}

const selectAll = db.prepare('SELECT * FROM users ORDER BY display_name COLLATE NOCASE')
const selectById = db.prepare('SELECT * FROM users WHERE id = ?')
const selectByUsername = db.prepare('SELECT * FROM users WHERE lower(username) = lower(?)')
const countAll = db.prepare('SELECT COUNT(*) AS n FROM users')
const insertStatement = db.prepare(`
  INSERT INTO users (id, username, display_name, password_hash, role, allowed_category_ids)
  VALUES (@id, @username, @display_name, @password_hash, @role, @allowed_category_ids)
`)
const updateStatement = db.prepare(`
  UPDATE users SET username = @username, display_name = @display_name, password_hash = @password_hash,
    role = @role, allowed_category_ids = @allowed_category_ids
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
 * screen exactly like any account created there.
 */
export function seedInitialUsers(): void {
  const { n } = countAll.get() as { n: number }
  if (n > 0) return

  const seed: { username: string; displayName: string; role: Role; password: string; allowedCategoryIds?: string[] }[] = [
    {
      username: 'mk.vezeto',
      displayName: 'Kovács Anna',
      role: ROLE.MK_LEADER,
      password: 'PetrikMK2026!',
      allowedCategoryIds: ['/kategoria/hirek/', '/kategoria/oktatas/'],
    },
    { username: 'helyettes', displayName: 'Nagy Péter', role: ROLE.DEPUTY, password: 'PetrikHelyettes2026!' },
    { username: 'igazgato', displayName: 'Szabó Éva', role: ROLE.DIRECTOR, password: 'PetrikIgazgato2026!' },
  ]

  for (const user of seed) {
    insertUser({
      id: randomUUID(),
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      allowedCategoryIds: user.allowedCategoryIds,
      passwordHash: bcrypt.hashSync(user.password, 10),
    })
  }
}
