import { useParams } from 'react-router-dom'
import PageRenderer from '../components/pagebuilder/PageRenderer.tsx'
import { pageDefaults } from '../data/pages/index.ts'
import { useSiteContent } from '../lib/site/siteContext.ts'
import NotFound from './NotFound.tsx'
import PublishedPost from './PublishedPost.tsx'

/**
 * Every page of the site that is a document (AGENT.md 6.20): the 53 mirrored
 * pages - routed one by one from the registry in src/data/pages - and the
 * pages created in the Szerkesztő, routed through `/:slug/`.
 *
 * What is shown: the edited document when the Szerkesztő published one for
 * the route, nothing but a 404 when it deleted the page, otherwise the
 * bundled default. A custom route has no default, so until the one
 * /api/public/site fetch settles this renders nothing rather than flashing
 * the 404. Its <title> and description are set by useDocumentHead, which
 * reads the same fetch.
 */
export default function DocumentPage({ route: fixedRoute }: { route?: string }) {
  const { slug = '' } = useParams<{ slug: string }>()
  const route = fixedRoute ?? `/${slug}/`
  const { pages, loading } = useSiteContent()
  const edited = pages[route]
  const fallback = pageDefaults[route]

  if (edited?.deleted) return <NotFound />
  const document = edited?.document ?? fallback?.document
  // No page by this name: the old site's news posts live here too, imported
  // into the Hírkezelő (AGENT.md 6.24). PublishedPost asks the server and
  // shows the 404 itself when there is no such published post either.
  if (!document) return loading ? null : fixedRoute ? <NotFound /> : <PublishedPost key={slug} slug={slug} />

  // Custom pages add their own `page-<slug>` beside the shared builder design.
  // `key`: every document is a different tree, and node ids repeat between
  // them (`m0`), so a client-side navigation must not reuse the previous
  // page's components - an open toggle or the slider's slide would follow.
  return <PageRenderer key={route} document={document} className={fallback ? undefined : `page-${slug}`} />
}
