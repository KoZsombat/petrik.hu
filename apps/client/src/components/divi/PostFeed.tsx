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
  /**
   * The original offered an "older posts" link here. Those pages are not part
   * of the snapshot, so the control is shown but not linked.
   */
  hasOlder?: boolean
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
  className,
  includeLive = false,
}: Props) {
  const { posts, liveSlugs } = usePosts()
  const active = useColumnCount(columns)
  // Prepended ahead of the mirrored items, newest first, then capped back to
  // the feed's own size - same convention as the sidebar's "Legutóbbi
  // bejegyzések" widget (RecentPosts.tsx). The date comes from the live post
  // itself (already formatted the way every mirrored card's date is, see
  // postsContext.ts/toSummary), since a live item has no hand-written date.
  const effectiveItems = includeLive
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
        {hasOlder && (
          <div className="pagination clearfix">
            <div className="alignleft">
              <span className="pagination-unavailable">
                « Régebbi bejegyzések – nem érhetők el a mentésben
              </span>
            </div>
            <div className="alignright" />
          </div>
        )}
      </div>
    </div>
  )
}
