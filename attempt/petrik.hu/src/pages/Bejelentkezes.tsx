import { Link } from 'react-router-dom'
import { useSession } from '../lib/hirkezelo/useSession.ts'
import { canManagePages, hasNewsPermission, permissionSummary } from '../../shared/pnw/permissions.ts'
import LoginCard from '../components/hirkezelo/LoginCard.tsx'
import './Hirkezelo.css'

/**
 * /bejelentkezes/ - one login for both tools (AGENT.md 6.19): after signing
 * in, the account is offered the Hírkezelő, the Szerkesztő, or both,
 * depending on what it may use. Hand-written, not a mirror page.
 *
 * Everything sits in a `.pnw-app` and uses the Hírkezelő's own `.pnw-*`
 * classes, which is what makes it 75% wide and centred (6.17) - no CSS of its
 * own. /hirkezelo/ keeps its own login card, so bookmarks still work.
 */
export default function Bejelentkezes() {
  const { user, loading, login, logout } = useSession()

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
        <LoginCard
          onLogin={login}
          title="Bejelentkezés"
          intro="Egy bejelentkezés a Hírkezelőhöz és a Szerkesztőhöz - utána kiválaszthatod, melyiket nyitod meg."
        />
      </div>
    )
  }

  const news = hasNewsPermission(user)
  const pages = canManagePages(user)

  return (
    <div className="pnw-app">
      <header className="pnw-topbar">
        <div>
          <div className="pnw-kicker">Petrik</div>
          <h2>Bejelentkezés</h2>
        </div>
        <div className="pnw-user">
          <strong>{user.displayName}</strong>
          <span>{permissionSummary(user)}</span>
        </div>
      </header>

      <section className="pnw-section">
        <div className="pnw-section-heading">
          <div>
            <h3>Szia, {user.displayName}!</h3>
            <p>Válaszd ki, melyik felületet szeretnéd megnyitni.</p>
          </div>
          <button type="button" className="pnw-button pnw-button-secondary" onClick={logout}>
            Kijelentkezés
          </button>
        </div>

        {news || pages ? (
          <div className="pnw-decision-grid">
            {news && (
              <div className="pnw-decision pnw-decision-approve">
                <h3>Hírkezelő</h3>
                <p>Hírek írása és beküldése, jóváhagyás, a kint lévő hírek és a fiókok kezelése.</p>
                <Link className="pnw-button" to="/hirkezelo/">
                  Hírkezelő megnyitása
                </Link>
              </div>
            )}
            {pages && (
              <div className="pnw-decision pnw-decision-approve">
                <h3>Szerkesztő</h3>
                <p>Az oldalak szövegének és képeinek módosítása, új oldalak létrehozása és a menü szerkesztése.</p>
                <Link className="pnw-button" to="/szerkeszto/">
                  Szerkesztő megnyitása
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="pnw-empty-inline">
            Ezen a fiókon még nincs jogosultság. Kérd meg valamelyik fiókkezelőt, hogy állítsa be.
          </div>
        )}
      </section>
    </div>
  )
}
