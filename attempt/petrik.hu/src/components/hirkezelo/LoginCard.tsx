import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { LoginErrorCode } from '../../../shared/pnw/types.ts'

const MESSAGES: Record<LoginErrorCode, string> = {
  empty_fields: 'Add meg a felhasználóneved és a jelszavad.',
  invalid_credentials: 'A megadott felhasználónév vagy jelszó nem megfelelő.',
  no_access: 'Ezzel a felhasználóval nincs jogosultság a Petrik Hírkezelő használatához.',
}

/** Ported from PNW_Frontend_Shell_Trait::render_login(). */
export default function LoginCard({ onLogin }: { onLogin: (login: string, password: string) => Promise<void> }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
      <h2>Hírkezelő</h2>
      <p>A felületet munkaközösség-vezetők, igazgatóhelyettesek és az igazgató használhatják.</p>

      <div className="pnw-login-hint">
        Ez egy demó bejelentkezés (nincs igazi WordPress mögötte) - próbáld ki bármelyikkel:
        <br />
        <code>mk.vezeto</code> / <code>PetrikMK2026!</code> (munkaközösség-vezető) ·{' '}
        <code>helyettes</code> / <code>PetrikHelyettes2026!</code> (igazgatóhelyettes) ·{' '}
        <code>igazgato</code> / <code>PetrikIgazgato2026!</code> (igazgató)
      </div>

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
