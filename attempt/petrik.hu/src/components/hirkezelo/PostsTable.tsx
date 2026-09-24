import { Link } from 'react-router-dom'
import { STATUS } from '../../../shared/pnw/types.ts'
import type { Post } from '../../../shared/pnw/types.ts'
import { statusCssClass, statusLabel } from '../../../shared/pnw/statuses.ts'
import { canEditWorkflowPost } from '../../../shared/pnw/access.ts'
import type { ApiUser } from '../../lib/hirkezelo/api.ts'
import { useTerms } from '../../lib/terms.ts'
import { termLine, formatDateTime } from './helpers.ts'

type Props = {
  posts: Post[]
  reviewer: boolean
  user: ApiUser
  authors: Map<string, ApiUser>
}

/** Ported from PNW_Frontend_Dashboard_Trait::render_posts_table(). */
export default function PostsTable({ posts, reviewer, user, authors }: Props) {
  const terms = useTerms()

  if (posts.length === 0) {
    return <div className="pnw-empty-inline">Nincs megjeleníthető hír.</div>
  }

  return (
    <div className="pnw-table-wrap">
      <table className="pnw-table">
        <thead>
          <tr>
            <th>Hír</th>
            <th>Beküldő</th>
            <th>Állapot</th>
            <th>Módosítva / megjelenés</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                <strong>{post.title || '(Névtelen hír)'}</strong>
                <small>{termLine(terms, post)}</small>
              </td>
              <td>{authors.get(post.authorId)?.displayName ?? '—'}</td>
              <td>
                <span className={`pnw-badge pnw-badge-${statusCssClass(post.status)}`}>
                  {statusLabel(post.status)}
                </span>
              </td>
              <td>
                {post.status === STATUS.FUTURE
                  ? `Megjelenés: ${formatDateTime(post.date)}`
                  : formatDateTime(post.modifiedAt)}
              </td>
              <td className="pnw-actions">{action(post, reviewer, user)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function action(post: Post, reviewer: boolean, user: ApiUser) {
  if (reviewer && post.status === STATUS.PENDING) {
    return (
      <Link className="pnw-button pnw-button-small" to={`/hirkezelo/?pnw_view=review&post_id=${post.id}`}>
        Ellenőrzés
      </Link>
    )
  }
  if (!reviewer && canEditWorkflowPost(post, user)) {
    const label = post.status === STATUS.REVISION ? 'Módosítás' : 'Szerkesztés'
    return (
      <Link className="pnw-button pnw-button-small" to={`/hirkezelo/?pnw_view=edit&post_id=${post.id}`}>
        {label}
      </Link>
    )
  }
  if (post.status === STATUS.REVISION && post.authorId === user.id) {
    return (
      <Link className="pnw-button pnw-button-small" to={`/hirkezelo/?pnw_view=edit&post_id=${post.id}`}>
        Módosítás
      </Link>
    )
  }
  if (post.status === STATUS.PUBLISH) {
    // The real plugin links to the post's public permalink here - this
    // re-implementation never touches the real site's news feed (TEST_MODE,
    // see AGENT.md 6.15), so there is no public URL to open.
    return null
  }
  return (
    <Link className="pnw-button pnw-button-secondary pnw-button-small" to={`/hirkezelo/?pnw_view=review&post_id=${post.id}`}>
      Részletek
    </Link>
  )
}
