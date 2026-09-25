import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Post } from '../../../../shared/pnw/types.ts'
import PostTemplatePreview from '../components/hirkezelo/PostTemplatePreview.tsx'
import NotFound from './NotFound.tsx'

/**
 * A real page for a post published through /hirkezelo/ (see AGENT.md 6.15) -
 * not one of the 129 mirrored pages, hand-written rather than generated, and
 * the only page whose content comes from a live fetch instead of
 * src/data/*.ts. Renders through the exact same real single-post template
 * already built for the Hírkezelő's own preview (PostTemplatePreview), which
 * is what gives it the same Header/Footer/two-column chrome as every other
 * post - "mint a többi hír".
 */
export default function PublishedPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    // A route-param change (navigating from one live post to another) keeps
    // this component mounted, unlike Review.tsx's `key={postId}` remount -
    // resetting here is the effect synchronizing with a new `slug`, not
    // derived render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPost(null)
    setNotFound(false)

    fetch(`/api/public/posts/${encodeURIComponent(slug ?? '')}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('not_found'))))
      .then((data: { post: Post }) => {
        if (cancelled) return
        setPost(data.post)
        document.title = `${data.post.title} | petrik.hu`
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (notFound) return <NotFound />
  if (!post) return null

  return (
    <PostTemplatePreview
      title={post.title}
      content={post.content}
      categoryIds={post.categoryIds}
      image={post.featuredImage}
      date={post.date}
    />
  )
}
