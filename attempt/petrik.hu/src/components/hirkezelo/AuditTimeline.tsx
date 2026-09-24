import type { AuditEntry } from '../../../shared/pnw/types.ts'
import { auditActionLabel } from '../../../shared/pnw/statuses.ts'
import type { ApiUser } from '../../lib/hirkezelo/api.ts'
import { formatDateTime } from './helpers.ts'

type Props = {
  entries: AuditEntry[]
  authors: Map<string, ApiUser>
  /** postId -> title, shown only in the full log (render_audit()), not the per-post one. */
  postTitles?: Map<string, string>
  compact?: boolean
}

/** Ported from PNW_Frontend_Audit_Trait::render_audit_rows(). */
export default function AuditTimeline({ entries, authors, postTitles, compact }: Props) {
  if (entries.length === 0) {
    return <div className="pnw-empty-inline">Még nincs naplóbejegyzés.</div>
  }

  return (
    <div className={`pnw-timeline${compact ? ' pnw-timeline-compact' : ''}`}>
      {entries.map((entry) => (
        <div className="pnw-timeline-item" key={entry.id}>
          <span className="pnw-timeline-dot" />
          <div>
            <strong>{auditActionLabel(entry.action)}</strong>
            {!compact && postTitles && (
              <span className="pnw-timeline-post">{postTitles.get(entry.postId) ?? `#${entry.postId}`}</span>
            )}
            <small>
              {(entry.userId && authors.get(entry.userId)?.displayName) || 'Rendszer'} ·{' '}
              {formatDateTime(entry.createdAt)}
            </small>
            {entry.note && <p>{entry.note}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
