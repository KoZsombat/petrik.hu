import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { LoginErrorCode } from '../../../../../shared/pnw/types.ts'

const MESSAGES: Record<LoginErrorCode, string> = {
  empty_fields: 'Add meg a felhasználóneved és a jelszavad.',
  invalid_credentials: 'A megadott felhasználónév vagy jelszó nem megfelelő.',
  no_access: 'Ezzel a felhasználóval nincs jogosultság a Petrik Hírkezelő használatához.',
  too_many_attempts: 'Túl sok sikertelen próbálkozás. Várj 15 percet, és próbáld újra.',
}

type Props = {
  onLogin: (login: string, password: string) => Promise<void>
  /** The card's heading - /bejelentkezes/ and /szerkeszto/ reuse this card (AGENT.md 6.19). */
  title?: string
  intro?: ReactNode
  /** The demo-account note; on by default, as the Hírkezelő always showed it. */
  showDemoHint?: boolean
}

/** Ported from PNW_Frontend_Shell_Trait::render_login(). */
export default function LoginCard({
  onLogin,
  title = 'Hírkezelő',
  intro = 'A felületet azok használhatják, akiknek a fiókján van hírkezelési jogosultság.',
  showDemoHint = true,
}: Props) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // The server decides whether the demo accounts may be advertised - never on
  // a public deployment (server/config.ts SHOW_DEMO_LOGINS). Hidden until it answers.
  const [demoLogins, setDemoLogins] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/config')
      .then((response) => (response.ok ? response.json() : { demoLogins: false }))
      .then((data: { demoLogins?: boolean }) => {
        if (!cancelled) setDemoLogins(data.demoLogins === true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!login.trim() || !password) {
      setError(MESSAGES.empty_fields)
      return
    }

    setBusy(true)
    setError(null)
    try {
      await onLogin(login, password)
    } catch (caught) {
      const code = caught instanceof ApiError ? (caught.code as LoginErrorCode) : undefined
      setError((code && MESSAGES[code]) ?? 'A bejelentkezés nem sikerült.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="pnw-login-card">
      <div className="pnw-kicker">Petrik</div>
      <h2>{title}</h2>
      {/* Szerepkörök helyett jogosultságok (AGENT.md 6.16) - a felületet az
          használhatja, akinek a fiókján be van kapcsolva legalább egy jog. */}
      <p>{intro}</p>

      {showDemoHint && demoLogins && <DemoHint />}

      {error && <div className="pnw-notice pnw-notice-error pnw-login-error">{error}</div>}

      <form className="pnw-login-form" onSubmit={handleSubmit}>
        <p className="login-username">
          <label htmlFor="pnw-login-user">Felhasználónév</label>
          <input
            id="pnw-login-user"
            type="text"
            autoComplete="username"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
          />
        </p>
        <p className="login-password">
          <label htmlFor="pnw-login-password">Jelszó</label>
          <input
            id="pnw-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </p>
        <p className="login-submit">
          <button className="pnw-button" type="submit" disabled={busy}>
            {busy ? 'Bejelentkezés…' : 'Bejelentkezés'}
          </button>
        </p>
      </form>
    </section>
  )
}

/** The seeded demo accounts (server/data/users-repo.ts) - the same note wherever the card is shown. */
function DemoHint() {
  return (
    <div className="pnw-login-hint">
      Ez egy demó bejelentkezés (nincs igazi WordPress mögötte) - próbáld ki bármelyikkel:
      <br />
      <code>mk.vezeto</code> / <code>PetrikMK2026!</code> (hírbeküldés) ·{' '}
      <code>helyettes</code> / <code>PetrikHelyettes2026!</code> (jóváhagyás, fiókok, oldalak) ·{' '}
      <code>igazgato</code> / <code>PetrikIgazgato2026!</code> (jóváhagyás, fiókok, oldalak)
    </div>
  )
}
