import { useSearchParams } from 'react-router-dom'
import { useSession } from '../lib/hirkezelo/useSession.ts'
import {
  canManagePublished,
  canManageUsers,
  canSubmit,
  canViewAuditLog,
  hasNewsPermission,
} from '../../shared/pnw/permissions.ts'
import LoginCard from '../components/hirkezelo/LoginCard.tsx'
import Unauthorized from '../components/hirkezelo/Unauthorized.tsx'
import Shell from '../components/hirkezelo/Shell.tsx'
import Notice from '../components/hirkezelo/Notice.tsx'
import Dashboard from '../components/hirkezelo/Dashboard.tsx'
import Editor from '../components/hirkezelo/Editor.tsx'
import Review from '../components/hirkezelo/Review.tsx'
import Published from '../components/hirkezelo/Published.tsx'
import Archive from '../components/hirkezelo/Archive.tsx'
import Statistics from '../components/hirkezelo/Statistics.tsx'
import Audit from '../components/hirkezelo/Audit.tsx'
import Users from '../components/hirkezelo/Users.tsx'
import './Hirkezelo.css'

/**
 * The /hirkezelo/ route - a from-scratch re-implementation of the Petrik News
 * Workflow WordPress plugin's frontend (see AGENT.md 6.15 for the full
 * rationale and every place this knowingly differs from the original).
 *
 * The plugin's own shortcode dispatches on a `pnw_view` query parameter
 * (`?pnw_view=review&post_id=5`); this mirrors that exactly via
 * useSearchParams instead of nested routes, so the URL shape a bookmark or a
 * shared link would carry stays the same shape as the original.
 */
export default function Hirkezelo() {
  const { user, loading, login, logout } = useSession()
  const [params] = useSearchParams()
  const view = params.get('pnw_view') ?? 'dashboard'
  const postId = params.get('post_id') ?? undefined

  if (loading) {
    return (
      <div className="pnw-app">
        <div className="pnw-section">Betöltés…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pnw-app">
        <LoginCard onLogin={login} />
      </div>
    )
  }

  // Any single permission is enough to get in - which screens are reachable
  // is then decided one by one below (AGENT.md 6.16). The Szerkesztő's own
  // right does not count: it opens /szerkeszto/, not this (AGENT.md 6.19).
  if (!hasNewsPermission(user)) {
    return (
      <div className="pnw-app">
        <Unauthorized onLogout={logout} />
      </div>
    )
  }

  let content
  switch (view) {
    case 'new':
      content = canSubmit(user) ? <Editor key="new" user={user} /> : <Unauthorized onLogout={logout} />
      break
    case 'edit':
      content = postId ? <Editor key={postId} user={user} postId={postId} /> : <Dashboard user={user} />
      break
    case 'review':
      content = postId ? <Review key={postId} user={user} postId={postId} /> : <Dashboard user={user} />
      break
    case 'published':
      content = canManagePublished(user) ? <Published /> : <Unauthorized onLogout={logout} />
      break
    case 'published_edit':
      content =
        postId && canManagePublished(user) ? (
          <Editor key={postId} user={user} postId={postId} published />
        ) : (
          <Dashboard user={user} />
        )
      break
    case 'archive':
      content = canManagePublished(user) ? <Archive /> : <Unauthorized onLogout={logout} />
      break
    case 'stats':
      content = canViewAuditLog(user) ? <Statistics /> : <Unauthorized onLogout={logout} />
      break
    case 'audit':
      content = canViewAuditLog(user) ? <Audit /> : <Unauthorized onLogout={logout} />
      break
    case 'users':
      content = canManageUsers(user) ? <Users currentUserId={user.id} /> : <Unauthorized onLogout={logout} />
      break
    default:
      content = <Dashboard user={user} />
  }

  return (
    <div className="pnw-app">
      <Shell user={user} onLogout={logout} />
      <Notice />
      {content}
    </div>
  )
}
