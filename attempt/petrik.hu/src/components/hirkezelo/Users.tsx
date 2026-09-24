import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { AccountInput, ApiUser } from '../../lib/hirkezelo/api.ts'
import { ROLE } from '../../../shared/pnw/types.ts'
import type { Role } from '../../../shared/pnw/types.ts'
import { ALL_ROLES, roleLabel } from '../../../shared/pnw/roles.ts'
import { categories } from '../../../shared/pnw/categories.ts'

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'A felhasználónév és a név kötelező.',
  invalid_role: 'Érvénytelen szerepkör.',
  password_too_short: 'A jelszó legalább 8 karakter legyen.',
  username_taken: 'Ez a felhasználónév már foglalt.',
  cannot_delete_self: 'A saját fiókodat nem törölheted.',
  last_manager: 'Ez az utolsó fiók, ami fiókokat kezelhet - előbb tégy jogot valaki másnak.',
  not_found: 'A fiók már nem létezik.',
}

function emptyForm(): AccountInput {
  return { username: '', displayName: '', role: ROLE.MK_LEADER, password: '', allowedCategoryIds: [] }
}

/**
 * Account management - no equivalent in the real plugin (wp-admin's own user
 * screen does this there). Added by user request; both deputy and director
 * get here (pnw_manage_users, shared/pnw/roles.ts). See AGENT.md 6.15.
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
      role: user.role,
      password: '',
      allowedCategoryIds: user.allowedCategoryIds ?? [],
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
      const input: AccountInput = {
        ...form,
        allowedCategoryIds: form.role === ROLE.MK_LEADER ? form.allowedCategoryIds : undefined,
      }
      if (editingId) {
        await api.updateAccount(editingId, input)
      } else {
        await api.createAccount(input)
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

  function toggleCategory(id: string, checked: boolean): void {
    const current = form.allowedCategoryIds ?? []
    setForm({
      ...form,
      allowedCategoryIds: checked ? [...current, id] : current.filter((existing) => existing !== id),
    })
  }

  const formOpen = creating || editingId !== null

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Fiókok</div>
          <h3>Hírkezelő felhasználók</h3>
          <p>Munkaközösség-vezetői, igazgatóhelyettesi és igazgatói fiókok létrehozása, módosítása, törlése.</p>
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

          <div className="pnw-field">
            <label htmlFor="pnw-account-role">
              Szerepkör <span>*</span>
            </label>
            <select
              id="pnw-account-role"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
            >
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>

          {form.role === ROLE.MK_LEADER && (
            <fieldset className="pnw-field pnw-category-field">
              <legend>Engedélyezett hírkategóriák</legend>
              <small>Ha egyet sem jelölsz be, minden kategória engedélyezett lesz.</small>
              <div className="pnw-category-grid">
                {categories.map((category) => (
                  <label key={category.id}>
                    <input
                      type="checkbox"
                      checked={(form.allowedCategoryIds ?? []).includes(category.id)}
                      onChange={(event) => toggleCategory(category.id, event.target.checked)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

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
                  <th>Szerepkör</th>
                  <th>Kategóriák</th>
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
                    <td>{roleLabel(user.role)}</td>
                    <td>
                      {user.role === ROLE.MK_LEADER
                        ? (user.allowedCategoryIds?.length ?? 0) > 0
                          ? user.allowedCategoryIds!.length
                          : 'minden'
                        : '—'}
                    </td>
                    <td className="pnw-actions">
                      <button type="button" className="pnw-button pnw-button-small" onClick={() => startEdit(user)}>
                        Szerkesztés
                      </button>{' '}
                      <button
                        type="button"
                        className="pnw-link-danger"
                        onClick={() => remove(user)}
                        disabled={user.id === currentUserId}
                      >
                        Törlés
                      </button>
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
