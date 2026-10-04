import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { posts as staticPosts } from '../../data/posts.ts'
import type { Post } from '../../../../../shared/pnw/types.ts'
import { useTerms } from '../terms.ts'
import { PostsContext, toSummary } from './postsContext.ts'
import type { MergedPostSummary, PostsContextValue } from './postsContext.ts'

/**
 * Fetches the live post list once per full page load (mounted in Layout.tsx,
 * which stays mounted across client-side navigation - see its own comment).
 * If the backend isn't running at all, the site still works: it just falls
 * back to showing the static mirror data only, same as before this existed.
 */
export function PostsProvider({ children }: { children: ReactNode }) {
  const [livePosts, setLivePosts] = useState<Post[]>([])
  const [hiddenSlugs, setHiddenSlugs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const terms = useTerms()

  useEffect(() => {
    let cancelled = false

    const live = fetch('/api/public/posts?limit=20')
      .then((response) => (response.ok ? response.json() : { posts: [] }))
      .then((data: { posts?: Post[] }) => {
        if (!cancelled) setLivePosts(data.posts ?? [])
      })
    // The old site's posts live in the Hírkezelő now (AGENT.md 6.24); one
    // archived there has to leave the mirror's lists as well.
    const hidden = fetch('/api/public/posts/hidden-mirror')
      .then((response) => (response.ok ? response.json() : { slugs: [] }))
      .then((data: { slugs?: string[] }) => {
        if (!cancelled) setHiddenSlugs(data.slugs ?? [])
      })

    Promise.all([live, hidden])
      .catch(() => {
        /* no backend running - the static site still has to work on its own */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<PostsContextValue>(() => {
    const merged: Record<string, MergedPostSummary> = { ...staticPosts }
    for (const slug of hiddenSlugs) delete merged[slug]
    for (const post of livePosts) merged[post.slug] = toSummary(post, terms)
    return { posts: merged, liveSlugs: livePosts.map((post) => post.slug), loading }
  }, [livePosts, hiddenSlugs, loading, terms])

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}
