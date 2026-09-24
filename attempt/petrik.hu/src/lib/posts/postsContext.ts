import { createContext, useContext } from 'react'
import { posts as staticPosts } from '../../data/posts.ts'
import type { PostSummary } from '../../data/posts.ts'
import { categories } from '../../../shared/pnw/categories.ts'
import type { Post } from '../../../shared/pnw/types.ts'

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

const CATEGORY_NAME = new Map(categories.map((category) => [category.id, category.name]))

export function toSummary(post: Post): MergedPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categories: post.categoryIds.map((id) => ({ label: CATEGORY_NAME.get(id) ?? id, to: id })),
    image: post.featuredImage ? { src: post.featuredImage, alt: post.title } : undefined,
    date: new Date(post.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' }),
    available: true,
    href: `/hirek/${post.slug}/`,
  }
}

export const PostsContext = createContext<PostsContextValue>({ posts: staticPosts, liveSlugs: [], loading: false })

export function usePosts(): PostsContextValue {
  return useContext(PostsContext)
}
