import { useLocation } from 'react-router-dom'
import ArchiveCard from './ArchiveCard.tsx'
import ArchivePagination from './ArchivePagination.tsx'
import Sidebar from './Sidebar.tsx'
import NotFound from '../pages/NotFound.tsx'
import { archiveAt } from '../data/archives.ts'
import { posts } from '../data/posts.ts'
import { useBodyClass } from '../lib/useBodyClass.ts'
import './ArchiveView.css'

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
  const archive = archiveAt(pathname)
  // The theme sizes the listing headings and places the sidebar off these.
  useBodyClass(['archive', 'et_right_sidebar'])
  // A route that outlives its data should say so rather than render blank.
  if (!archive) return <NotFound />

  return (
    <div id="main-content" className="archive-view">
      <div className="container">
        <div id="content-area" className="clearfix">
          <div id="left-area">
            {archive.slugs.map((slug) => {
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
