/**
 * Genuinely public endpoints - no requireLogin, unlike everything under
 * /api/posts (see AGENT.md 6.15). This is what the site's own static pages
 * (the sidebar's "Legutóbbi bejegyzések" widget, the homepage's feeds, and
 * the /hirek/:slug/ page) read a published Hírkezelő post through.
 */
import { Router } from 'express'
import { STATUS } from '../../../shared/pnw/types.ts'
import type { PageOverrides, PublicPage, PublicSiteContent } from '../../../shared/pnw/page-types.ts'
import { allPosts, findPostBySlug } from '../data/posts-repo.ts'
import { getPageBySlug, listPages } from '../data/pages-repo.ts'
import { allOverrides } from '../data/overrides-repo.ts'
import { getMenu } from '../data/menu-repo.ts'

const router = Router()

router.get('/posts', (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20)
  const posts = allPosts()
    .filter((post) => post.status === STATUS.PUBLISH)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
  res.json({ posts })
})

router.get('/posts/:slug', (req, res) => {
  const post = findPostBySlug(req.params.slug)
  if (!post || post.status !== STATUS.PUBLISH) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  res.json({ post })
})

/**
 * Everything the Szerkesztő changed (AGENT.md 6.19), in one response - the
 * public site fetches this once per page load (SiteContentProvider.tsx), and
 * a failed fetch leaves every page exactly as generated. Drafts never leave
 * the server.
 */
router.get('/site', (_req, res) => {
  const pages: PublicPage[] = listPages()
    .filter((page) => page.status === 'publish')
    .map(({ slug, title, description, document }) => ({ slug, title, description, document }))
  const overrides: Record<string, PageOverrides> = {}
  for (const stored of allOverrides()) overrides[stored.overrides.route] = stored.overrides
  const body: PublicSiteContent = { pages, overrides, menu: getMenu()?.menu ?? null }
  res.json(body)
})

/** A builder page on its own, for a direct load of /<slug>/. */
router.get('/pages/:slug', (req, res) => {
  const page = getPageBySlug(req.params.slug)
  if (!page || page.status !== 'publish') {
    res.status(404).json({ error: 'not_found' })
    return
  }
  const { slug, title, description, document } = page
  res.json({ page: { slug, title, description, document } satisfies PublicPage })
})

export default router
