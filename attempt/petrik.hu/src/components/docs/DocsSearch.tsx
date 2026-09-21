import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryOf, docs } from '../../data/docs.ts'
import { fold } from '../../lib/text.ts'
import { CloseIcon, SearchIcon } from './DocsIcons.tsx'

/**
 * The docs search box.
 *
 * BetterDocs ran this as a live search against WordPress over ajax. There is no
 * backend here, but the whole document index ships with the page, so the same
 * behaviour - results appearing as you type - is a plain filter. The spinner
 * the plugin showed while waiting has no counterpart and is left out.
 */
export default function DocsSearch() {
  const [term, setTerm] = useState('')
  const wrapper = useRef<HTMLDivElement>(null)

  const needle = fold(term.trim())
  const hits = needle
    ? Object.values(docs).filter((doc) => fold(doc.title).includes(needle))
    : []

  useEffect(() => {
    if (!term) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTerm('')
    }
    const onClick = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setTerm('')
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [term])

  return (
    <div className="betterdocs-search-form-wrapper betterdocs-search-form-wrap">
      <div className="betterdocs-live-search" ref={wrapper}>
        <form
          className="betterdocs-searchform betterdocs-advance-searchform"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="betterdocs-searchform-input-wrap">
            <SearchIcon />
            <input
              type="text"
              className="betterdocs-search-field"
              name="s"
              aria-label="Keresés a dokumentumok között"
              placeholder="Keresés..."
              autoComplete="off"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
            {term && (
              <button
                type="button"
                className="betterdocs-search-clear"
                aria-label="Keresés törlése"
                onClick={() => setTerm('')}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </form>

        {needle && (
          <ul className="betterdocs-search-result">
            {hits.length === 0 && <li className="betterdocs-search-empty">Nincs találat.</li>}
            {hits.map((doc) => (
              <li key={doc.slug}>
                {/* Following a result closes the list; clicking anywhere else,
                    or pressing Escape, is handled by the effect above. */}
                <Link to={`/docs/${doc.slug}/`} onClick={() => setTerm('')}>
                  <span className="betterdocs-search-title">{doc.title}</span>
                  <span className="betterdocs-search-category">{categoryOf(doc)?.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
