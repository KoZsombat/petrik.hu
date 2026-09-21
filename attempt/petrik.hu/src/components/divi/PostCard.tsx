import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { posts } from '../../data/posts.ts'
import './PostCard.css'

/**
 * One entry of a feed: which post, plus the meta this particular feed shows.
 * Divi's blog module decided per instance whether to print the author and the
 * date, and in what format, so both are carried here as the feed rendered them.
 */
export type FeedItem = {
  slug: string
  date?: string
  author?: { name: string; to: string }
}

type Props = {
  item: FeedItem
  /** Divi numbers each card within its feed, e.g. et_pb_blog_item_0_3. */
  feedIndex: number
  position: number
}

/**
 * A card in a blog feed.
 *
 * Posts outside this port render without links and carry a visible note, so a
 * reader can tell a page that is missing from one that was never captured.
 */
export default function PostCard({ item, feedIndex, position }: Props) {
  const post = posts[item.slug]
  const href = `/${post.slug}/`

  const classes = [
    'et_pb_post',
    'clearfix',
    'et_pb_has_overlay',
    `et_pb_blog_item_${feedIndex}_${position}`,
  ]
  if (!post.available) classes.push('post-unavailable')

  const image = post.image && (
    <img
      src={post.image.src}
      alt={post.image.alt}
      srcSet={post.image.srcSet}
      sizes={post.image.sizes}
      width={post.image.width}
      height={post.image.height}
      loading="lazy"
      decoding="async"
    />
  )

  // Divi joins the meta parts with " | " and the categories with ", ".
  const metaParts: ReactNode[] = []
  if (item.author) {
    metaParts.push(
      <span key="author" className="author vcard">
        {`Szerző: `}
        <Link to={item.author.to} rel="author">
          {item.author.name}
        </Link>
      </span>,
    )
  }
  if (item.date) {
    metaParts.push(
      <span key="date" className="published">
        {item.date}
      </span>,
    )
  }
  if (post.categories.length) {
    metaParts.push(
      <Fragment key="categories">
        {post.categories.map((category, index) => (
          <Fragment key={category.to}>
            {index > 0 && ', '}
            <Link to={category.to} rel="tag">
              {category.label}
            </Link>
          </Fragment>
        ))}
      </Fragment>,
    )
  }

  return (
    <article
      className={classes.join(' ')}
      title={post.available ? undefined : 'Ez a bejegyzés nem érhető el a mentésben.'}
    >
      {image && (
        <div className="et_pb_image_container">
          {post.available ? (
            <Link to={href} className="entry-featured-image-url">
              {image}
              <span className="et_overlay et_pb_inline_icon" />
            </Link>
          ) : (
            /*
             * An <a> with no href: not a link, not focusable, but still an <a>.
             * That matters, because the theme's `.et_pb_post a img` sets
             * vertical-align: bottom, and a <span> here would drop the image
             * back onto the baseline and add about 7px of descender under
             * every card that is not part of the snapshot.
             */
            <a className="entry-featured-image-url">
              {image}
              <span className="et_overlay et_pb_inline_icon" />
            </a>
          )}
        </div>
      )}

      <h2 className="entry-title">
        {post.available ? <Link to={href}>{post.title}</Link> : post.title}
      </h2>

      {metaParts.length > 0 && (
        <p className="post-meta">
          {metaParts.map((part, index) => (
            <Fragment key={index}>
              {index > 0 && ' | '}
              {part}
            </Fragment>
          ))}
        </p>
      )}

      <div className="post-content">
        <div className="post-content-inner">
          <p>{post.excerpt}</p>
        </div>
        {post.available ? (
          <Link to={href} className="more-link">
            bővebben
          </Link>
        ) : (
          /*
           * An <a> with no href, not a <p>: the theme gives .more-link the line
           * box the card's height is built on, and a paragraph of the port's
           * own made every unavailable card 1.6px taller than the mirror's.
           * Same call as the unavailable post's image - see AGENT.md 6.11.
           *
           * The wording is short for the same reason. It inherits the post's
           * 14px so that its line box matches, and at 14px a longer sentence
           * wraps to a second line - which costs 32px a card. The full
           * sentence is on the article's title attribute, which is not laid
           * out at all.
           */
          <a className="more-link post-unavailable-note">nincs a mentésben</a>
        )}
      </div>
    </article>
  )
}
