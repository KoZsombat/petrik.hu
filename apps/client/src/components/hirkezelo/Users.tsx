import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { AccountInput, ApiUser } from '../../lib/hirkezelo/api.ts'
import type { Capability } from '../../../../../shared/pnw/types.ts'
import { ALL_CAPABILITIES, CAPABILITY_DESCRIPTION, CAPABILITY_LABEL } from '../../../../../shared/pnw/permissions.ts'

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'A felhasználónév és a név kötelező.',
  password_too_short: 'A jelszó legalább 8 karakter legyen.',
  username_taken: 'Ez a felhasználónév már foglalt.',
  cannot_delete_self: 'A saját fiókodat nem törölheted.',
  last_manager: 'Ez az egyetlen fiók, ami fiókokat kezelhet - előbb adj valaki másnak "Fiókok kezelése" jogot.',
  not_found: 'A fiók már nem létezik.',
}

function emptyForm(): AccountInput {
  return { username: '', displayName: '', password: '', permissions: [] }
}

/**
 * Account management - no equivalent in the real plugin (wp-admin's own user
 * screen does this there). An account is a login plus a **set of
 * permissions**; there are no roles to pick from (AGENT.md 6.16), so this
 * form is where every capability is granted one by one.
 */
export default function Users({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<ApiUser[] | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<AccountInput>(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function reload(): Promise<void> {
    const { users } = await api.listUsers()
    setUsers(users)
  }

  useEffect(() => {
    // A one-shot fetch on mount, same shape as Dashboard.tsx/Audit.tsx -
    // this view is always freshly mounted (Hirkezelo.tsx's conditional
    // render, not a CSS-hidden modal), so there's nothing to cancel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
  }, [])

  function startCreate(): void {
    setForm(emptyForm())
    setEditingId(null)
    setCreating(true)
    setError(null)
  }

  function startEdit(user: ApiUser): void {
    setForm({
      username: user.username ?? '',
      displayName: user.displayName,
      password: '',
      permissions: user.permissions,
    })
    setEditingId(user.id)
    setCreating(false)
    setError(null)
  }

  function cancelForm(): void {
    setCreating(false)
    setEditingId(null)
    setError(null)
  }

  async function submitForm(event: FormEvent): Promise<void> {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (editingId) {
        await api.updateAccount(editingId, form)
      } else {
        await api.createAccount(form)
      }
      await reload()
      cancelForm()
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'save_error'
      setError(ERROR_MESSAGES[code] ?? 'A mentés nem sikerült.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(user: ApiUser): Promise<void> {
    if (!window.confirm(`Biztosan törlöd ezt a fiókot: ${user.displayName}?`)) return
    try {
      await api.deleteAccount(user.id)
      await reload()
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'save_error'
      window.alert(ERROR_MESSAGES[code] ?? 'A törlés nem sikerült.')
    }
  }

  function togglePermission(capability: Capability, checked: boolean): void {
    setForm({
      ...form,
      permissions: checked
        ? [...form.permissions, capability]
        : form.permissions.filter((existing) => existing !== capability),
    })
  }

  const formOpen = creating || editingId !== null

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Fiókok</div>
          <h3>Hírkezelő felhasználók</h3>
          <p>Fiókok létrehozása, módosítása, törlése - és jogosultságonként az, hogy ki mit tehet.</p>
        </div>
        {!formOpen && (
          <button type="button" className="pnw-button" onClick={startCreate}>
            + Új fiók
          </button>
        )}
      </div>

      {formOpen && (
        <form className="pnw-form" onSubmit={submitForm}>
          {error && <div className="pnw-notice pnw-notice-error">{error}</div>}

          <div className="pnw-field">
            <label htmlFor="pnw-account-name">
              Név <span>*</span>
            </label>
            <input
              id="pnw-account-name"
              type="text"
              required
              value={form.displayName}
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            />
          </div>

          <div className="pnw-field">
            <label htmlFor="pnw-account-username">
              Felhasználónév <span>*</span>
            </label>
            <input
              id="pnw-account-username"
              type="text"
              required
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          </div>

          <div className="pnw-field">
            <label htmlFor="pnw-account-password">
              {editingId ? 'Új jelszó' : 'Jelszó'} {!editingId && <span>*</span>}
            </label>
            <input
              id="pnw-account-password"
              type="text"
              required={!editingId}
              placeholder={editingId ? 'Üresen hagyva a jelenlegi jelszó marad' : undefined}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <small>Legalább 8 karakter.</small>
          </div>

          <fieldset className="pnw-field pnw-category-field">
            <legend>Jogosultságok</legend>
            <small>
              Jogosultság nélkül a fiók be tud jelentkezni, de egyetlen felületet sem ér el. Kategóriát és címkét
              minden fiók használhat - külön jog csak újak létrehozásához kell.
            </small>
            <div className="pnw-permission-grid">
              {ALL_CAPABILITIES.map((capability) => (
                <label key={capability}>
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(capability)}
                    onChange={(event) => togglePermission(capability, event.target.checked)}
                  />
                  <span>
                    <strong>{CAPABILITY_LABEL[capability]}</strong>
                    <small>{CAPABILITY_DESCRIPTION[capability]}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="pnw-form-actions">
            <button type="button" className="pnw-button pnw-button-secondary" onClick={cancelForm}>
              Mégse
            </button>
            <button type="submit" className="pnw-button" disabled={busy}>
              {editingId ? 'Mentés' : 'Létrehozás'}
            </button>
          </div>
        </form>
      )}

      <div className="pnw-table-card">
        {!users ? (
          <div className="pnw-empty-inline">Betöltés…</div>
        ) : (
          <div className="pnw-table-wrap">
            <table className="pnw-table">
              <thead>
                <tr>
                  <th>Név</th>
                  <th>Felhasználónév</th>
                  <th>Jogosultságok</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.displayName}</strong>
                      {user.id === currentUserId && <small>(te)</small>}
                    </td>
                    <td>{user.username}</td>
                    <td>
                      {user.permissions.length === 0 ? (
                        <small>Nincs jogosultság</small>
                      ) : (
                        <div className="pnw-permission-chips">
                          {ALL_CAPABILITIES.filter((capability) => user.permissions.includes(capability)).map(
                            (capability) => (
                              <span key={capability} className="pnw-permission-chip">
                                {CAPABILITY_LABEL[capability]}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </td>
                    <td className="pnw-actions">
                      <div className="pnw-row-actions">
                        <button type="button" className="pnw-button pnw-button-small" onClick={() => startEdit(user)}>
                          Szerkesztés
                        </button>
                        <button
                          type="button"
                          className="pnw-button pnw-button-small pnw-button-outline-danger"
                          onClick={() => remove(user)}
                          disabled={user.id === currentUserId}
                          title={user.id === currentUserId ? 'A saját fiókodat nem törölheted' : undefined}
                        >
                          Törlés
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
