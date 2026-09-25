/**
 * The override layer over the mirrored pages (AGENT.md 6.19): one JSON row
 * per route. No row means the page renders exactly as generated.
 */
import type { PageOverrides } from '../../../shared/pnw/page-types.ts'
import { db } from './db.ts'

type Row = { route: string; data: string; modified_at: string; modified_by_id: string | null }

const selectOne = db.prepare('SELECT route, data, modified_at, modified_by_id FROM page_overrides WHERE route = ?')
const selectAll = db.prepare('SELECT route, data, modified_at, modified_by_id FROM page_overrides')
const upsert = db.prepare(`
  INSERT INTO page_overrides (route, data, modified_at, modified_by_id)
  VALUES (@route, @data, @modified_at, @modified_by_id)
  ON CONFLICT(route) DO UPDATE SET
    data = excluded.data, modified_at = excluded.modified_at, modified_by_id = excluded.modified_by_id
`)
const deleteOne = db.prepare('DELETE FROM page_overrides WHERE route = ?')

export type StoredOverrides = { overrides: PageOverrides; modifiedAt: string; modifiedById?: string }

function fromRow(row: Row): StoredOverrides {
  return {
    overrides: JSON.parse(row.data),
    modifiedAt: row.modified_at,
    modifiedById: row.modified_by_id ?? undefined,
  }
}

export function getOverrides(route: string): StoredOverrides | undefined {
  const row = selectOne.get(route) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function allOverrides(): StoredOverrides[] {
  return (selectAll.all() as Row[]).map(fromRow)
}

export function putOverrides(overrides: PageOverrides, userId: string): StoredOverrides {
  const modifiedAt = new Date().toISOString()
  upsert.run({
    route: overrides.route,
    data: JSON.stringify(overrides),
    modified_at: modifiedAt,
    modified_by_id: userId,
  })
  return { overrides, modifiedAt, modifiedById: userId }
}

export function clearOverrides(route: string): void {
  deleteOne.run(route)
}
