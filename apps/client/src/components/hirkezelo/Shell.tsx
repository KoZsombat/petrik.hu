import { Link } from 'react-router-dom'
import type { ApiUser } from '../../lib/hirkezelo/api.ts'
import {
  canManagePages,
  canManagePublished,
  canManageUsers,
  canSubmit,
  canViewAuditLog,
  permissionSummary,
} from '../../../../../shared/pnw/permissions.ts'

/**
 * Ported from PNW_Frontend_Shell_Trait::render_header(). The plugin's own
 * render_test_mode_banner() has no equivalent here anymore: TEST_MODE is
 * off by request (server/config.ts) - approving a submission really
 * publishes it, see AGENT.md 6.15.
 */
export default function Shell({ user, onLogout }: { user: ApiUser; onLogout: () => void }) {
  return (
    <>
      <header className="pnw-topbar">
        <div>
          <div className="pnw-kicker">Petrik</div>
          <h2>Hírkezelő</h2>
        </div>
        <div className="pnw-user">
          <strong>{user.displayName}</strong>
          <span>{permissionSummary(user)}</span>
        </div>
      </header>

      <nav className="pnw-nav" aria-label="Hírkezelő navigáció">
        <Link to="/hirkezelo/">Áttekintés</Link>
        {canSubmit(user) && <Link to="/hirkezelo/?pnw_view=new">+ Új hír</Link>}
        {canManagePublished(user) && (
          <>
            <Link to="/hirkezelo/?pnw_view=published">Kint lévő hírek</Link>
            <Link to="/hirkezelo/?pnw_view=archive">Archívum</Link>
          </>
        )}
        {canViewAuditLog(user) && (
          <>
            <Link to="/hirkezelo/?pnw_view=stats">Statisztika</Link>
            <Link to="/hirkezelo/?pnw_view=audit">Napló</Link>
          </>
        )}
        {canManageUsers(user) && <Link to="/hirkezelo/?pnw_view=users">Fiókok</Link>}
        {/* The page editor shares this login (AGENT.md 6.19). */}
        {canManagePages(user) && <Link to="/szerkeszto/">Szerkesztő →</Link>}
        <a className="pnw-nav-spacer" onClick={onLogout} role="button" tabIndex={0}>
          Kijelentkezés
        </a>
      </nav>
    </>
  )
}
