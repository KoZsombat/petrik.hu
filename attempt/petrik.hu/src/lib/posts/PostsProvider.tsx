import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { posts as staticPosts } from '../../data/posts.ts'
import type { Post } from '../../../shared/pnw/types.ts'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/public/posts?limit=20')
      .then((response) => (response.ok ? response.json() : { posts: [] }))
      .then((data: { posts?: Post[] }) => {
        if (!cancelled) setLivePosts(data.posts ?? [])
      })
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
    for (const post of livePosts) merged[post.slug] = toSummary(post)
    return { posts: merged, liveSlugs: livePosts.map((post) => post.slug), loading }
  }, [livePosts, loading])

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}
