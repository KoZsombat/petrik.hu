import { Link } from 'react-router-dom'
import { usePosts } from '../lib/posts/postsContext.ts'

/** The five most recently listed posts, as the sidebar widget shows them. */
const RECENT = [
  'kutatok-ejszakaja-a-petrikben',
  'szeptember-21-ei-nyilt-nap-a-petrikben',
  'kodok-szuperhosok-es-urutazas-jon-az-idei-kodolas-hete-a-petrikben',
  'nyolcadikos-felveteli-elokeszito-foglalkozasok-a-2026-2027-tanevben',
  'informaciok-az-indulo-esti-kepzesekrol-2026',
]

/**
 * Live posts published through /hirkezelo/ (see AGENT.md 6.15) are prepended
 * ahead of the mirrored list, newest first, then the combined list is capped
 * back to 5 - exactly what a real "recent posts" widget would do when a new
 * post appears.
 */
export default function RecentPosts() {
  const { posts, liveSlugs } = usePosts()
  // A mirrored post archived in the Hírkezelő is gone from `posts` (AGENT.md 6.24); the next one moves up.
  const slugs = [...liveSlugs, ...RECENT.filter((slug) => posts[slug])].slice(0, 5)

  return (
    <div id="recent-posts-2" className="et_pb_widget widget_recent_entries">
      <h4 className="widgettitle">Legutóbbi bejegyzések</h4>
      <ul>
        {slugs.map((slug) => {
          const post = posts[slug]
          const title = post?.title ?? slug
          return (
            <li key={slug}>
              {post?.available ? <Link to={post.href ?? `/${slug}/`}>{title}</Link> : <span>{title}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
