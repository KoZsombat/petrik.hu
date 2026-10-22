import { Route, Routes } from 'react-router-dom'
import ArchiveView from './components/ArchiveView.tsx'
import Layout from './components/Layout.tsx'
import { archives } from './data/archives.ts'
import { pageDefaults } from './data/pages/index.ts'
import DocTaxonomy from './pages/DocTaxonomy.tsx'
import Dokumentumtar from './pages/Dokumentumtar.tsx'
import DocumentPage from './pages/DocumentPage.tsx'
import NotFound from './pages/NotFound.tsx'
import Search from './pages/Search.tsx'
import Hirkezelo from './pages/Hirkezelo.tsx'
import Bejelentkezes from './pages/Bejelentkezes.tsx'
import Szerkeszto from './pages/Szerkeszto.tsx'
import PublishedPost from './pages/PublishedPost.tsx'
import PostPreviewPage from './pages/PostPreviewPage.tsx'

/**
 * Route table for the ported site. The original WordPress URLs are kept,
 * trailing slash included, so existing links keep resolving.
 *
 * The 53 authored pages are documents (AGENT.md 6.20): one route per entry of
 * the registry in src/data/pages, all drawn by DocumentPage - which shows the
 * edited version the Szerkesztő saved, or the bundled default. Since they are
 * mapped from the data, scripts/check-routes.ts checks the registry against
 * the mirror rather than files against routes.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {Object.values(pageDefaults).map((page) => (
          <Route key={page.route} path={page.route} element={<DocumentPage route={page.route} />} />
        ))}
        <Route path="/kereses/" element={<Search />} />

        {/* Not a mirror page - a real, working re-implementation of the
            Petrik News Workflow plugin, backed by server/. See AGENT.md 6.15. */}
        <Route path="/hirkezelo/" element={<Hirkezelo />} />
        {/* A post actually published through /hirkezelo/ - live data, not one
            of the 129 mirrored pages. See AGENT.md 6.15 for why /hirek/ and
            not a bare top-level slug. */}
        <Route path="/hirek/:slug/" element={<PublishedPost />} />
        {/* The review screen's "Megtekintés publikáltként": a pending post as a full site page. */}
        <Route path="/hirkezelo/elonezet/:id/" element={<PostPreviewPage />} />
        {/* Not mirror pages either: the shared login that offers the
            Hírkezelő or the Szerkesztő, and the Szerkesztő itself - the
            page editor backed by server/routes/pages.ts. See AGENT.md 6.19. */}
        <Route path="/bejelentkezes/" element={<Bejelentkezes />} />
        <Route path="/szerkeszto/" element={<Szerkeszto />} />

        {/* The document library's listings. The 27 documents themselves are in
            the registry above. */}
        <Route path="/dokumentumtar/" element={<Dokumentumtar />} />
        <Route path="/dokumentum-kategoria/:slug/" element={<DocTaxonomy kind="category" />} />
        <Route path="/dokumentum-cimke/:slug/" element={<DocTaxonomy kind="tag" />} />

        {/* The mirror's news posts are Hírkezelő posts (AGENT.md 6.24), served at
            their original /<slug>/ by the `/:slug/` route below. A post the
            snapshot never saved shows as a card that says so. */}

        {/* The 64 category, date and author archives. These are mapped from the
            data rather than listed: one component renders all of them, so the
            "an unwired page shows up as an unused file" argument that keeps the
            rest of this table explicit does not apply. */}
        {Object.values(archives).map((archive) => (
          <Route key={archive.route} path={archive.route} element={<ArchiveView />} />
        ))}

        {/* A page created in the Szerkesztő (AGENT.md 6.20), live data like
            /hirek/:slug/. Every exact route above outranks this pattern
            whatever the order; it sits here, last before the 404, so the
            table reads the way it resolves. An unknown slug falls through to
            <NotFound /> inside DocumentPage itself. */}
        <Route path="/:slug/" element={<DocumentPage />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
