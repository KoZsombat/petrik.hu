/**
 * The edited site menu (AGENT.md 6.19) - a single row. `null` means nobody
 * has edited it, and the site keeps using the static menu in src/data/site.ts.
 */
import type { SiteMenu } from '../../../shared/pnw/page-types.ts'
import { db } from './db.ts'

const selectMenu = db.prepare('SELECT data, modified_at FROM site_menu WHERE id = 1')
const upsert = db.prepare(`
  INSERT INTO site_menu (id, data, modified_at) VALUES (1, @data, @modified_at)
  ON CONFLICT(id) DO UPDATE SET data = excluded.data, modified_at = excluded.modified_at
`)
const deleteMenu = db.prepare('DELETE FROM site_menu WHERE id = 1')

export function getMenu(): { menu: SiteMenu; modifiedAt: string } | null {
  const row = selectMenu.get() as { data: string; modified_at: string } | undefined
  return row ? { menu: JSON.parse(row.data), modifiedAt: row.modified_at } : null
}

export function putMenu(menu: SiteMenu): void {
  upsert.run({ data: JSON.stringify(menu), modified_at: new Date().toISOString() })
}

export function clearMenu(): void {
  deleteMenu.run()
}
