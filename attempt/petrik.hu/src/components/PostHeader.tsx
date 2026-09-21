import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { posts } from '../data/posts.ts'
import './PostHeader.css'

type Props = {
  slug: string
  /**
   * The date as this page prints it. It is a prop rather than a field on the
   * post because WordPress let every template pick its own format, so the
   * string belongs to the page rather than to the post - the same split the
   * feeds make (see FeedItem in divi/PostCard.tsx).
   */
  date: string
}

/**
 * The title block above a single post: heading, date and categories.
 *
 * A single post prints no author, unlike the archive listings - that is the
 * theme's doing, and it is reproduced rather than harmonised.
 */
export default function PostHeader({ slug, date }: Props) {
  const post = posts[slug]
  if (!post) throw new Error(`no such post: ${slug}`)

  return (
    <div className="et_post_meta_wrapper">
      <h1 className="entry-title">{post.title}</h1>
      <p className="post-meta">
        <span className="published">{date}</span>
        {' | '}
        {post.categories.map((category, at) => (
          <Fragment key={category.to}>
            {at > 0 && ', '}
            <Link to={category.to} rel="category tag">
              {category.label}
            </Link>
          </Fragment>
        ))}
      </p>
    </div>
  )
}
