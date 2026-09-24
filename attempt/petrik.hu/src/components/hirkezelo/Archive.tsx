import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import type { Post } from '../../../shared/pnw/types.ts'
import { useUsers } from '../../lib/hirkezelo/useUsers.ts'
import { useTerms } from '../../lib/terms.ts'
import { termLine, formatDateTime } from './helpers.ts'

/** Ported from PNW_Frontend_Published_Trait::render_archived_news(). */
export default function Archive() {
  const navigate = useNavigate()
  const authors = useUsers()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  async function load(q: string, p: number): Promise<void> {
    setLoading(true)
    const result = await api.listArchived(q, p)
    setPosts(result.posts)
    setTotalPages(result.totalPages)
    setLoading(false)
  }

  useEffect(() => {
    // A controlled, cancelable fetch on page change - setLoading(true) here
    // is the effect synchronizing with the server, not derived render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(query, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function restore(id: string): Promise<void> {
    if (!window.confirm('Biztosan visszaállítod ezt a hírt? A hír azonnal újra megjelenik a nyilvános weboldalon.')) {
      return
    }
    const result = await api.restorePost(id)
    navigate(`/hirkezelo/?pnw_notice=${result.notice}&pnw_view=archive`)
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Nem publikus tartalom</div>
          <h3>Archívum</h3>
          <p>Az itt lévő hírek nem jelennek meg a weboldalon, de teljes tartalmuk megmarad és egy kattintással visszaállíthatók.</p>
        </div>
        <Link className="pnw-button pnw-button-secondary" to="/hirkezelo/?pnw_view=published">
          ← Kint lévő hírek
        </Link>
      </div>

      <form
        className="pnw-form pnw-published-search-card"
        onSubmit={(event) => {
          event.preventDefault()
          setPage(1)
          load(query, 1)
        }}
      >
        <div className="pnw-field" style={{ marginBottom: 0 }}>
          <label htmlFor="pnw-archive-search">Keresés az archívumban</label>
          <div className="pnw-published-search-row">
            <input
              id="pnw-archive-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hír címe vagy szövege"
            />
            <button className="pnw-button pnw-button-secondary" type="submit">
              Keresés
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="pnw-empty-inline">Betöltés…</div>
      ) : posts.length === 0 ? (
        <div className="pnw-empty-inline">Az archívum jelenleg üres.</div>
      ) : (
        <div className="pnw-table-card pnw-published-card">
          <div className="pnw-table-wrap">
            <table className="pnw-table pnw-published-table">
              <thead>
                <tr>
                  <th>Hír</th>
                  <th>Szerző</th>
                  <th>Eredeti publikálás</th>
                  <th>Archiválva</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <ArchiveRows
                    key={post.id}
                    post={post}
                    authorName={authors.get(post.authorId)?.displayName ?? '—'}
                    archiverName={post.archivedById ? authors.get(post.archivedById)?.displayName : undefined}
                    onRestore={() => restore(post.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pnw-published-pagination">
          {page > 1 && (
            <button className="pnw-button pnw-button-secondary" type="button" onClick={() => setPage((p) => p - 1)}>
              ← Előző
            </button>
          )}
          <span>
            {page} / {totalPages} oldal
          </span>
          {page < totalPages && (
            <button className="pnw-button pnw-button-secondary" type="button" onClick={() => setPage((p) => p + 1)}>
              Következő →
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function ArchiveRows({
  post,
  authorName,
  archiverName,
  onRestore,
}: {
  post: Post
  authorName: string
  archiverName?: string
  onRestore: () => void
}) {
  const terms = useTerms()

  return (
    <>
      <tr className="pnw-published-main-row">
        <td data-label="Hír">
          <strong className="pnw-published-title">{post.title || '(Névtelen hír)'}</strong>
          <small className="pnw-published-meta">{termLine(terms, post)}</small>
        </td>
        <td data-label="Szerző">{authorName}</td>
        <td data-label="Eredeti publikálás">{formatDateTime(post.date)}</td>
        <td data-label="Archiválva">
          {formatDateTime(post.archivedAt)}
          {archiverName && <small className="pnw-published-meta">{archiverName}</small>}
        </td>
      </tr>
      <tr className="pnw-published-action-row">
        <td colSpan={4}>
          <div className="pnw-published-inline-actions">
            <button type="button" className="pnw-button" onClick={onRestore}>
              Visszaállítás és újrapublikálás
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}
