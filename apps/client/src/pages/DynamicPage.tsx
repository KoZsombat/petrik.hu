import { useParams } from 'react-router-dom'
import PageRenderer from '../components/pagebuilder/PageRenderer.tsx'
import { useSiteContent } from '../lib/site/siteContext.ts'
import NotFound from './NotFound.tsx'

/**
 * A page created in the Szerkesztő (AGENT.md 6.19), served at `/<slug>/`.
 * Hand-written, not generated - like PublishedPost.tsx - and routed just
 * before the 404 in App.tsx, so every exact route still wins over it.
 *
 * The published pages arrive with the one /api/public/site fetch
 * (SiteContentProvider.tsx); until it settles this renders nothing rather
 * than flashing the 404. Its <title> and description are set by
 * useDocumentHead, which knows the page from the same fetch.
 */
export default function DynamicPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { pages, loading } = useSiteContent()
  const page = pages[slug]

  if (!page) return loading ? null : <NotFound />
  return <PageRenderer document={page.document} className={`page-${slug}`} />
}
