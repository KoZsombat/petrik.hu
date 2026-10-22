import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSession } from '../lib/hirkezelo/useSession.ts'
import * as api from '../lib/hirkezelo/api.ts'
import type { PageSummary } from '../lib/hirkezelo/api.ts'
import { heads } from '../data/head.ts'
import { canManageLibrary, canManagePages, canManageUsers } from '../../../../shared/pnw/permissions.ts'
import type { SiteMenu } from '../../../../shared/pnw/page-types.ts'
import LoginCard from '../components/hirkezelo/LoginCard.tsx'
import Unauthorized from '../components/hirkezelo/Unauthorized.tsx'
import Shell from '../components/szerkeszto/Shell.tsx'
import PageList from '../components/szerkeszto/PageList.tsx'
import NewPage from '../components/szerkeszto/NewPage.tsx'
import PageEditor from '../components/szerkeszto/PageEditor.tsx'
import Users from '../components/hirkezelo/Users.tsx'
import LibraryEditor from '../components/szerkeszto/LibraryEditor.tsx'
import MenuEditor from '../components/szerkeszto/MenuEditor.tsx'
import { MediaLibrary } from '../components/szerkeszto/MediaPicker.tsx'
import { ROUTES_LIST_ID } from '../components/szerkeszto/fields.tsx'
import { PreviewSlotContext } from '../components/szerkeszto/previewSlot.ts'
import './Hirkezelo.css'
import '../components/szerkeszto/Szerkeszto.css'

type Overview = { pages: PageSummary[]; menu: SiteMenu | null }

/**
 * /szerkeszto/ - the page editor (AGENT.md 6.20). Same dispatch shape as
 * Hirkezelo.tsx: one route, the screen picked by `?view=` (`list`, `page`,
 * `new`, `menu`, `media`), with `?route=` for a mirrored page or `?id=` for a
 * page created here - both open in the same document editor. Needs `pnw_manage_pages` (or, for the Dokumentumtár alone, `pnw_manage_library`); the root is a `.pnw-app`, so it
 * is 75% wide and centred like the Hírkezelő (6.17).
 */
export default function Szerkeszto() {
  const { user, loading, login, logout } = useSession()
  const [params] = useSearchParams()
  const route = params.get('route')
  const id = params.get('id')
  const pagesAllowed = !!user && canManagePages(user)
  const libraryAllowed = !!user && canManageLibrary(user)
  const allowed = pagesAllowed || libraryAllowed
  // An account that may only look after the documents lands on the Dokumentumtár.
  const view = params.get('view') ?? (pagesAllowed ? 'list' : 'library')

  const [overview, setOverview] = useState<Overview | null>(null)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  // Bumped after a list action (delete, hide, reset) to refetch.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    // Refetched on every screen change too, so the list shows what another
    // screen just saved, and every link field can offer the pages built here.
    if (!pagesAllowed) return
    let cancelled = false
    Promise.all([api.listPages(), api.getMenu()])
      .then(([{ pages }, { menu }]) => {
        if (!cancelled) setOverview({ pages, menu })
      })
      .catch(() => {
        if (!cancelled) setOverview({ pages: [], menu: null })
      })
    return () => {
      cancelled = true
    }
  }, [pagesAllowed, view, version])

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
  if (view === 'library') {
    content = libraryAllowed ? (
      <LibraryEditor />
    ) : (
      <div className="pnw-notice pnw-notice-error">A Dokumentumtárhoz „Dokumentumtár kezelése” jogosultság kell.</div>
    )
  } else if (!pagesAllowed) {
    content = <div className="pnw-notice pnw-notice-error">Az oldalak szerkesztéséhez „Oldalak szerkesztése” jogosultság kell.</div>
  } else if (view === 'page' && route) content = <PageEditor key={route} route={route} />
  else if (view === 'page' && id) content = <PageEditor key={id} id={id} />
  else if (view === 'new') content = <NewPage />
  else if (view === 'menu') content = <MenuEditor />
  else if (view === 'users') {
    content = canManageUsers(user) ? (
      <Users currentUserId={user.id} />
    ) : (
      <div className="pnw-notice pnw-notice-error">A fiókok kezeléséhez „Fiókok kezelése” jogosultság kell.</div>
    )
  }
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
        {params.get('notice') === 'trashed' && (
          <div className="pnw-notice pnw-notice-success">Az oldal a kukába került.</div>
        )}
        {params.get('notice') === 'purged' && (
          <div className="pnw-notice pnw-notice-success">Az oldal véglegesen törölve.</div>
        )}
        <PageList
          pages={overview.pages}
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
          {overview?.pages.filter((page) => page.origin === 'custom').map((page) => <option key={page.id} value={page.route} />)}
        </datalist>
      </div>
      <div ref={setSlot} />
    </PreviewSlotContext.Provider>
  )
}
