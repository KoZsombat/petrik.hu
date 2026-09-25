import type { AuditEntry } from '../../../shared/pnw/types.ts'
import { db } from './db.ts'

type Row = {
  id: string
  post_id: string
  user_id: string | null
  action: string
  from_status: string
  to_status: string
  note: string | null
  created_at: string
}

function fromRow(row: Row): AuditEntry {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    action: row.action as AuditEntry['action'],
    fromStatus: row.from_status,
    toStatus: row.to_status,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }
}

const insertStatement = db.prepare(`
  INSERT INTO audit_log (id, post_id, user_id, action, from_status, to_status, note, created_at)
  VALUES (@id, @post_id, @user_id, @action, @from_status, @to_status, @note, @created_at)
`)

const selectAll = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?')
const selectByPost = db.prepare('SELECT * FROM audit_log WHERE post_id = ? ORDER BY created_at DESC LIMIT ?')
const selectAllUnbounded = db.prepare('SELECT * FROM audit_log')

export function insertAuditEntry(entry: AuditEntry): void {
  insertStatement.run({
    id: entry.id,
    post_id: entry.postId,
    user_id: entry.userId,
    action: entry.action,
    from_status: entry.fromStatus,
    to_status: entry.toStatus,
    note: entry.note ?? null,
    created_at: entry.createdAt,
  })
}

export function recentAuditEntries(limit: number, postId?: string): AuditEntry[] {
  const rows = (postId ? selectByPost.all(postId, limit) : selectAll.all(limit)) as Row[]
  return rows.map(fromRow)
}

/** Every entry, unfiltered - only the statistics module's average-approval-time calc needs this. */
export function allAuditEntries(): AuditEntry[] {
  return (selectAllUnbounded.all() as Row[]).map(fromRow)
}
