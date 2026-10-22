/**
 * The edited Dokumentumtár - a single row, like the menu (menu-repo.ts).
 * `null` means nobody has edited it, and the site keeps using the bundled
 * index in src/data/docs.ts.
 */
import type { DocLibrary } from '../../../shared/pnw/page-types.ts'
import { db } from './db.ts'

const selectLibrary = db.prepare('SELECT data, modified_at FROM site_library WHERE id = 1')
const upsert = db.prepare(`
  INSERT INTO site_library (id, data, modified_at) VALUES (1, @data, @modified_at)
  ON CONFLICT(id) DO UPDATE SET data = excluded.data, modified_at = excluded.modified_at
`)
const deleteLibrary = db.prepare('DELETE FROM site_library WHERE id = 1')

export function getLibrary(): { library: DocLibrary; modifiedAt: string } | null {
  const row = selectLibrary.get() as { data: string; modified_at: string } | undefined
  return row ? { library: JSON.parse(row.data), modifiedAt: row.modified_at } : null
}

export function putLibrary(library: DocLibrary): void {
  upsert.run({ data: JSON.stringify(library), modified_at: new Date().toISOString() })
}

export function clearLibrary(): void {
  deleteLibrary.run()
}
