import { Outlet } from 'react-router-dom'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import ScrollToTop from './ScrollToTop.tsx'
import TopBar from './TopBar.tsx'
import PageExtras from './pagebuilder/PageExtras.tsx'
import NotFound from '../pages/NotFound.tsx'
import { useDocumentHead } from '../lib/useDocumentHead.ts'
import { PostsProvider } from '../lib/posts/PostsProvider.tsx'
import { SiteContentProvider } from '../lib/site/SiteContentProvider.tsx'
import { useRouteOverrides } from '../lib/site/usePageOverride.ts'
import './Layout.css'

/**
 * The chrome every page shares: the green utility bar, the fixed header, the
 * page body and the footer.
 *
 * Every route in App.tsx sits under this element, so the per-route <title>
 * belongs here rather than in each of the 53 page components - the generated
 * ones could not carry it anyway. `PostsProvider` lives here for the same
 * reason: `Layout` stays mounted across client-side navigation (only its
 * `<Outlet>` child swaps), so the live-posts fetch happens once per page
 * load, not once per route - see PostsContext.tsx. `SiteContentProvider`
 * (the Szerkesztő's overrides, pages and menu - AGENT.md 6.19) sits beside it
 * for the same reason.
 */
export default function Layout() {
  return (
    <PostsProvider>
      <SiteContentProvider>
        <Chrome />
      </SiteContentProvider>
    </PostsProvider>
  )
}

/** Inside the providers, so the <head> and the page body can read what the Szerkesztő saved. */
function Chrome() {
  useDocumentHead()
  // "Rejtés" in the Szerkesztő: a mirrored page cannot be deleted, so it is served as the 404 instead.
  const hidden = useRouteOverrides()?.hidden === true

  return (
    <div id="page-container">
      <ScrollToTop />
      <TopBar />
      <Header />
      <div id="et-main-area">
        {hidden ? (
          <NotFound />
        ) : (
          <>
            <Outlet />
            <PageExtras />
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
