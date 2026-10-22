import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import type { Post } from '../../../../../shared/pnw/types.ts'
import { useUsers } from '../../lib/hirkezelo/useUsers.ts'
import { useTerms } from '../../lib/terms.ts'
import { termLine } from './helpers.ts'

/** Ported from PNW_Frontend_Published_Trait::render_published_news(). */
export default function Published() {
  const navigate = useNavigate()
  const authors = useUsers()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [testMode, setTestMode] = useState(true)
  const [loading, setLoading] = useState(true)

  async function load(q: string, p: number): Promise<void> {
    setLoading(true)
    const result = await api.listPublished(q, p)
    setPosts(result.posts)
    setTotalPages(result.totalPages)
    setTestMode(result.testMode ?? true)
    setLoading(false)
  }

  useEffect(() => {
    // A controlled, cancelable fetch on page change - setLoading(true) here
    // is the effect synchronizing with the server, not derived render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(query, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function archive(id: string): Promise<void> {
    if (!window.confirm('Biztosan archiválod ezt a hírt? Az oldalról azonnal eltűnik, de az Archívumból bármikor visszaállítható.')) {
      return
    }
    const result = await api.archivePost(id)
    // Same view, same component instance - reload the list ourselves, or the
    // archived row would linger until a full page refresh.
    if (posts.length === 1 && page > 1) setPage(page - 1)
    else await load(query, page)
    navigate(`/hirkezelo/?pnw_notice=${result.notice}&pnw_view=published`)
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Publikált tartalom</div>
          <h3>Kint lévő hírek</h3>
          <p>
            A lista a Hírkezelőből jóváhagyott és a régi oldalról átvett híreket tartalmazza. Az Archiválás
            leveszi a hírt a weboldalról, de nem törli.
          </p>
        </div>
        <Link className="pnw-button pnw-button-secondary" to="/hirkezelo/?pnw_view=archive">
          Archívum
        </Link>
      </div>

      {testMode && (
        <div className="pnw-notice pnw-notice-warning">
          <strong>TESZT MÓD:</strong> a jelenlegi éles hírek megtekinthetők, de szerkesztésük és archiválásuk
          blokkolva van a production indulásig.
        </div>
      )}

      <form
        className="pnw-form pnw-published-search-card"
        onSubmit={(event) => {
          event.preventDefault()
          setPage(1)
          load(query, 1)
        }}
      >
        <div className="pnw-field" style={{ marginBottom: 0 }}>
          <label htmlFor="pnw-published-search">Keresés a publikált hírek között</label>
          <div className="pnw-published-search-row">
            <input
              id="pnw-published-search"
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
        <div className="pnw-empty-inline">Nincs megjeleníthető publikált hír.</div>
      ) : (
        <div className="pnw-table-card pnw-published-card">
          <div className="pnw-table-wrap">
            <table className="pnw-table pnw-published-table">
              <thead>
                <tr>
                  <th>Hír</th>
                  <th>Szerző</th>
                  <th>Publikálva</th>
                  <th>Forrás</th>
                  <th className="pnw-col-actions">Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <PublishedRows
                    key={post.id}
                    post={post}
                    authorName={authors.get(post.authorId)?.displayName ?? '—'}
                    testMode={testMode}
                    onArchive={() => archive(post.id)}
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

function PublishedRows({
  post,
  authorName,
  testMode,
  onArchive,
}: {
  post: Post
  authorName: string
  testMode: boolean
  onArchive: () => void
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
        <td data-label="Publikálva">
          <time dateTime={post.date}>{new Date(post.date).toLocaleString('hu-HU')}</time>
        </td>
        <td data-label="Forrás">
          <span className="pnw-published-source">{post.origin === 'mirror' ? 'Régi oldal' : 'Hírkezelő'}</span>
        </td>
        <td data-label="Műveletek" className="pnw-col-actions">
          <div className="pnw-row-actions">
            <Link className="pnw-button pnw-button-small" to={`/hirkezelo/?pnw_view=published_edit&post_id=${post.id}`}>
              {testMode ? 'Részletek' : 'Szerkesztés'}
            </Link>
            {!testMode && (
              <button type="button" className="pnw-button pnw-button-small pnw-button-outline-danger" onClick={onArchive}>
                Archiválás
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  )
}
