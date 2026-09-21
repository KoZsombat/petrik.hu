import { Link } from 'react-router-dom'
import { posts } from '../data/posts.ts'

/** The five most recently listed posts, as the sidebar widget shows them. */
const RECENT = [
  'kutatok-ejszakaja-a-petrikben',
  'szeptember-21-ei-nyilt-nap-a-petrikben',
  'kodok-szuperhosok-es-urutazas-jon-az-idei-kodolas-hete-a-petrikben',
  'nyolcadikos-felveteli-elokeszito-foglalkozasok-a-2026-2027-tanevben',
  'informaciok-az-indulo-esti-kepzesekrol-2026',
]

export default function RecentPosts() {
  return (
    <div id="recent-posts-2" className="et_pb_widget widget_recent_entries">
      <h4 className="widgettitle">Legutóbbi bejegyzések</h4>
      <ul>
        {RECENT.map((slug) => {
          const post = posts[slug]
          const title = post?.title ?? slug
          return (
            <li key={slug}>
              {post?.available ? <Link to={`/${slug}/`}>{title}</Link> : <span>{title}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
