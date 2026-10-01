/**
 * Every page saved in the Szerkesztő (AGENT.md 6.20) - created there, or an
 * edit / tombstone of a mirrored route. The same shape as posts-repo.ts:
 * prepared statements, fromRow/toRow, a JSON text column, synchronous calls.
 */
import type { PageDocument, PageOrigin, PageStatus, PageTemplate, StoredPage } from '../../../shared/pnw/page-types.ts'
import { normalizeDocument } from '../../../shared/pnw/page-doc.ts'
import { db } from './db.ts'

type Row = {
  id: string
  route: string
  origin: string
  template: string
  deleted: number
  slug: string | null
  title: string
  description: string
  document: string | null
  status: string
  author_id: string
  created_at: string
  modified_at: string
  modified_by_id: string | null
}

function fromRow(row: Row): StoredPage {
  const page: StoredPage = {
    id: row.id,
    route: row.route,
    origin: row.origin as PageOrigin,
    template: row.template as PageTemplate,
    deleted: row.deleted === 1,
    title: row.title,
    description: row.description,
    // Documents the v1 builder saved are brought up to the current model on the way out.
    document: row.document ? normalizeDocument(JSON.parse(row.document) as PageDocument) : null,
    status: row.status as PageStatus,
    authorId: row.author_id,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  }
  if (row.slug) page.slug = row.slug
  if (row.modified_by_id) page.modifiedById = row.modified_by_id
  return page
}

function toRow(page: StoredPage): Row {
  return {
    id: page.id,
    route: page.route,
    origin: page.origin,
    template: page.template,
    deleted: page.deleted ? 1 : 0,
    slug: page.slug ?? null,
    title: page.title,
    description: page.description,
    document: page.document ? JSON.stringify(page.document) : null,
    status: page.status,
    author_id: page.authorId,
    created_at: page.createdAt,
    modified_at: page.modifiedAt,
    modified_by_id: page.modifiedById ?? null,
  }
}

const COLUMNS =
  'id, route, origin, template, deleted, slug, title, description, document, status, author_id, created_at, modified_at, modified_by_id'

const selectAll = db.prepare(`SELECT ${COLUMNS} FROM pages ORDER BY modified_at DESC`)
const selectById = db.prepare(`SELECT ${COLUMNS} FROM pages WHERE id = ?`)
const selectByRoute = db.prepare(`SELECT ${COLUMNS} FROM pages WHERE route = ?`)
const selectSlugs = db.prepare('SELECT slug FROM pages WHERE slug IS NOT NULL')
const deleteById = db.prepare('DELETE FROM pages WHERE id = ?')
const deleteByRoute = db.prepare('DELETE FROM pages WHERE route = ?')

const upsertStatement = db.prepare(`
  INSERT INTO pages (${COLUMNS})
  VALUES (@id, @route, @origin, @template, @deleted, @slug, @title, @description, @document, @status, @author_id, @created_at, @modified_at, @modified_by_id)
  ON CONFLICT(id) DO UPDATE SET
    template = excluded.template, deleted = excluded.deleted, title = excluded.title,
    description = excluded.description, document = excluded.document, status = excluded.status,
    modified_at = excluded.modified_at, modified_by_id = excluded.modified_by_id
`)

/** A page as the list screen sees it: no document, which can be hundreds of KB. */
export type PageSummary = Omit<StoredPage, 'document'>

export function listPages(): StoredPage[] {
  return (selectAll.all() as Row[]).map(fromRow)
}

export function listSummaries(): PageSummary[] {
  return listPages().map(({ document, ...summary }) => {
    void document
    return summary
  })
}

export function getPage(id: string): StoredPage | undefined {
  const row = selectById.get(id) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function getPageByRoute(route: string): StoredPage | undefined {
  const row = selectByRoute.get(route) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function existingPageSlugs(): Set<string> {
  return new Set((selectSlugs.all() as { slug: string }[]).map((row) => row.slug))
}

/** Inserts a page, or updates the one with that id. The route and slug never change - they are the page's public URL. */
export function savePage(page: StoredPage): StoredPage {
  upsertStatement.run(toRow(page))
  return page
}

export function deletePage(id: string): void {
  deleteById.run(id)
}

/** "Visszaállítás az eredetire": the row goes, the bundled default is back. */
export function deletePageByRoute(route: string): void {
  deleteByRoute.run(route)
}
