import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { PageInput } from '../../lib/hirkezelo/api.ts'
import { heads } from '../../data/head.ts'
import { pageDefaults } from '../../data/pages/index.ts'
import { mirroredTitle } from '../../lib/headTitle.ts'
import { normalizeDocument } from '../../../../../shared/pnw/page-doc.ts'
import type { PageDocument, StoredPage } from '../../../../../shared/pnw/page-types.ts'
import type { RichContent } from '../../../../../shared/pnw/rich-content.ts'
import PagePreview from './PagePreview.tsx'
import RichTextField from './RichTextField.tsx'
import SectionsEditor from './SectionsEditor.tsx'
import { Field, Select, TextInput } from './fields.tsx'
import { useUnsavedGuard } from './useUnsavedGuard.ts'
import { SAVE_ERRORS } from './messages.ts'

type Target = { id: string; route?: undefined } | { route: string; id?: undefined }

/** A copy of the bundled default, so editing it never touches the shared object the public pages render from. */
function defaultDraft(route: string): PageInput | null {
  const entry = pageDefaults[route]
  if (!entry) return null
  return {
    title: mirroredTitle(route),
    description: heads[route]?.description ?? '',
    status: 'publish',
    document: normalizeDocument(structuredClone(entry.document)),
  }
}

function inputOf(page: StoredPage): PageInput {
  return { title: page.title, description: page.description, status: page.status, document: page.document as PageDocument }
}

/** Typing makes a change per keystroke; edits closer together than this are one undo step. */
const COALESCE_MS = 700
const HISTORY_LIMIT = 100

/**
 * The one editor every page opens in (AGENT.md 6.20, laid out like WordPress's
 * editor in 6.22): a page created in the Szerkesztő (`id`) and a mirrored page
 * (`route`) are both a PageDocument, edited as a tree down to layout and
 * design. The big title and the content are on the left; on the right the
 * *Közzététel* box (status, save, view, undo/redo, live preview), the *Oldal*
 * box (address, description) and the trash. Ctrl/Cmd+S saves, Ctrl/Cmd+Z and
 * Ctrl/Cmd+Shift+Z undo and redo the whole page, and leaving with unsaved
 * changes asks first.
 *
 * A mirrored page nobody edited starts from a copy of its bundled default;
 * the first save stores the whole document and from then on it replaces the
 * default. "Visszaállítás az eredetire" drops that edit again; "Kukába" makes
 * the route a 404 (and takes it out of the menu) until it is restored.
 */
export default function PageEditor(target: Target) {
  const navigate = useNavigate()
  const [stored, setStored] = useState<StoredPage | null | undefined>(undefined)
  const [draft, setDraft] = useState<PageInput | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState(true)
  const [missing, setMissing] = useState(false)

  const past = useRef<PageInput[]>([])
  const future = useRef<PageInput[]>([])
  const lastEdit = useRef(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const syncHistory = () => {
    setCanUndo(past.current.length > 0)
    setCanRedo(future.current.length > 0)
  }

  useUnsavedGuard(dirty)

  const { route: routeProp, id: idProp } = target
  const mirrored = routeProp !== undefined

  useEffect(() => {
    let cancelled = false
    const load: Promise<StoredPage | null> = routeProp
      ? api.getPageByRoute(routeProp).then(({ page }) => page)
      : api.getPage(idProp!).then(({ page }) => page)

    load
      .then((page) => {
        if (cancelled) return
        // A mirrored tombstone has no document; the default stands in for the (hidden) form.
        const base = page && page.document ? inputOf(page) : routeProp ? defaultDraft(routeProp) : null
        if (!base) {
          setMissing(true)
          return
        }
        setStored(page)
        setDraft(base)
      })
      .catch(() => {
        if (!cancelled) setMissing(true)
      })
    return () => {
      cancelled = true
    }
  }, [routeProp, idProp])

  function update(patch: Partial<PageInput>): void {
    setDraft((current) => {
      if (!current) return current
      const at = Date.now()
      if (at - lastEdit.current > COALESCE_MS || past.current.length === 0) {
        past.current = [...past.current.slice(-HISTORY_LIMIT), current]
      }
      lastEdit.current = at
      future.current = []
      return { ...current, ...patch }
    })
    setDirty(true)
    syncHistory()
  }

  const undo = useCallback(() => {
    const previous = past.current[past.current.length - 1]
    if (!previous) return
    past.current = past.current.slice(0, -1)
    setDraft((current) => {
      if (current) future.current = [...future.current, current]
      return previous
    })
    lastEdit.current = 0
    setDirty(true)
    syncHistory()
  }, [])

  const redo = useCallback(() => {
    const next = future.current[future.current.length - 1]
    if (!next) return
    future.current = future.current.slice(0, -1)
    setDraft((current) => {
      if (current) past.current = [...past.current, current]
      return next
    })
    lastEdit.current = 0
    setDirty(true)
    syncHistory()
  }, [])

  function failure(error: unknown, fallback: string): void {
    const code = error instanceof ApiError ? error.code : ''
    setNotice({ kind: 'error', text: SAVE_ERRORS[code] ?? fallback })
  }

  async function save(): Promise<void> {
    if (!draft || busy) return
    setBusy(true)
    setNotice(null)
    try {
      const { page } = mirrored ? await api.savePageByRoute(routeProp!, draft) : await api.updatePage(idProp!, draft)
      setStored(page)
      setDirty(false)
      setNotice({
        kind: 'success',
        text: page.status === 'publish' ? 'Mentve - az oldal kint van.' : mirrored ? 'Mentve piszkozatként - az oldalon még az eredeti látszik.' : 'Mentve piszkozatként.',
      })
    } catch (error) {
      failure(error, 'A mentés nem sikerült.')
    } finally {
      setBusy(false)
    }
  }

  // Keyboard: Ctrl/Cmd+S saves anywhere; Ctrl/Cmd+Z / +Shift+Z (and Ctrl+Y) undo and redo the page unless a text
  // field has focus, where the browser's own undo of that field is what is wanted.
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (!(event.metaKey || event.ctrlKey)) return
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        void saveRef.current()
        return
      }
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
      if (typing) return
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  /** Kukába: a mirrored page becomes a tombstone, a created one keeps its document. */
  async function toTrash(): Promise<void> {
    if (!draft) return
    const message = mirrored
      ? `Biztosan a kukába teszed a(z) „${draft.title}” oldalt? A ${routeProp} cím 404-es hibát ad és a menüből is kikerül, amíg vissza nem állítod.`
      : `Biztosan a kukába teszed a(z) „${draft.title}” oldalt? A cím 404-es hibát ad és a menüből is kikerül, amíg vissza nem állítod.`
    if (!window.confirm(message)) return
    setBusy(true)
    try {
      if (mirrored) await api.deletePageByRoute(routeProp!)
      else await api.deletePage(idProp!)
      setDirty(false)
      navigate('/szerkeszto/?notice=trashed')
    } catch {
      setNotice({ kind: 'error', text: 'A művelet nem sikerült.' })
      setBusy(false)
    }
  }

  async function reset(): Promise<void> {
    if (!mirrored) return
    if (!window.confirm('Az oldal minden módosítása elvész, és újra az eredeti jelenik meg. Folytatod?')) return
    setBusy(true)
    try {
      await api.resetPageByRoute(routeProp!)
      setDirty(false)
      past.current = []
      future.current = []
      syncHistory()
      setStored(null)
      setDraft(defaultDraft(routeProp!))
      setNotice({ kind: 'success', text: 'Az oldal újra az eredeti.' })
    } catch {
      setNotice({ kind: 'error', text: 'A visszaállítás nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  async function restoreFromTrash(): Promise<void> {
    setBusy(true)
    try {
      if (mirrored) {
        await api.resetPageByRoute(routeProp!)
        setStored(null)
        setDraft(defaultDraft(routeProp!))
        setNotice({ kind: 'success', text: 'Az oldal újra az eredeti.' })
      } else {
        const { page } = await api.restorePage(idProp!)
        setStored(page)
        setDraft(inputOf(page))
        setNotice({ kind: 'success', text: 'Visszaállítva piszkozatként.' })
      }
    } catch {
      setNotice({ kind: 'error', text: 'A visszaállítás nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  async function purge(): Promise<void> {
    if (!window.confirm('Véglegesen törlöd az oldalt? Ez nem vonható vissza.')) return
    setBusy(true)
    try {
      await api.deletePage(idProp!)
      navigate('/szerkeszto/?notice=purged')
    } catch {
      setNotice({ kind: 'error', text: 'A törlés nem sikerült.' })
      setBusy(false)
    }
  }

  if (missing) {
    return (
      <section className="pnw-section">
        <div className="pnw-notice pnw-notice-error">Az oldal nem található.</div>
      </section>
    )
  }

  if (stored === undefined || !draft) {
    return <section className="pnw-section">{notice ? <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div> : 'Betöltés…'}</section>
  }

  const route = routeProp ?? stored?.route ?? ''

  // In the trash: nothing to edit, a way back (and, for a created page, a way out for good).
  if (stored?.deleted) {
    return (
      <section className="pnw-section">
        <div className="pnw-section-heading">
          <div>
            <div className="pnw-kicker">Kukában</div>
            <h3>{draft.title || mirroredTitle(route)}</h3>
            <p>
              A <code>{route}</code> cím jelenleg 404-es hibát ad. {mirrored ? 'A visszaállítás az eredeti oldalt hozza vissza.' : 'A visszaállítás piszkozatként hozza vissza.'}
            </p>
          </div>
          <Link className="pnw-button pnw-button-secondary" to="/szerkeszto/">
            ← Az oldalak listája
          </Link>
        </div>
        {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}
        <div className="szk-row-actions">
          <button type="button" className="pnw-button" onClick={restoreFromTrash} disabled={busy}>
            Visszaállítás
          </button>
          {!mirrored && (
            <button type="button" className="pnw-button pnw-button-danger" onClick={purge} disabled={busy}>
              Végleges törlés
            </button>
          )}
        </div>
      </section>
    )
  }

  const doc = draft.document
  const template = doc.template ?? 'builder'
  const unedited = mirrored && !stored

  return (
    <section className="pnw-section szk-editor">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">{mirrored ? (unedited ? 'Eredeti oldal' : 'Szerkesztett oldal') : 'Oldal'}</div>
          <h3>Oldal szerkesztése</h3>
        </div>
        <Link className="pnw-button pnw-button-secondary" to="/szerkeszto/">
          ← Az oldalak listája
        </Link>
      </div>

      {unedited && !dirty && (
        <div className="pnw-notice pnw-notice-success">
          Ez az oldal még az eredeti. Az első mentés után a megjelenése már a te szerkesztésedtől függ.
        </div>
      )}
      {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}

      <div className="szk-editor-grid">
        <div className="szk-editor-main pnw-form szk-form">
          <input
            id="szk-page-title"
            className="szk-title-input"
            type="text"
            aria-label="Az oldal címe"
            placeholder="Az oldal címe"
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
          />

          {template === 'classic' ? (
            <>
              <Field label="Főcím" htmlFor="szk-classic-heading">
                <TextInput id="szk-classic-heading" value={doc.heading ?? ''} onChange={(heading) => update({ document: { ...doc, heading } })} />
              </Field>
              <RichTextField
                id="szk-classic-content"
                value={doc.content ?? []}
                onChange={(content: RichContent) => update({ document: { ...doc, content } })}
              />
            </>
          ) : (
            <>
              {template === 'post' && doc.post && (
                <Field label="Dátum a cikk fejlécében" htmlFor="szk-post-date" hint="A cím és a kategóriák a Hírkezelő hírének adatai.">
                  <TextInput
                    id="szk-post-date"
                    value={doc.post.date}
                    onChange={(date) => update({ document: { ...doc, post: { ...doc.post!, date } } })}
                  />
                </Field>
              )}
              {doc.protected && <p className="szk-muted">Ez a dokumentum az eredeti oldalon jelszóval védett volt; a helyén egy tájékoztató szöveg áll.</p>}
              <SectionsEditor document={doc} onChange={(next) => update({ document: next })} />
            </>
          )}
        </div>

        <aside className="szk-editor-side" aria-label="Oldal beállításai">
          <div className="szk-box">
            <h4>Közzététel</h4>
            <div className="szk-box-body">
              <Field label="Állapot" htmlFor="szk-page-status">
                <Select
                  id="szk-page-status"
                  value={draft.status}
                  options={[
                    ['draft', mirrored ? 'Piszkozat (az eredeti látszik)' : 'Piszkozat (nem látható)'],
                    ['publish', 'Közzétéve'],
                  ]}
                  onChange={(status) => update({ status })}
                />
              </Field>
              <p className="szk-save-state" aria-live="polite">
                {dirty ? 'Nem mentett változások' : stored ? `Mentve: ${new Date(stored.modifiedAt).toLocaleString('hu-HU')}` : 'Még nem módosítva'}
              </p>
              <div className="szk-undo-redo">
                <button type="button" className="pnw-button pnw-button-secondary pnw-button-small" disabled={!canUndo} onClick={undo} title="Visszavonás (Ctrl+Z)">
                  ↶ Vissza
                </button>
                <button type="button" className="pnw-button pnw-button-secondary pnw-button-small" disabled={!canRedo} onClick={redo} title="Ismétlés (Ctrl+Shift+Z)">
                  ↷ Újra
                </button>
              </div>
              <label className="szk-check">
                <input type="checkbox" checked={preview} onChange={(event) => setPreview(event.target.checked)} />
                Élő előnézet
              </label>
            </div>
            <div className="szk-box-footer">
              <a className="szk-link" href={route} target="_blank" rel="noreferrer">
                Megtekintés
              </a>
              <button type="button" className="pnw-button" onClick={save} disabled={busy || !dirty} title="Mentés (Ctrl+S)">
                {busy ? 'Mentés…' : !dirty ? 'Mentve' : stored ? 'Frissítés' : 'Mentés'}
              </button>
            </div>
          </div>

          <div className="szk-box">
            <h4>Oldal</h4>
            <div className="szk-box-body">
              <Field label="Cím a webhelyen" hint="Ezen a címen érhető el - nem változtatható.">
                <code className="szk-permalink">{route}</code>
              </Field>
              <Field label="Rövid leírás (meta description)" htmlFor="szk-page-description" hint="A keresők ezt mutatják.">
                <textarea
                  id="szk-page-description"
                  className="szk-textarea"
                  rows={4}
                  value={draft.description}
                  onChange={(event) => update({ description: event.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="szk-box szk-box-danger">
            <div className="szk-box-body">
              {mirrored && stored && (
                <button type="button" className="szk-link" onClick={reset} disabled={busy}>
                  Visszaállítás az eredetire
                </button>
              )}
              <button type="button" className="szk-link szk-danger-link" onClick={toTrash} disabled={busy}>
                Kukába helyezés
              </button>
            </div>
          </div>
        </aside>
      </div>

      {preview && <PagePreview document={doc} route={route} className={mirrored ? undefined : `page-${stored?.slug ?? ''}`} />}
    </section>
  )
}
