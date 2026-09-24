/**
 * Genuinely public endpoints - no requireLogin, unlike everything under
 * /api/posts (see AGENT.md 6.15). This is what the site's own static pages
 * (the sidebar's "Legutóbbi bejegyzések" widget, the homepage's feeds, and
 * the /hirek/:slug/ page) read a published Hírkezelő post through.
 */
import { Router } from 'express'
import { STATUS } from '../../shared/pnw/types.ts'
import { allPosts, findPostBySlug } from '../data/posts-repo.ts'

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

export default router
