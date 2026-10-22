import { useEffect, useRef, useState } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import { staticLibrary } from '../../lib/site/docLibrary.ts'
import { docs as bundledDocs } from '../../data/docs.ts'
import { uniqueSlug } from '../../../../../shared/pnw/slug.ts'
import type { DocLibrary, LibraryCategory, LibraryDoc } from '../../../../../shared/pnw/page-types.ts'
import { SAVE_ERRORS } from './messages.ts'
import { move, remove, replace } from './tree.ts'
import { useUnsavedGuard } from './useUnsavedGuard.ts'

type Notice = { kind: 'success' | 'error'; text: string }

/** `Alapito okirat 2026.pdf` → `Alapito okirat 2026`: a first title for a freshly added file. */
function titleFromFile(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Új dokumentum'
}

function allDocSlugs(library: DocLibrary): Set<string> {
  return new Set(library.categories.flatMap((category) => category.docs.map((doc) => doc.slug)))
}

/**
 * The Dokumentumtár (/dokumentumtar/ and the sidebar of every document): add,
 * remove, rename, reorder and replace its documents, and organise the
 * categories. Saved as one row; the listings read it through
 * useDocCategories() and fall back to src/data/docs.ts when there is none.
 *
 * An entry with a file links straight to that file; an entry without one is a
 * document the site already had, and keeps linking to its own /docs/ page.
 * "Csere" gives such an entry a new file, which then replaces it in every list.
 */
export default function LibraryEditor() {
  const [library, setLibrary] = useState<DocLibrary | null>(null)
  const [customized, setCustomized] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  useUnsavedGuard(dirty)

  useEffect(() => {
    let cancelled = false
    api
      .getLibrary()
      .then(({ library }) => {
        if (cancelled) return
        setLibrary(library ?? staticLibrary())
        setCustomized(library !== null)
      })
      .catch(() => {
        if (!cancelled) setNotice({ kind: 'error', text: 'A Dokumentumtár nem tölthető be.' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  function update(next: DocLibrary): void {
    setLibrary(next)
    setDirty(true)
  }

  function errorText(error: unknown, fallback: string): string {
    const code = error instanceof ApiError ? error.code : ''
    return SAVE_ERRORS[code] ?? fallback
  }

  async function save(): Promise<void> {
    if (!library) return
    setBusy(true)
    setNotice(null)
    try {
      const saved = await api.saveLibrary(library)
      setLibrary(saved.library)
      setCustomized(true)
      setDirty(false)
      setNotice({ kind: 'success', text: 'A Dokumentumtár mentve - az oldal újratöltése után látszik.' })
    } catch (error) {
      setNotice({ kind: 'error', text: errorText(error, 'A mentés nem sikerült.') })
    } finally {
      setBusy(false)
    }
  }

  async function reset(): Promise<void> {
    if (!window.confirm('A Dokumentumtár visszaáll az eredetire: minden hozzáadott, törölt és átnevezett dokumentum elvész. Folytatod?')) return
    setBusy(true)
    try {
      await api.resetLibrary()
      setLibrary(staticLibrary())
      setCustomized(false)
      setDirty(false)
      setNotice({ kind: 'success', text: 'Az eredeti Dokumentumtár visszaállt.' })
    } catch {
      setNotice({ kind: 'error', text: 'A visszaállítás nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  /** Uploads a file; a failure is shown and returns undefined. */
  async function upload(file: File): Promise<string | undefined> {
    setNotice(null)
    try {
      return (await api.uploadLibraryFile(file)).url
    } catch (error) {
      setNotice({ kind: 'error', text: errorText(error, 'A feltöltés nem sikerült.') })
      return undefined
    }
  }

  async function addDocument(categoryIndex: number, file: File): Promise<void> {
    if (!library) return
    setBusy(true)
    const url = await upload(file)
    setBusy(false)
    if (!url) return
    const title = titleFromFile(file.name)
    const entry: LibraryDoc = { slug: uniqueSlug(title, allDocSlugs(library)), title, file: url }
    const category = library.categories[categoryIndex]
    update({ categories: replace(library.categories, categoryIndex, { ...category, docs: [...category.docs, entry] }) })
  }

  function updateCategory(index: number, next: LibraryCategory): void {
    if (library) update({ categories: replace(library.categories, index, next) })
  }

  function moveDocument(from: number, docIndex: number, to: number): void {
    if (!library || from === to) return
    const entry = library.categories[from].docs[docIndex]
    update({
      categories: library.categories.map((category, index) => {
        if (index === from) return { ...category, docs: remove(category.docs, docIndex) }
        if (index === to) return { ...category, docs: [...category.docs, entry] }
        return category
      }),
    })
  }

  function addCategory(): void {
    if (!library) return
    const taken = new Set(library.categories.map((category) => category.slug))
    const title = 'Új kategória'
    update({ categories: [...library.categories, { slug: uniqueSlug(title, taken), title, docs: [] }] })
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <h3>Dokumentumtár</h3>
          <p>
            {customized ? 'A webhely a módosított Dokumentumtárat használja.' : 'A webhely az eredeti Dokumentumtárat használja.'}{' '}
            Új dokumentumot a kategóriájánál a „+ Dokumentum feltöltése” gombbal vehetsz fel.
          </p>
        </div>
      </div>

      {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}

      {!library ? (
        !notice && <p>Betöltés…</p>
      ) : (
        <div className="pnw-form szk-form">
          {library.categories.map((category, categoryIndex) => (
            <div className="szk-node szk-library-category" key={category.slug}>
              <div className="szk-category-head">
                <span className="szk-level szk-level-section">Kategória</span>
                <input
                  type="text"
                  aria-label="A kategória neve"
                  className="szk-menu-label"
                  value={category.title}
                  onChange={(event) => updateCategory(categoryIndex, { ...category, title: event.target.value })}
                />
                <span className="szk-muted szk-count-note">{category.docs.length} dokumentum</span>
                <span className="szk-tools">
                  <button type="button" title="Kategória feljebb" aria-label="Kategória feljebb" onClick={() => update({ categories: move(library.categories, categoryIndex, -1) })}>
                    ↑
                  </button>
                  <button type="button" title="Kategória lejjebb" aria-label="Kategória lejjebb" onClick={() => update({ categories: move(library.categories, categoryIndex, 1) })}>
                    ↓
                  </button>
                  <button
                    type="button"
                    className="szk-danger"
                    title="Kategória törlése"
                    aria-label="Kategória törlése"
                    onClick={() => {
                      if (!category.docs.length || window.confirm(`A(z) „${category.title}” kategória a ${category.docs.length} dokumentumával együtt kikerül a Dokumentumtárból. Folytatod?`)) {
                        update({ categories: remove(library.categories, categoryIndex) })
                      }
                    }}
                  >
                    ✕
                  </button>
                </span>
              </div>

              <div className="szk-library-docs">
                {category.docs.map((doc, docIndex) => (
                  <DocRow
                    key={doc.slug}
                    doc={doc}
                    categories={library.categories}
                    categoryIndex={categoryIndex}
                    busy={busy}
                    onChange={(next) => updateCategory(categoryIndex, { ...category, docs: replace(category.docs, docIndex, next) })}
                    onMove={(step) => updateCategory(categoryIndex, { ...category, docs: move(category.docs, docIndex, step) })}
                    onMoveTo={(to) => moveDocument(categoryIndex, docIndex, to)}
                    onRemove={() => updateCategory(categoryIndex, { ...category, docs: remove(category.docs, docIndex) })}
                    onUpload={upload}
                    onBusy={setBusy}
                  />
                ))}
                <FilePicker
                  className="szk-add"
                  disabled={busy}
                  onFile={(file) => addDocument(categoryIndex, file)}
                >
                  + Dokumentum feltöltése ebbe a kategóriába
                </FilePicker>
              </div>
            </div>
          ))}

          <button type="button" className="szk-add szk-add-wide" onClick={addCategory}>
            + Új kategória
          </button>

          <div className="pnw-form-actions pnw-form-actions-spread szk-sticky-actions">
            <button type="button" className="pnw-button pnw-button-danger" onClick={reset} disabled={busy || !customized}>
              Visszaállítás az eredetire
            </button>
            <button type="button" className="pnw-button" onClick={save} disabled={busy || !dirty}>
              {busy ? 'Egy pillanat…' : dirty ? 'Mentés' : 'Mentve'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function DocRow({
  doc,
  categories,
  categoryIndex,
  busy,
  onChange,
  onMove,
  onMoveTo,
  onRemove,
  onUpload,
  onBusy,
}: {
  doc: LibraryDoc
  categories: LibraryCategory[]
  categoryIndex: number
  busy: boolean
  onChange: (next: LibraryDoc) => void
  onMove: (step: -1 | 1) => void
  onMoveTo: (categoryIndex: number) => void
  onRemove: () => void
  onUpload: (file: File) => Promise<string | undefined>
  onBusy: (busy: boolean) => void
}) {
  const hasOriginalPage = bundledDocs[doc.slug] !== undefined

  async function replaceFile(file: File): Promise<void> {
    onBusy(true)
    const url = await onUpload(file)
    onBusy(false)
    if (url) onChange({ ...doc, file: url })
  }

  return (
    <div className="szk-library-doc">
      <div className="szk-doc-main">
        <input
          type="text"
          aria-label="A dokumentum címe"
          className="szk-menu-label"
          value={doc.title}
          onChange={(event) => onChange({ ...doc, title: event.target.value })}
        />
        <span className="szk-tools">
          <button type="button" title="Dokumentum feljebb" aria-label="Feljebb" onClick={() => onMove(-1)}>
            ↑
          </button>
          <button type="button" title="Dokumentum lejjebb" aria-label="Lejjebb" onClick={() => onMove(1)}>
            ↓
          </button>
          <button
            type="button"
            className="szk-danger"
            title="Dokumentum törlése"
            aria-label="Törlés"
            onClick={() => {
              if (window.confirm(`A(z) „${doc.title}” dokumentum kikerül a Dokumentumtárból. Folytatod?`)) onRemove()
            }}
          >
            ✕
          </button>
        </span>
      </div>
      <div className="szk-doc-meta">
        <div className="szk-doc-group">
          <span className="szk-doc-label">Fájl</span>
          {doc.file ? (
            <a href={doc.file} target="_blank" rel="noreferrer">
              Feltöltött fájl megnyitása ↗
            </a>
          ) : (
            <a href={`/docs/${doc.slug}/`} target="_blank" rel="noreferrer">
              Eredeti oldal megnyitása ↗
            </a>
          )}
          <FilePicker className="szk-library-replace" disabled={busy} onFile={replaceFile}>
            Fájl cseréje
          </FilePicker>
          {doc.file && hasOriginalPage && (
            <button
              type="button"
              className="szk-library-replace"
              onClick={() => {
                const next = { ...doc }
                delete next.file
                onChange(next)
              }}
            >
              Vissza az eredeti oldalra
            </button>
          )}
        </div>
        <label className="szk-doc-group">
          <span className="szk-doc-label">Kategória</span>
          <select
            aria-label="Áthelyezés másik kategóriába"
            value={categoryIndex}
            onChange={(event) => onMoveTo(Number(event.target.value))}
          >
            {categories.map((category, index) => (
              <option key={category.slug} value={index}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

/** A button that opens the file dialog; the input is reset so the same file can be picked twice. */
function FilePicker({
  className,
  disabled,
  onFile,
  children,
}: {
  className: string
  disabled: boolean
  onFile: (file: File) => void
  children: string
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={className} disabled={disabled} onClick={() => input.current?.click()}>
        {children}
      </button>
      <input
        ref={input}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.zip"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </>
  )
}
