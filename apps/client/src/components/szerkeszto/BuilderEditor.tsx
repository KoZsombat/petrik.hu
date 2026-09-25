import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { PageInput } from '../../lib/hirkezelo/api.ts'
import type { BuilderPage } from '../../../../../shared/pnw/page-types.ts'
import PagePreview from './PagePreview.tsx'
import SectionsEditor from './SectionsEditor.tsx'
import { Field, Select, TextInput } from './fields.tsx'
import { useUnsavedGuard } from './useUnsavedGuard.ts'
import { SAVE_ERRORS } from './messages.ts'

function inputOf(page: BuilderPage): PageInput {
  return { title: page.title, description: page.description, status: page.status, document: page.document }
}

/**
 * A page created in the Szerkesztő (AGENT.md 6.19): title, description,
 * status and the whole section tree, with a live preview under the editor.
 * Deleting really deletes - the row, the route and its menu entries.
 */
export default function BuilderEditor({ id }: { id: string }) {
  const navigate = useNavigate()
  const [page, setPage] = useState<BuilderPage | null>(null)
  const [draft, setDraft] = useState<PageInput | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState(true)

  useUnsavedGuard(dirty)

  useEffect(() => {
    let cancelled = false
    api
      .getPage(id)
      .then(({ page }) => {
        if (cancelled) return
        setPage(page)
        setDraft(inputOf(page))
      })
      .catch(() => {
        if (!cancelled) setNotice({ kind: 'error', text: 'Az oldal nem található.' })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function update(patch: Partial<PageInput>): void {
    setDraft((current) => (current ? { ...current, ...patch } : current))
    setDirty(true)
  }

  async function save(): Promise<void> {
    if (!draft) return
    setBusy(true)
    setNotice(null)
    try {
      const { page } = await api.updatePage(id, draft)
      setPage(page)
      setDirty(false)
      setNotice({ kind: 'success', text: page.status === 'publish' ? 'Mentve - az oldal kint van.' : 'Mentve piszkozatként.' })
    } catch (error) {
      const code = error instanceof ApiError ? error.code : ''
      setNotice({ kind: 'error', text: SAVE_ERRORS[code] ?? 'A mentés nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  async function destroy(): Promise<void> {
    if (!page) return
    if (!window.confirm(`Biztosan törlöd a(z) „${page.title}” oldalt? A /${page.slug}/ cím ezután nem létezik, és a menüből is kikerül.`)) {
      return
    }
    setBusy(true)
    try {
      await api.deletePage(page.id)
      setDirty(false)
      navigate('/szerkeszto/?notice=deleted')
    } catch {
      setNotice({ kind: 'error', text: 'A törlés nem sikerült.' })
      setBusy(false)
    }
  }

  if (!page || !draft) {
    return (
      <section className="pnw-section">
        {notice ? <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div> : 'Betöltés…'}
      </section>
    )
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Új oldal</div>
          <h3>{draft.title || 'Névtelen oldal'}</h3>
          <p>
            Címe: <code>/{page.slug}/</code>
            {page.status === 'publish' && (
              <>
                {' · '}
                <a href={`/${page.slug}/`} target="_blank" rel="noreferrer">
                  Megtekintés új lapon
                </a>
              </>
            )}
          </p>
        </div>
        <Link className="pnw-button pnw-button-secondary" to="/szerkeszto/">
          ← Az oldalak listája
        </Link>
      </div>

      {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}

      <div className="pnw-form szk-form">
        <div className="szk-inline-fields">
          <Field label="Az oldal címe" htmlFor="szk-page-title" hint="A böngészőfülön és a keresőkben ez látszik.">
            <TextInput id="szk-page-title" value={draft.title} onChange={(title) => update({ title })} />
          </Field>
          <Field label="Állapot" htmlFor="szk-page-status">
            <Select
              id="szk-page-status"
              value={draft.status}
              options={[
                ['draft', 'Piszkozat (nem látható)'],
                ['publish', 'Közzétéve'],
              ]}
              onChange={(status) => update({ status })}
            />
          </Field>
        </div>
        <Field label="Rövid leírás (meta description)" htmlFor="szk-page-description">
          <TextInput
            id="szk-page-description"
            value={draft.description}
            onChange={(description) => update({ description })}
          />
        </Field>

        <h4 className="szk-subheading">Tartalom</h4>
        <SectionsEditor sections={draft.document.sections} onChange={(sections) => update({ document: { sections } })} />

        <div className="pnw-form-actions pnw-form-actions-spread szk-sticky-actions">
          <button type="button" className="pnw-button pnw-button-danger" onClick={destroy} disabled={busy}>
            Oldal törlése
          </button>
          <div className="pnw-form-actions-main">
            <label className="szk-check">
              <input type="checkbox" checked={preview} onChange={(event) => setPreview(event.target.checked)} />
              Élő előnézet
            </label>
            <button type="button" className="pnw-button" onClick={save} disabled={busy || !dirty}>
              {busy ? 'Mentés…' : dirty ? 'Mentés' : 'Mentve'}
            </button>
          </div>
        </div>
      </div>

      {preview && <PagePreview document={draft.document} slug={page.slug} />}
    </section>
  )
}
