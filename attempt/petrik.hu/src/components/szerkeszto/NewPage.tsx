import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import { SAVE_ERRORS } from './messages.ts'
import { TEMPLATES } from './templates.ts'
import { Field, TextInput } from './fields.tsx'

/**
 * "Új oldal" (AGENT.md 6.19): a title and a starter template. The page is
 * created as a draft at once, and the editor opens on it - its URL is fixed
 * from the title here and never changes afterwards.
 */
export default function NewPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create(event: FormEvent): Promise<void> {
    event.preventDefault()
    const name = title.trim()
    if (!name) {
      setError(SAVE_ERRORS.missing_title)
      return
    }
    const template = TEMPLATES.find((entry) => entry.id === templateId) ?? TEMPLATES[0]
    setBusy(true)
    setError(null)
    try {
      const { page } = await api.createPage({ title: name, description: '', status: 'draft', document: template.build(name) })
      navigate(`/szerkeszto/?view=page&id=${page.id}`)
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : ''
      setError(SAVE_ERRORS[code] ?? 'Az oldal létrehozása nem sikerült.')
      setBusy(false)
    }
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <h3>Új oldal</h3>
          <p>Az oldal piszkozatként jön létre; a szerkesztőben tudod közzétenni és menübe tenni.</p>
        </div>
        <Link className="pnw-button pnw-button-secondary" to="/szerkeszto/">
          Mégse
        </Link>
      </div>

      {error && <div className="pnw-notice pnw-notice-error">{error}</div>}

      <form className="pnw-form szk-form" onSubmit={create}>
        <Field label="Az oldal címe" htmlFor="szk-new-title" hint="Ebből lesz az oldal címe (pl. „Nyílt nap” → /nyilt-nap/).">
          <TextInput id="szk-new-title" value={title} onChange={setTitle} placeholder="Pl. Nyílt nap 2026" />
        </Field>

        <fieldset className="pnw-field szk-field">
          <legend>Kiinduló sablon</legend>
          <div className="pnw-permission-grid">
            {TEMPLATES.map((template) => (
              <label key={template.id}>
                <input
                  type="radio"
                  name="szk-template"
                  value={template.id}
                  checked={templateId === template.id}
                  onChange={() => setTemplateId(template.id)}
                />
                <span>
                  <strong>{template.name}</strong>
                  <small>{template.description}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="pnw-form-actions">
          <button type="submit" className="pnw-button" disabled={busy}>
            {busy ? 'Létrehozás…' : 'Oldal létrehozása'}
          </button>
        </div>
      </form>
    </section>
  )
}
