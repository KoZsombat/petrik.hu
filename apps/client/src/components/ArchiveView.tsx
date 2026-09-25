import { useLocation } from 'react-router-dom'
import ArchiveCard from './ArchiveCard.tsx'
import ArchivePagination from './ArchivePagination.tsx'
import Sidebar from './Sidebar.tsx'
import NotFound from '../pages/NotFound.tsx'
import { archiveAt } from '../data/archives.ts'
import { usePosts } from '../lib/posts/postsContext.ts'
import type { MergedPostSummary } from '../lib/posts/postsContext.ts'
import { useBodyClass } from '../lib/useBodyClass.ts'
import './ArchiveView.css'

/** A paged archive route ("/kategoria/hirek/page/2/") rather than its first page. */
const PAGED_ROUTE = /page\/\d+\/$/

/**
 * Every category, date and author archive.
 *
 * WordPress used one template for all three and varied only the query, so one
 * component serves all 64 of them, looked up by the path the router reports.
 * They are data rather than pages: which posts each lists, in what order and
 * with what pagination is transcribed from the mirror in src/data/archives.ts.
 *
 * There is deliberately no heading. The theme printed none - an archive's only
 * name lives in the <title>, and the date archives all share "Archívum" - so
 * adding one here would be writing the site rather than porting it.
 */
export default function ArchiveView() {
  const { pathname } = useLocation()
  const { posts, liveSlugs } = usePosts()
  const archive = archiveAt(pathname)
  // The theme sizes the listing headings and places the sidebar off these.
  useBodyClass(['archive', 'et_right_sidebar'])
  // A route that outlives its data should say so rather than render blank.
  if (!archive) return <NotFound />

  /*
   * A post published through /hirkezelo/ (AGENT.md 6.18) belongs in the
   * category archive it was filed under - "/kategoria/hirek/" is the site's
   * own Hírek page, reached from the main menu - so it is prepended there,
   * newest first, exactly as WordPress would have listed it.
   *
   * Only category archives, and only their first page: the paging and the
   * order inside the mirrored list are transcribed from the mirror rather
   * than recomputed (see src/data/archives.ts), so live posts are added in
   * front of that list instead of being paged into it. Date and author
   * archives are left alone - a live post has no mirrored author, and its
   * date archive route may not exist in the snapshot at all.
   */
  const live: MergedPostSummary[] =
    archive.kind === 'category' && !PAGED_ROUTE.test(archive.route)
      ? liveSlugs
          .map((slug) => posts[slug])
          .filter(
            (post): post is MergedPostSummary =>
              !!post && post.categories.some((category) => category.to === archive.route),
          )
      : []
  const liveSlugSet = new Set(live.map((post) => post.slug))

  return (
    <div id="main-content" className="archive-view">
      <div className="container">
        <div id="content-area" className="clearfix">
          <div id="left-area">
            {live.map((post) => (
              <ArchiveCard key={post.slug} post={post} />
            ))}
            {archive.slugs
              .filter((slug) => !liveSlugSet.has(slug))
              .map((slug) => {
                const post = posts[slug]
                return post ? <ArchiveCard key={slug} post={post} /> : null
              })}
            <ArchivePagination archive={archive} />
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  )
}
