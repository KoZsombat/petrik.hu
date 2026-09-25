import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSession } from '../lib/hirkezelo/useSession.ts'
import * as api from '../lib/hirkezelo/api.ts'
import type { OverrideSummary } from '../lib/hirkezelo/api.ts'
import { heads } from '../data/head.ts'
import { canManagePages } from '../../../../shared/pnw/permissions.ts'
import type { BuilderPage, SiteMenu } from '../../../../shared/pnw/page-types.ts'
import LoginCard from '../components/hirkezelo/LoginCard.tsx'
import Unauthorized from '../components/hirkezelo/Unauthorized.tsx'
import Shell from '../components/szerkeszto/Shell.tsx'
import PageList from '../components/szerkeszto/PageList.tsx'
import NewPage from '../components/szerkeszto/NewPage.tsx'
import OverrideEditor from '../components/szerkeszto/OverrideEditor.tsx'
import BuilderEditor from '../components/szerkeszto/BuilderEditor.tsx'
import MenuEditor from '../components/szerkeszto/MenuEditor.tsx'
import { MediaLibrary } from '../components/szerkeszto/MediaPicker.tsx'
import { ROUTES_LIST_ID } from '../components/szerkeszto/fields.tsx'
import { PreviewSlotContext } from '../components/szerkeszto/previewSlot.ts'
import './Hirkezelo.css'
import '../components/szerkeszto/Szerkeszto.css'

type Overview = { pages: BuilderPage[]; overrides: OverrideSummary[]; menu: SiteMenu | null }

/**
 * /szerkeszto/ - the page editor (AGENT.md 6.19). Same dispatch shape as
 * Hirkezelo.tsx: one route, the screen picked by `?view=` (`list`, `page`,
 * `new`, `menu`, `media`), with `?route=` for a mirrored page or `?id=` for a
 * page built here. Needs `pnw_manage_pages`; the root is a `.pnw-app`, so it
 * is 75% wide and centred like the Hírkezelő (6.17).
 */
export default function Szerkeszto() {
  const { user, loading, login, logout } = useSession()
  const [params] = useSearchParams()
  const view = params.get('view') ?? 'list'
  const route = params.get('route')
  const id = params.get('id')
  const allowed = !!user && canManagePages(user)

  const [overview, setOverview] = useState<Overview | null>(null)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  // Bumped after a list action (delete, hide, reset) to refetch.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    // Refetched on every screen change too, so the list shows what another
    // screen just saved, and every link field can offer the pages built here.
    if (!allowed) return
    let cancelled = false
    Promise.all([api.listPages(), api.getMenu()])
      .then(([{ pages, overrides }, { menu }]) => {
        if (!cancelled) setOverview({ pages, overrides, menu })
      })
      .catch(() => {
        if (!cancelled) setOverview({ pages: [], overrides: [], menu: null })
      })
    return () => {
      cancelled = true
    }
  }, [allowed, view, version])

  if (loading) {
    return (
      <div className="pnw-app">
        <div className="pnw-section">Betöltés…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pnw-app">
        <LoginCard
          onLogin={login}
          title="Szerkesztő"
          intro="Az oldalak szerkesztéséhez az „Oldalak szerkesztése” jogosultság kell."
        />
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="pnw-app">
        <Unauthorized
          onLogout={logout}
          title="Nincs szerkesztési jogosultságod"
          text="A Szerkesztőhöz az „Oldalak szerkesztése” jogosultság kell. Kérd meg valamelyik fiókkezelőt, hogy kapcsolja be a fiókodon (Hírkezelő → Fiókok)."
        />
      </div>
    )
  }

  let content
  if (view === 'page' && route) content = <OverrideEditor key={route} route={route} />
  else if (view === 'page' && id) content = <BuilderEditor key={id} id={id} />
  else if (view === 'new') content = <NewPage />
  else if (view === 'menu') content = <MenuEditor />
  else if (view === 'media') {
    content = (
      <section className="pnw-section">
        <div className="pnw-section-heading">
          <div>
            <h3>Médiatár</h3>
            <p>A feltöltött képek a /uploads/ alatt érhetők el; a modulok képválasztója is innen dolgozik.</p>
          </div>
        </div>
        <MediaLibrary />
      </section>
    )
  } else {
    content = overview ? (
      <>
        {params.get('notice') === 'deleted' && (
          <div className="pnw-notice pnw-notice-success">Az oldal törölve.</div>
        )}
        <PageList
          pages={overview.pages}
          overrides={overview.overrides}
          menu={overview.menu}
          onChanged={() => setVersion((current) => current + 1)}
        />
      </>
    ) : (
      <div className="pnw-section">Betöltés…</div>
    )
  }

  return (
    <PreviewSlotContext.Provider value={slot}>
      <div className="pnw-app szk-app">
        <Shell user={user} onLogout={logout} />
        {content}
        {/* Every route a link field may point at: the mirrored pages and the pages built here. */}
        <datalist id={ROUTES_LIST_ID}>
          {Object.keys(heads).map((path) => (
            <option key={path} value={path} />
          ))}
          {overview?.pages.map((page) => <option key={page.id} value={`/${page.slug}/`} />)}
        </datalist>
      </div>
      <div ref={setSlot} />
    </PreviewSlotContext.Provider>
  )
}
