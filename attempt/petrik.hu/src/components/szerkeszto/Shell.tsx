import { Link } from 'react-router-dom'
import type { ApiUser } from '../../lib/hirkezelo/api.ts'
import { hasNewsPermission, permissionSummary } from '../../../shared/pnw/permissions.ts'

/**
 * The Szerkesztő's header and navigation (AGENT.md 6.19) - the Hírkezelő's
 * Shell.tsx, same markup and `.pnw-*` classes, with its own menu.
 */
export default function Shell({ user, onLogout }: { user: ApiUser; onLogout: () => void }) {
  return (
    <>
      <header className="pnw-topbar">
        <div>
          <div className="pnw-kicker">Petrik</div>
          <h2>Szerkesztő</h2>
        </div>
        <div className="pnw-user">
          <strong>{user.displayName}</strong>
          <span>{permissionSummary(user)}</span>
        </div>
      </header>

      <nav className="pnw-nav" aria-label="Szerkesztő navigáció">
        <Link to="/szerkeszto/">Oldalak</Link>
        <Link to="/szerkeszto/?view=new">+ Új oldal</Link>
        <Link to="/szerkeszto/?view=menu">Menü</Link>
        <Link to="/szerkeszto/?view=media">Médiatár</Link>
        {hasNewsPermission(user) && <Link to="/hirkezelo/">Hírkezelő →</Link>}
        <a className="pnw-nav-spacer" onClick={onLogout} role="button" tabIndex={0}>
          Kijelentkezés
        </a>
      </nav>
    </>
  )
}
