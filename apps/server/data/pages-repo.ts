/**
 * Pages created in the Szerkesztő (AGENT.md 6.19) - the same shape as
 * posts-repo.ts: prepared statements, fromRow/toRow, a JSON text column,
 * synchronous calls.
 */
import type { BuilderPage } from '../../../shared/pnw/page-types.ts'
import { db } from './db.ts'

type Row = {
  id: string
  slug: string
  title: string
  description: string
  document: string
  status: string
  author_id: string
  created_at: string
  modified_at: string
}

function fromRow(row: Row): BuilderPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    document: JSON.parse(row.document),
    status: row.status as BuilderPage['status'],
    authorId: row.author_id,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  }
}

function toRow(page: BuilderPage): Row {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description,
    document: JSON.stringify(page.document),
    status: page.status,
    author_id: page.authorId,
    created_at: page.createdAt,
    modified_at: page.modifiedAt,
  }
}

const COLUMNS = 'id, slug, title, description, document, status, author_id, created_at, modified_at'

const selectAll = db.prepare(`SELECT ${COLUMNS} FROM pages ORDER BY modified_at DESC`)
const selectById = db.prepare(`SELECT ${COLUMNS} FROM pages WHERE id = ?`)
const selectBySlug = db.prepare(`SELECT ${COLUMNS} FROM pages WHERE slug = ?`)
const selectSlugs = db.prepare('SELECT slug FROM pages')
const deleteById = db.prepare('DELETE FROM pages WHERE id = ?')

const insertStatement = db.prepare(`
  INSERT INTO pages (${COLUMNS})
  VALUES (@id, @slug, @title, @description, @document, @status, @author_id, @created_at, @modified_at)
`)

const updateStatement = db.prepare(`
  UPDATE pages SET
    title = @title, description = @description, document = @document, status = @status, modified_at = @modified_at
  WHERE id = @id
`)

export function listPages(): BuilderPage[] {
  return (selectAll.all() as Row[]).map(fromRow)
}

export function getPage(id: string): BuilderPage | undefined {
  const row = selectById.get(id) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function getPageBySlug(slug: string): BuilderPage | undefined {
  const row = selectBySlug.get(slug) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function existingPageSlugs(): Set<string> {
  return new Set((selectSlugs.all() as { slug: string }[]).map((row) => row.slug))
}

export function createPage(page: BuilderPage): void {
  insertStatement.run(toRow(page))
}

/** The slug is not updatable, on purpose - it is the page's public URL. */
export function updatePage(id: string, updater: (page: BuilderPage) => BuilderPage): BuilderPage {
  const existing = getPage(id)
  if (!existing) throw new Error(`no such page: ${id}`)
  const next = updater(existing)
  updateStatement.run(toRow(next))
  return next
}

export function deletePage(id: string): void {
  deleteById.run(id)
}
