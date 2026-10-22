import { Link, useLocation } from 'react-router-dom'
import { usePosts } from '../../lib/posts/postsContext.ts'
import { useColumnCount } from '../../lib/useColumnCount.ts'
import PostCard, { type FeedItem } from './PostCard.tsx'
import './PostFeed.css'

type Props = {
  /**
   * The posts this feed lists, in the original order, each with the meta the
   * feed itself renders. Divi let every blog module choose whether to show the
   * author and the date, and in what format, so that belongs here rather than
   * on the shared post record.
   */
  items: FeedItem[]
  /** Divi numbers blog modules per page for its design stylesheet. */
  index: number
  /** Columns at desktop width; narrower viewports use fewer. */
  columns?: 1 | 2 | 3
  align?: 'left' | 'center' | 'right'
  /** The original offered an "older posts" link under the feed. */
  hasOlder?: boolean
  /**
   * What the feed listed on its further pages, newest first: page 2 is
   * `olderPages[0]`. They live at `<page route>page/N/`, as on the original.
   */
  olderPages?: FeedItem[][]
  className?: string
  /**
   * Prepends whatever is currently published through /hirkezelo/ (see
   * AGENT.md 6.15), newest first, ahead of `items`. Default false/unset: this
   * is opt-in per feed instance (only the homepage's two feeds turn it on,
   * via scripts/walk.ts) rather than global, since most PostFeed instances
   * across the mirrored pages are about one specific historical topic, not
   * "whatever's newest site-wide".
   */
  includeLive?: boolean
}

/**
 * Divi's blog module in grid layout.
 *
 * The original filled the columns with Salvattore, a script that deals the
 * items out round-robin; the same distribution happens here while rendering,
 * so no script is needed and the markup matches.
 */
export default function PostFeed({
  items,
  index,
  columns = 3,
  align = 'left',
  hasOlder = false,
  olderPages,
  className,
  includeLive = false,
}: Props) {
  const { posts, liveSlugs } = usePosts()
  const active = useColumnCount(columns)
  const { pathname } = useLocation()
  const paged = /^(.*\/)page\/(\d+)\/?$/.exec(pathname)
  const base = paged ? paged[1] : pathname.endsWith('/') ? pathname : `${pathname}/`
  const pageNumber = paged ? Number(paged[2]) : 1
  const pageItems = pageNumber > 1 ? (olderPages?.[pageNumber - 2] ?? []) : items
  const hasNewer = pageNumber > 1
  const hasMore = !!olderPages && pageNumber - 1 < olderPages.length
  const pageUrl = (n: number) => (n > 1 ? `${base}page/${n}/` : base)
  // Prepended ahead of the mirrored items, newest first, then capped back to
  // the feed's own size - same convention as the sidebar's "Legutóbbi
  // bejegyzések" widget (RecentPosts.tsx). The date comes from the live post
  // itself (already formatted the way every mirrored card's date is, see
  // postsContext.ts/toSummary), since a live item has no hand-written date.
  const effectiveItems = pageNumber > 1
    ? pageItems
    : includeLive
    ? [...liveSlugs.map((slug): FeedItem => ({ slug, date: posts[slug]?.date })), ...items].slice(0, items.length)
    : items
  const known = effectiveItems.filter((item) => posts[item.slug])

  const buckets: { item: FeedItem; position: number }[][] = Array.from({ length: active }, () => [])
  known.forEach((item, position) => {
    buckets[position % active].push({ item, position })
  })

  const classes = [
    'et_pb_module',
    `et_pb_blog_${index}`,
    'et_pb_blog_grid_wrapper',
    'et_pb_bg_layout_light',
  ]
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')}>
      <div className={`et_pb_blog_grid clearfix et_pb_text_align_${align}`}>
        <div className="et_pb_ajax_pagination_container">
          <div className="et_pb_salvattore_content" data-columns={active}>
            {buckets.map((bucket, columnIndex) => (
              <div key={`column-${columnIndex}`} className={`column size-1of${active}`}>
                {bucket.map(({ item, position }) => (
                  <PostCard key={item.slug} item={item} feedIndex={index} position={position} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {(hasOlder || hasNewer) && (
          <div className="pagination clearfix">
            <div className="alignleft">
              {hasMore && <Link to={pageUrl(pageNumber + 1)}>« Régebbi bejegyzések</Link>}
            </div>
            <div className="alignright">
              {hasNewer && <Link to={pageUrl(pageNumber - 1)}>Újabb bejegyzések »</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
