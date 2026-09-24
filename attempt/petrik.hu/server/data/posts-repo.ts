import type { Post } from '../../shared/pnw/types.ts'
import { db } from './db.ts'

/** The DB row shape (snake_case columns) before it's turned back into a Post. */
type Row = {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  category_ids: string
  featured_image: string | null
  author_id: string
  status: string
  review_note: string | null
  last_reviewer_id: string | null
  last_reviewed_at: string | null
  scheduled_for: string | null
  scheduled_by_id: string | null
  archived_at: string | null
  archived_by_id: string | null
  created_at: string
  modified_at: string
  date: string
}

function fromRow(row: Row): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: JSON.parse(row.content),
    excerpt: row.excerpt,
    categoryIds: JSON.parse(row.category_ids),
    featuredImage: row.featured_image ?? undefined,
    authorId: row.author_id,
    status: row.status as Post['status'],
    reviewNote: row.review_note ?? undefined,
    lastReviewerId: row.last_reviewer_id ?? undefined,
    lastReviewedAt: row.last_reviewed_at ?? undefined,
    scheduledFor: row.scheduled_for ?? undefined,
    scheduledById: row.scheduled_by_id ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    archivedById: row.archived_by_id ?? undefined,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
    date: row.date,
  }
}

function toRow(post: Post): Row {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: JSON.stringify(post.content),
    excerpt: post.excerpt,
    category_ids: JSON.stringify(post.categoryIds),
    featured_image: post.featuredImage ?? null,
    author_id: post.authorId,
    status: post.status,
    review_note: post.reviewNote ?? null,
    last_reviewer_id: post.lastReviewerId ?? null,
    last_reviewed_at: post.lastReviewedAt ?? null,
    scheduled_for: post.scheduledFor ?? null,
    scheduled_by_id: post.scheduledById ?? null,
    archived_at: post.archivedAt ?? null,
    archived_by_id: post.archivedById ?? null,
    created_at: post.createdAt,
    modified_at: post.modifiedAt,
    date: post.date,
  }
}

const COLUMNS =
  'id, slug, title, content, excerpt, category_ids, featured_image, author_id, status, review_note, last_reviewer_id, last_reviewed_at, scheduled_for, scheduled_by_id, archived_at, archived_by_id, created_at, modified_at, date'

const selectAll = db.prepare(`SELECT ${COLUMNS} FROM posts`)
const selectById = db.prepare(`SELECT ${COLUMNS} FROM posts WHERE id = ?`)
const selectBySlug = db.prepare(`SELECT ${COLUMNS} FROM posts WHERE slug = ?`)
const selectByStatus = db.prepare(`SELECT ${COLUMNS} FROM posts WHERE status = ? ORDER BY date DESC`)
const selectSlugs = db.prepare('SELECT slug FROM posts')
const deleteById = db.prepare('DELETE FROM posts WHERE id = ?')

const insertStatement = db.prepare(`
  INSERT INTO posts (${COLUMNS})
  VALUES (@id, @slug, @title, @content, @excerpt, @category_ids, @featured_image, @author_id, @status,
    @review_note, @last_reviewer_id, @last_reviewed_at, @scheduled_for, @scheduled_by_id,
    @archived_at, @archived_by_id, @created_at, @modified_at, @date)
`)

const updateStatement = db.prepare(`
  UPDATE posts SET
    title = @title, content = @content, excerpt = @excerpt, category_ids = @category_ids,
    featured_image = @featured_image, status = @status, review_note = @review_note,
    last_reviewer_id = @last_reviewer_id, last_reviewed_at = @last_reviewed_at,
    scheduled_for = @scheduled_for, scheduled_by_id = @scheduled_by_id,
    archived_at = @archived_at, archived_by_id = @archived_by_id, modified_at = @modified_at, date = @date
  WHERE id = @id
`)

export function allPosts(): Post[] {
  return (selectAll.all() as Row[]).map(fromRow)
}

export function findPost(id: string): Post | undefined {
  const row = selectById.get(id) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function findPostBySlug(slug: string): Post | undefined {
  const row = selectBySlug.get(slug) as Row | undefined
  return row ? fromRow(row) : undefined
}

export function postsByStatus(status: string): Post[] {
  return (selectByStatus.all(status) as Row[]).map(fromRow)
}

export function existingSlugs(): Set<string> {
  return new Set((selectSlugs.all() as { slug: string }[]).map((row) => row.slug))
}

export function insertPost(post: Post): void {
  insertStatement.run(toRow(post))
}

export function updatePost(id: string, updater: (post: Post) => Post): Post {
  const existing = findPost(id)
  if (!existing) throw new Error(`no such post: ${id}`)
  const next = updater(existing)
  updateStatement.run(toRow(next))
  return next
}

export function removePost(id: string): void {
  deleteById.run(id)
}
