/**
 * Categories and tags, in SQLite (see AGENT.md 6.16). The earlier
 * shared/pnw/categories.ts was a fixed, build-time list derived from the
 * mirror's category archives; it survives only as the seed
 * (shared/pnw/seed-terms.ts) for a fresh database. From there on terms are
 * ordinary rows: everyone may *use* any of them, and anyone holding
 * `pnw_manage_terms` may add more.
 */
import { randomUUID } from 'node:crypto'
import type { Term, TermKind } from '../../../shared/pnw/types.ts'
import { SEED_CATEGORIES } from '../../../shared/pnw/seed-terms.ts'
import { db } from './db.ts'

type Row = {
  id: string
  kind: string
  name: string
  route: string | null
}

function fromRow(row: Row): Term {
  return {
    id: row.id,
    kind: row.kind as TermKind,
    name: row.name,
    route: row.route ?? undefined,
  }
}

const selectAll = db.prepare('SELECT id, kind, name, route FROM terms ORDER BY name COLLATE NOCASE')
const selectByKind = db.prepare('SELECT id, kind, name, route FROM terms WHERE kind = ? ORDER BY name COLLATE NOCASE')
const selectByName = db.prepare('SELECT id, kind, name, route FROM terms WHERE kind = ? AND lower(name) = lower(?)')
const countAll = db.prepare('SELECT COUNT(*) AS n FROM terms')
const insertStatement = db.prepare(`
  INSERT INTO terms (id, kind, name, route, created_at, created_by_id)
  VALUES (@id, @kind, @name, @route, @created_at, @created_by_id)
`)

export function allTerms(): Term[] {
  return (selectAll.all() as Row[]).map(fromRow)
}

export function termsOfKind(kind: TermKind): Term[] {
  return (selectByKind.all(kind) as Row[]).map(fromRow)
}

export function findTermByName(kind: TermKind, name: string): Term | undefined {
  const row = selectByName.get(kind, name.trim()) as Row | undefined
  return row ? fromRow(row) : undefined
}

/** Ids of every term of one kind - what a post's category/tag list is validated against. */
export function termIdsOfKind(kind: TermKind): Set<string> {
  return new Set(termsOfKind(kind).map((term) => term.id))
}

export function createTerm(kind: TermKind, name: string, createdById: string): Term {
  const term: Term = { id: randomUUID(), kind, name: name.trim() }
  insertStatement.run({
    id: term.id,
    kind: term.kind,
    name: term.name,
    // Only the seeded categories map onto a mirrored archive page; one
    // created here has no archive route, and must not pretend to have one.
    route: null,
    created_at: new Date().toISOString(),
    created_by_id: createdById,
  })
  return term
}

/**
 * The mirror's own WordPress categories, seeded once into an empty table -
 * so the editor's category list starts out exactly as it was before terms
 * became editable. After that these are ordinary rows like any other.
 */
export function seedInitialTerms(): void {
  const { n } = countAll.get() as { n: number }
  if (n > 0) return

  const createdAt = new Date().toISOString()
  const insertAll = db.transaction((terms: Term[]) => {
    for (const term of terms) {
      insertStatement.run({
        id: term.id,
        kind: term.kind,
        name: term.name,
        route: term.route ?? null,
        created_at: createdAt,
        created_by_id: null,
      })
    }
  })
  insertAll(SEED_CATEGORIES)
}
