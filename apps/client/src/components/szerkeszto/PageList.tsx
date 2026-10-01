import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import type { PageSummary } from '../../lib/hirkezelo/api.ts'
import type { SiteMenu } from '../../../../../shared/pnw/page-types.ts'
import { primaryMenu, secondaryMenu } from '../../data/site.ts'
import { pageDefaults } from '../../data/pages/index.ts'
import { mirroredTitle } from '../../lib/headTitle.ts'

type Tab = 'all' | 'publish' | 'draft' | 'edited' | 'trash'
type SortKey = 'title' | 'state' | 'modified'

type Row = {
  key: string
  title: string
  route: string
  mirrored: boolean
  /** Where the page sits in the status tabs. */
  tab: 'publish' | 'draft' | 'trash'
  edited: boolean
  label: string
  modifiedAt?: string
  inMenu: boolean
  saved?: PageSummary
}

const PER_PAGE = 20

const TABS: [Tab, string][] = [
  ['all', 'Mind'],
  ['publish', 'Közzétéve'],
  ['draft', 'Piszkozat'],
  ['edited', 'Szerkesztve'],
  ['trash', 'Kuka'],
]

function menuRoutes(menu: SiteMenu | null): Set<string> {
  const routes = new Set<string>()
  const walk = (items: { to?: string; children?: { to?: string }[] }[]) => {
    for (const item of items) {
      if (item.to) routes.add(item.to)
      if (item.children) walk(item.children)
    }
  }
  walk(menu?.primary ?? primaryMenu)
  walk(menu?.secondary ?? secondaryMenu)
  return routes
}

/** The route's menu entries are written with or without the trailing slash; match both. */
const slashless = (route: string) => (route.length > 1 ? route.replace(/\/$/, '') : route)

function matchesTab(row: Row, tab: Tab): boolean {
  if (tab === 'trash') return row.tab === 'trash'
  if (row.tab === 'trash') return false
  if (tab === 'all') return true
  if (tab === 'edited') return row.edited
  return row.tab === tab
}

/**
 * "Oldalak" as WordPress's All Pages screen (AGENT.md 6.22): status tabs with
 * counts (*Mind · Közzétéve · Piszkozat · Szerkesztve · Kuka*), search, bulk
 * actions, sortable columns, row actions that appear under the title on hover,
 * and pagination. Deleting moves a page to the *Kuka* first (a mirrored page
 * becomes a tombstone, a created one keeps its document); the trash is where
 * it is restored or - for a created page - deleted for good.
 */
export default function PageList({
  pages,
  menu,
  onChanged,
}: {
  pages: PageSummary[]
  menu: SiteMenu | null
  onChanged: () => void
}) {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'title', dir: 1 })
  const [paged, setPaged] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulk, setBulk] = useState('')
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const rows = useMemo<Row[]>(() => {
    const inMenu = menuRoutes(menu)
    const isInMenu = (route: string) => inMenu.has(route) || inMenu.has(slashless(route))
    const savedByRoute = new Map(pages.map((page) => [page.route, page]))

    const mirrored: Row[] = Object.keys(pageDefaults).map((route) => {
      const saved = savedByRoute.get(route)
      const trashed = !!saved?.deleted
      const draft = !!saved && !trashed && saved.status === 'draft'
      return {
        key: route,
        title: saved && !trashed && saved.title ? saved.title : mirroredTitle(route),
        route,
        mirrored: true,
        tab: trashed ? 'trash' : draft ? 'draft' : 'publish',
        edited: !!saved && !trashed,
        label: trashed ? 'Kukában' : draft ? 'Piszkozat (az eredeti látszik)' : saved ? 'Szerkesztve' : 'Eredeti',
        modifiedAt: saved?.modifiedAt,
        inMenu: !trashed && isInMenu(route),
        saved,
      }
    })
    const created: Row[] = pages
      .filter((page) => page.origin === 'custom')
      .map((page) => ({
        key: page.id,
        title: page.title,
        route: page.route,
        mirrored: false,
        tab: page.deleted ? 'trash' : page.status === 'draft' ? 'draft' : 'publish',
        edited: false,
        label: page.deleted ? 'Kukában' : page.status === 'draft' ? 'Piszkozat' : 'Közzétéve',
        modifiedAt: page.modifiedAt,
        inMenu: !page.deleted && isInMenu(page.route),
        saved: page,
      }))
    return [...created, ...mirrored]
  }, [pages, menu])

  const counts = useMemo(
    () => Object.fromEntries(TABS.map(([id]) => [id, rows.filter((row) => matchesTab(row, id)).length])) as Record<Tab, number>,
    [rows],
  )

  const needle = query.trim().toLowerCase()
  const filtered = rows
    .filter((row) => matchesTab(row, tab))
    .filter((row) => !needle || row.title.toLowerCase().includes(needle) || row.route.toLowerCase().includes(needle))
  const sorted = [...filtered].sort((a, b) => {
    const pick = (row: Row) => (sort.key === 'title' ? row.title.toLowerCase() : sort.key === 'state' ? row.label : row.modifiedAt ?? '')
    return pick(a).localeCompare(pick(b), 'hu') * sort.dir
  })
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const current = Math.min(paged, pageCount)
  const visible = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  function sortBy(key: SortKey): void {
    setSort((now) => (now.key === key ? { key, dir: now.dir === 1 ? -1 : 1 } : { key, dir: 1 }))
  }

  async function run(action: () => Promise<unknown>, done: string): Promise<void> {
    setNotice(null)
    try {
      await action()
      setNotice({ kind: 'success', text: done })
      setSelected(new Set())
      onChanged()
    } catch {
      setNotice({ kind: 'error', text: 'A művelet nem sikerült.' })
    }
  }

  const trash = (row: Row) => (row.mirrored ? api.deletePageByRoute(row.route) : api.deletePage(row.saved!.id))
  const restore = (row: Row) => (row.mirrored ? api.resetPageByRoute(row.route) : api.restorePage(row.saved!.id))
  const purge = (row: Row) => api.deletePage(row.saved!.id)

  async function applyBulk(): Promise<void> {
    const chosen = rows.filter((row) => selected.has(row.key))
    if (!bulk || chosen.length === 0) return
    if (bulk === 'trash') {
      await run(() => Promise.all(chosen.map(trash)), `${chosen.length} oldal a kukában.`)
    } else if (bulk === 'reset') {
      const targets = chosen.filter((row) => row.mirrored && row.saved)
      if (!window.confirm(`A kijelölt ${targets.length} oldal minden módosítása elvész. Folytatod?`)) return
      await run(() => Promise.all(targets.map(restore)), `${targets.length} oldal újra az eredeti.`)
    } else if (bulk === 'restore') {
      await run(() => Promise.all(chosen.map(restore)), `${chosen.length} oldal visszaállítva.`)
    } else if (bulk === 'purge') {
      const targets = chosen.filter((row) => !row.mirrored)
      if (!window.confirm(`Véglegesen törlöd a kijelölt ${targets.length} oldalt? Ez nem vonható vissza.`)) return
      await run(() => Promise.all(targets.map(purge)), `${targets.length} oldal véglegesen törölve.`)
    }
    setBulk('')
  }

  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.has(row.key))
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : '')

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <h3>Oldalak</h3>
          <p>A webhely oldalai és a Szerkesztőben létrehozott új oldalak - mindegyik átírható, átrendezhető, törölhető.</p>
        </div>
        <Link className="pnw-button" to="/szerkeszto/?view=new">
          + Új oldal
        </Link>
      </div>

      {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}

      <ul className="szk-subsubsub" aria-label="Szűrés állapot szerint">
        {TABS.map(([id, label], at) => (
          <li key={id}>
            {at > 0 && ' | '}
            <button
              type="button"
              className={tab === id ? 'szk-tab-current' : undefined}
              aria-current={tab === id}
              onClick={() => {
                setTab(id)
                setPaged(1)
                setSelected(new Set())
                setBulk('')
              }}
            >
              {label} <span className="szk-count">({counts[id]})</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="pnw-table-card">
        <div className="szk-tablenav">
          <span className="szk-bulk">
            <select aria-label="Tömeges művelet" value={bulk} onChange={(event) => setBulk(event.target.value)}>
              <option value="">Tömeges művelet</option>
              {tab === 'trash' ? (
                <>
                  <option value="restore">Visszaállítás</option>
                  <option value="purge">Végleges törlés</option>
                </>
              ) : (
                <>
                  <option value="trash">Kukába helyezés</option>
                  <option value="reset">Visszaállítás az eredetire</option>
                </>
              )}
            </select>
            <button type="button" className="pnw-button pnw-button-secondary pnw-button-small" disabled={!bulk || selected.size === 0} onClick={applyBulk}>
              Alkalmaz
            </button>
          </span>
          <span className="szk-search">
            <input
              type="search"
              placeholder="Keresés cím vagy útvonal szerint…"
              aria-label="Keresés az oldalak között"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPaged(1)
              }}
            />
          </span>
          <span className="szk-pagination">
            {sorted.length} elem
            {pageCount > 1 && (
              <>
                <button type="button" aria-label="Előző oldal" disabled={current <= 1} onClick={() => setPaged(current - 1)}>
                  ‹
                </button>
                {current} / {pageCount}
                <button type="button" aria-label="Következő oldal" disabled={current >= pageCount} onClick={() => setPaged(current + 1)}>
                  ›
                </button>
              </>
            )}
          </span>
        </div>

        <div className="pnw-table-wrap">
          <table className="pnw-table szk-pages-table">
            <thead>
              <tr>
                <th className="szk-check-col">
                  <input
                    type="checkbox"
                    aria-label="Az összes látható kijelölése"
                    checked={allVisibleSelected}
                    onChange={(event) => setSelected(event.target.checked ? new Set(visible.map((row) => row.key)) : new Set())}
                  />
                </th>
                <th>
                  <button type="button" className="szk-sort" onClick={() => sortBy('title')}>
                    Cím{arrow('title')}
                  </button>
                </th>
                <th>
                  <button type="button" className="szk-sort" onClick={() => sortBy('state')}>
                    Állapot{arrow('state')}
                  </button>
                </th>
                <th>Menüben</th>
                <th>
                  <button type="button" className="szk-sort" onClick={() => sortBy('modified')}>
                    Módosítva{arrow('modified')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="szk-muted">
                    Nincs találat.
                  </td>
                </tr>
              )}
              {visible.map((row) => (
                <tr key={row.key} className={selected.has(row.key) ? 'szk-row-selected' : undefined}>
                  <td className="szk-check-col">
                    <input
                      type="checkbox"
                      aria-label={`${row.title} kijelölése`}
                      checked={selected.has(row.key)}
                      onChange={(event) => {
                        const next = new Set(selected)
                        if (event.target.checked) next.add(row.key)
                        else next.delete(row.key)
                        setSelected(next)
                      }}
                    />
                  </td>
                  <td>
                    {row.tab === 'trash' ? (
                      <strong>{row.title}</strong>
                    ) : (
                      <Link
                        className="szk-row-title"
                        to={row.mirrored ? `/szerkeszto/?view=page&route=${encodeURIComponent(row.route)}` : `/szerkeszto/?view=page&id=${row.saved!.id}`}
                      >
                        {row.title}
                      </Link>
                    )}
                    <small>{row.route}</small>
                    <div className="szk-row-actions-hover">
                      {row.tab === 'trash' ? (
                        <>
                          <button type="button" onClick={() => run(() => restore(row), 'Az oldal visszaállítva.')}>
                            Visszaállítás
                          </button>
                          {!row.mirrored && (
                            <button
                              type="button"
                              className="szk-danger-link"
                              onClick={() => {
                                if (window.confirm(`Véglegesen törlöd a(z) „${row.title}” oldalt? Ez nem vonható vissza.`)) {
                                  run(() => purge(row), 'Az oldal véglegesen törölve.')
                                }
                              }}
                            >
                              Végleges törlés
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <Link to={row.mirrored ? `/szerkeszto/?view=page&route=${encodeURIComponent(row.route)}` : `/szerkeszto/?view=page&id=${row.saved!.id}`}>
                            Szerkesztés
                          </Link>
                          <a href={row.route} target="_blank" rel="noreferrer">
                            Megtekintés
                          </a>
                          {row.mirrored && row.saved && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`A(z) „${row.title}” oldal minden módosítása elvész. Visszaállítod az eredetire?`)) {
                                  run(() => restore(row), 'Az oldal újra az eredeti.')
                                }
                              }}
                            >
                              Visszaállítás az eredetire
                            </button>
                          )}
                          <button type="button" className="szk-danger-link" onClick={() => run(() => trash(row), 'Az oldal a kukában van.')}>
                            Kukába
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`pnw-badge${row.tab === 'publish' && (row.edited || !row.mirrored) ? ' pnw-badge-publish' : row.tab === 'trash' ? ' pnw-badge-pnw_revision' : ''}`}>
                      {row.label}
                    </span>
                  </td>
                  <td>{row.inMenu ? 'igen' : '-'}</td>
                  <td>{row.modifiedAt ? new Date(row.modifiedAt).toLocaleString('hu-HU') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
