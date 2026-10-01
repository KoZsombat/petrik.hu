import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../lib/hirkezelo/api.ts'
import type { Post } from '../../../../shared/pnw/types.ts'
import PostTemplatePreview from '../components/hirkezelo/PostTemplatePreview.tsx'
import NotFound from './NotFound.tsx'

/**
 * /hirkezelo/elonezet/:id/ - the "Megtekintés publikáltként" button's target
 * on the review screen: the saved post as a real page of the site, with the
 * header, footer and sidebar, exactly the single-post page it will become once
 * approved (PublishedPost.tsx renders through the same template). Opens in a
 * new tab, needs the Hírkezelő login (the post is not public yet - GET
 * /api/posts/:id checks who may see it) and is never indexed.
 */
export default function PostPreviewPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [state, setState] = useState<'loading' | 'missing'>('loading')

  useEffect(() => {
    let cancelled = false
    api
      .getPost(id)
      .then(({ post }) => {
        if (cancelled) return
        setPost(post)
        document.title = `Előnézet: ${post.title} | petrik.hu`
        let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
        if (!robots) {
          robots = document.createElement('meta')
          robots.name = 'robots'
          document.head.appendChild(robots)
        }
        robots.content = 'noindex, nofollow'
      })
      .catch(() => {
        if (!cancelled) setState('missing')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (state === 'missing') return <NotFound />
  if (!post) return null

  return (
    <>
      <div className="pnw-preview-banner">
        Előnézet - ez a hír még nem publikus. Így fog megjelenni, ha jóváhagyják (a legutóbb mentett változat).
      </div>
      <PostTemplatePreview
        title={post.title}
        content={post.content}
        categoryIds={post.categoryIds}
        image={post.featuredImage}
        imagePosition={post.imagePosition}
        date={post.date}
      />
    </>
  )
}
