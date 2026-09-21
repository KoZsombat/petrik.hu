import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.tsx'
import { posts } from '../data/posts.ts'
import { fold } from '../lib/text.ts'
import { useBodyClass } from '../lib/useBodyClass.ts'
import './Search.css'

/**
 * Search results.
 *
 * WordPress ran this query on the server; here it filters the post index in the
 * browser, which is possible because the whole index ships with the page.
 */
export default function Search() {
  const [params] = useSearchParams()
  // Divi's search template has a sidebar, and lays it out off this class.
  useBodyClass(['search', 'et_right_sidebar'])
  const term = (params.get('q') ?? '').trim()
  const needle = fold(term)

  const hits = needle
    ? Object.values(posts).filter(
        (post) => fold(post.title).includes(needle) || fold(post.excerpt).includes(needle),
      )
    : []

  return (
    <div id="main-content" className="page-kereses">
      <div className="container">
        <div id="content-area" className="clearfix">
          <div id="left-area">
            <h1 className="entry-title main_title">
              {term ? `Találatok erre: „${term}”` : 'Keresés'}
            </h1>

            {!term && <p>Írj be egy keresőkifejezést a jobb oldali mezőbe.</p>}

            {term && hits.length === 0 && (
              <p>Nincs találat. Próbálkozz más kifejezéssel.</p>
            )}

            {hits.length > 0 && (
              <>
                <p className="search-count">
                  {hits.length} találat a mentésben szereplő {Object.keys(posts).length} bejegyzés
                  között.
                </p>
                <ul className="search-results">
                  {hits.map((post) => (
                    <li key={post.slug}>
                      <h2 className="entry-title">
                        {post.available ? (
                          <Link to={`/${post.slug}/`}>{post.title}</Link>
                        ) : (
                          post.title
                        )}
                      </h2>
                      <p>{post.excerpt}</p>
                      {!post.available && (
                        <p className="post-unavailable-note">
                          Ez a bejegyzés nem érhető el a mentésben.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  )
}
