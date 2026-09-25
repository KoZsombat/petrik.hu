import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import type { OverrideSummary } from '../../lib/hirkezelo/api.ts'
import type { BuilderPage, SiteMenu } from '../../../../../shared/pnw/page-types.ts'
import { primaryMenu, secondaryMenu } from '../../data/site.ts'
import { emptyOverrides } from '../../../../../shared/pnw/page-types.ts'
import { mirroredTitle } from './messages.ts'
import { useInventory } from './useInventory.ts'

type Row = {
  key: string
  title: string
  route: string
  type: 'mirrored' | 'builder'
  state: string
  modifiedAt?: string
  inMenu: boolean
  builder?: BuilderPage
  override?: OverrideSummary
}

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

/**
 * Every page in one table (AGENT.md 6.19): the mirrored ones from the
 * generated inventory, the builder ones from the API. A builder page can be
 * deleted for real; a mirrored page cannot - its code is the port - so it
 * offers "Rejtés" and "Visszaállítás" instead.
 */
export default function PageList({
  pages,
  overrides,
  menu,
  onChanged,
}: {
  pages: BuilderPage[]
  overrides: OverrideSummary[]
  menu: SiteMenu | null
  onChanged: () => void
}) {
  const inventory = useInventory()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const rows = useMemo<Row[]>(() => {
    const inMenu = menuRoutes(menu)
    const overrideByRoute = new Map(overrides.map((entry) => [entry.route, entry]))
    const mirrored: Row[] = Object.keys(inventory ?? {}).map((route) => {
      const override = overrideByRoute.get(route)
      return {
        key: route,
        title: mirroredTitle(route),
        route,
        type: 'mirrored',
        state: override?.hidden ? 'Rejtve' : override ? 'Módosítva' : 'Eredeti',
        modifiedAt: override?.modifiedAt,
        inMenu: inMenu.has(route),
        override,
      }
    })
    const built: Row[] = pages.map((page) => ({
      key: page.id,
      title: page.title,
      route: `/${page.slug}/`,
      type: 'builder',
      state: page.status === 'publish' ? 'Közzétéve' : 'Piszkozat',
      modifiedAt: page.modifiedAt,
      inMenu: inMenu.has(`/${page.slug}/`),
      builder: page,
    }))
    return [...built, ...mirrored]
  }, [inventory, pages, overrides, menu])

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? rows.filter((row) => row.title.toLowerCase().includes(needle) || row.route.toLowerCase().includes(needle))
    : rows

  async function run(action: () => Promise<unknown>): Promise<void> {
    setError(null)
    try {
      await action()
      onChanged()
    } catch {
      setError('A művelet nem sikerült.')
    }
  }

  async function setHidden(route: string, hidden: boolean): Promise<void> {
    const { overrides } = await api.getOverrides(route)
    const next = { ...(overrides ?? emptyOverrides(route)) }
    if (hidden) next.hidden = true
    else delete next.hidden
    await api.saveOverrides(next)
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <h3>Oldalak</h3>
          <p>A webhely eredeti oldalai és a Szerkesztőben létrehozott új oldalak.</p>
        </div>
        <Link className="pnw-button" to="/szerkeszto/?view=new">
          + Új oldal
        </Link>
      </div>

      {error && <div className="pnw-notice pnw-notice-error">{error}</div>}

      <div className="pnw-table-card">
        <div className="szk-search">
          <input
            type="search"
            placeholder="Keresés cím vagy útvonal szerint…"
            aria-label="Keresés az oldalak között"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {!inventory && <p className="szk-muted">Az oldalak listája töltődik…</p>}
        <div className="pnw-table-wrap">
          <table className="pnw-table">
            <thead>
              <tr>
                <th>Cím</th>
                <th>Típus</th>
                <th>Menüben</th>
                <th>Utoljára módosítva</th>
                <th className="pnw-actions">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.key}>
                  <td>
                    <strong>{row.title}</strong>
                    <small>
                      <a href={row.route} target="_blank" rel="noreferrer">
                        {row.route}
                      </a>
                    </small>
                  </td>
                  <td>
                    <span className={`pnw-badge${row.state === 'Közzétéve' || row.state === 'Módosítva' ? ' pnw-badge-publish' : row.state === 'Rejtve' ? ' pnw-badge-pnw_revision' : ''}`}>
                      {row.type === 'builder' ? 'Új oldal' : 'Eredeti'} · {row.state}
                    </span>
                  </td>
                  <td>{row.inMenu ? 'igen' : '-'}</td>
                  <td>{row.modifiedAt ? new Date(row.modifiedAt).toLocaleString('hu-HU') : '-'}</td>
                  <td className="pnw-actions szk-row-actions">
                    {row.builder ? (
                      <>
                        <Link className="pnw-button pnw-button-small" to={`/szerkeszto/?view=page&id=${row.builder.id}`}>
                          Szerkesztés
                        </Link>
                        <button
                          type="button"
                          className="pnw-button pnw-button-small pnw-button-danger"
                          onClick={() => {
                            const page = row.builder!
                            if (window.confirm(`Biztosan törlöd a(z) „${page.title}” oldalt? A menüből is kikerül.`)) {
                              run(() => api.deletePage(page.id))
                            }
                          }}
                        >
                          Törlés
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          className="pnw-button pnw-button-small"
                          to={`/szerkeszto/?view=page&route=${encodeURIComponent(row.route)}`}
                        >
                          Szerkesztés
                        </Link>
                        <button
                          type="button"
                          className="pnw-button pnw-button-small pnw-button-secondary"
                          onClick={() => run(() => setHidden(row.route, !row.override?.hidden))}
                        >
                          {row.override?.hidden ? 'Megjelenítés' : 'Rejtés'}
                        </button>
                        {row.override && (
                          <button
                            type="button"
                            className="pnw-button pnw-button-small pnw-button-secondary"
                            onClick={() => {
                              if (window.confirm(`A(z) „${row.title}” oldal minden módosítása elvész. Folytatod?`)) {
                                run(() => api.clearOverrides(row.route))
                              }
                            }}
                          >
                            Visszaállítás
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
