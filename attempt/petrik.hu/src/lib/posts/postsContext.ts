import { createContext, useContext } from 'react'
import { posts as staticPosts } from '../../data/posts.ts'
import type { PostSummary } from '../../data/posts.ts'
import { termMap } from '../terms.ts'
import { formatPostDate } from '../postDate.ts'
import type { Post, Term } from '../../../shared/pnw/types.ts'

/**
 * The static, generated `posts` map (src/data/posts.ts) merged with whatever
 * is currently published through /hirkezelo/ (see AGENT.md 6.15) - by
 * request, a real published post shows up in the same widgets a mirrored
 * post would (RecentPosts, PostFeed/PostCard on the homepage).
 *
 * `href` is the one thing a live post needs that a mirrored `PostSummary`
 * never had to carry: a mirrored post's link is always `/${slug}/`
 * (PostCard/RecentPosts assume this), but a live post's real page lives at
 * `/hirek/${slug}/` - a different top-level prefix, deliberately (see
 * PublishedPost.tsx for why). Consumers should build links as
 * `post.href ?? \`/${slug}/\`` rather than assuming the mirrored pattern.
 *
 * Kept in its own plain (component-free) module, separate from
 * PostsProvider.tsx, purely so react-refresh/only-export-components stays
 * happy - it wants a file that exports a component to export nothing else.
 */
export type MergedPostSummary = PostSummary & { href?: string }

export type PostsContextValue = {
  posts: Record<string, MergedPostSummary>
  /** Live, published slugs, newest first - for widgets that feature recent news. */
  liveSlugs: string[]
  loading: boolean
}

/**
 * `terms` is the live category/tag list (src/lib/terms.ts) - categories are
 * editable rows now (AGENT.md 6.16), so a live post's category names are
 * resolved from it rather than from a build-time list. A category created
 * inside the Hírkezelő has no mirrored archive page, hence no `to` - the card
 * prints it as plain text instead of linking into a 404.
 */
export function toSummary(post: Post, terms: Term[]): MergedPostSummary {
  const byId = termMap(terms)

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categories: post.categoryIds.map((id) => ({ label: byId.get(id)?.name ?? id, to: byId.get(id)?.route ?? '' })),
    image: post.featuredImage ? { src: post.featuredImage, alt: post.title } : undefined,
    // The same format the mirrored cards next to it print (src/lib/postDate.ts).
    date: formatPostDate(post.date),
    available: true,
    href: `/hirek/${post.slug}/`,
  }
}

export const PostsContext = createContext<PostsContextValue>({ posts: staticPosts, liveSlugs: [], loading: false })

export function usePosts(): PostsContextValue {
  return useContext(PostsContext)
}
