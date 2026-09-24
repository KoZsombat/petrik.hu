import { useEffect, useState } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import type { AuditEntry } from '../../../shared/pnw/types.ts'
import { useUsers } from '../../lib/hirkezelo/useUsers.ts'
import AuditTimeline from './AuditTimeline.tsx'

/** Ported from PNW_Frontend_Audit_Trait::render_audit(). */
export default function Audit() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null)
  const [postTitles, setPostTitles] = useState<Map<string, string>>(new Map())
  const authors = useUsers()

  useEffect(() => {
    let cancelled = false

    api.fullAuditLog(100).then(async ({ entries }) => {
      if (cancelled) return
      setEntries(entries)

      const ids = Array.from(new Set(entries.map((entry) => entry.postId)))
      const titles = new Map<string, string>()
      await Promise.all(
        ids.map(async (id) => {
          try {
            const { post } = await api.getPost(id)
            titles.set(id, post.title || '(Névtelen hír)')
          } catch {
            // Trashed posts are removed from the store entirely - the
            // timeline falls back to showing the id for those.
          }
        }),
      )
      if (!cancelled) setPostTitles(titles)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Audit</div>
          <h3>Hírkezelési napló</h3>
          <p>A legutóbbi 100 workflow-esemény.</p>
        </div>
      </div>
      {!entries ? (
        <div className="pnw-empty-inline">Betöltés…</div>
      ) : (
        <AuditTimeline entries={entries} authors={authors} postTitles={postTitles} />
      )}
    </section>
  )
}
