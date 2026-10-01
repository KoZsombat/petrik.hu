import { useEffect, useState } from 'react'
import type { ImagePosition, RichTextDocument, Term, TermKind } from '../../../../../shared/pnw/types.ts'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import { termsOfKind, useTerms } from '../../lib/terms.ts'
import { emptyDocument, isBlank } from '../../../../../shared/pnw/richtext.ts'
import { NEWS_TEMPLATES } from '../../../../../shared/pnw/news-templates.ts'
import RichTextEditor from './RichTextEditor.tsx'

type Props = {
  editorId: string
  title: string
  onTitleChange: (value: string) => void
  content: RichTextDocument
  onContentChange: (value: RichTextDocument) => void
  excerpt: string
  onExcerptChange: (value: string) => void
  categoryIds: string[]
  onCategoryIdsChange: (value: string[]) => void
  tagIds: string[]
  onTagIdsChange: (value: string[]) => void
  /** `pnw_manage_terms` - shows the "new category/tag" row (AGENT.md 6.16). */
  canCreateTerms: boolean
  currentImage?: string
  onImageChange: (file: File | null) => void
  imagePosition: ImagePosition
  onImagePositionChange: (value: ImagePosition) => void
  /** Offers the news templates (Hírsablonok) above the title - for authors writing a new post. */
  templates?: boolean
}

const TERM_ERROR_MESSAGES: Record<string, string> = {
  term_exists: 'Ilyen nevű már van.',
  invalid_term_name: 'Adj meg egy nevet (legfeljebb 60 karakter).',
  invalid_term_kind: 'Ismeretlen típus.',
  forbidden: 'Nincs jogosultságod újat létrehozni.',
}

/**
 * Ported from PNW_Frontend_Editor_Trait::render_common_fields(). Two things
 * differ from the original by user request (AGENT.md 6.16): the category
 * list is never filtered per account - everyone sees every category - and
 * there is a tag list next to it, with the same rules.
 */
export default function PostFields({
  editorId,
  title,
  onTitleChange,
  content,
  onContentChange,
  excerpt,
  onExcerptChange,
  categoryIds,
  onCategoryIdsChange,
  tagIds,
  onTagIdsChange,
  canCreateTerms,
  currentImage,
  onImageChange,
  imagePosition,
  onImagePositionChange,
  templates = false,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState('')
  // Bumped to remount the (uncontrolled) file input when the form is cleared.
  const [fileKey, setFileKey] = useState(0)
  const terms = useTerms()

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  function handleFile(file: File | null): void {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(file ? URL.createObjectURL(file) : null)
    onImageChange(file)
  }

  const shownImage = preview ?? currentImage
  const template = NEWS_TEMPLATES.find((entry) => entry.id === templateId)

  /** Ported from the plugin's installTemplates(): asks before replacing text, offers the title prefix. */
  function applyTemplate(): void {
    if (!template) return
    if (
      (title.trim() || !isBlank(content)) &&
      !window.confirm('A sablon a jelenlegi cím/szöveg egy részét lecserélheti. Biztosan alkalmazod?')
    ) {
      return
    }
    if (template.title && (!title.trim() || window.confirm('A sablonhoz tartozó címkezdetet is beírjuk?'))) {
      onTitleChange(template.title)
    }
    onContentChange(template.build())
  }

  /** Empties the whole form so a new post can start from nothing (the plugin's "reset draft"). */
  function clearForm(): void {
    if (!window.confirm('Biztosan kitörlöd a cím, a szöveg, a kivonat, a kategóriák, a címkék és a kép tartalmát?')) return
    onTitleChange('')
    onContentChange(emptyDocument())
    onExcerptChange('')
    onCategoryIdsChange([])
    onTagIdsChange([])
    onImagePositionChange('top')
    setTemplateId('')
    handleFile(null)
    setFileKey((key) => key + 1)
  }

  return (
    <>
      {templates && (
        <div className="pnw-template-panel">
          <div className="pnw-template-copy">
            <strong>Hírsablonok</strong>
            <span>Válassz egy típust, és előkészítjük a hír szerkezetét.</span>
          </div>
          <div className="pnw-template-controls">
            <select
              aria-label="Hírsablon kiválasztása"
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
            >
              <option value="">— Válassz sablont —</option>
              {NEWS_TEMPLATES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            <button type="button" className="pnw-button pnw-button-secondary" disabled={!template} onClick={applyTemplate}>
              Sablon alkalmazása
            </button>
          </div>
          <small>{template?.description ?? 'Nem kötelező sablont használni.'}</small>
        </div>
      )}
      {templates && (
        <div className="pnw-clear-bar">
          <button type="button" className="pnw-button pnw-button-danger pnw-button-small" onClick={clearForm}>
            ✕ Űrlap ürítése
          </button>
          <small>Mindent töröl, hogy tiszta lappal indulhass.</small>
        </div>
      )}

      <div className="pnw-field">
        <label htmlFor="pnw-title">
          Cím <span>*</span>
        </label>
        <input
          id="pnw-title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="A hír címe"
        />
      </div>

      <div className="pnw-field pnw-editor-field">
        <div className="pnw-field-heading">
          <label htmlFor={editorId}>
            Hír szövege <span>*</span>
          </label>
          <small>Bekezdésenkénti szerkesztő - lásd a fenti eszköztárat.</small>
        </div>
        <RichTextEditor id={editorId} value={content} onChange={onContentChange} />
      </div>

      <div className="pnw-field">
        <label htmlFor="pnw-excerpt">Rövid kivonat</label>
        <textarea
          id="pnw-excerpt"
          rows={3}
          maxLength={500}
          value={excerpt}
          onChange={(event) => onExcerptChange(event.target.value)}
          placeholder="Opcionális rövid összefoglaló"
        />
        <small>Ha a sablon használ kivonatot, ez jelenhet meg a hírlistában.</small>
      </div>

      <TermPicker
        kind="category"
        legend="Kategória"
        required
        emptyText="Még nincs egyetlen kategória sem."
        terms={terms}
        selectedIds={categoryIds}
        onChange={onCategoryIdsChange}
        canCreateTerms={canCreateTerms}
      />

      <TermPicker
        kind="tag"
        legend="Címkék"
        emptyText="Még nincs egyetlen címke sem - hozz létre egyet, ha van rá jogosultságod."
        terms={terms}
        selectedIds={tagIds}
        onChange={onTagIdsChange}
        canCreateTerms={canCreateTerms}
      />

      <div className="pnw-field pnw-image-field">
        <label htmlFor="pnw-featured">Kiemelt kép</label>
        <div className="pnw-image-live">
          {shownImage ? (
            <>
              <img src={shownImage} alt="Kiemelt kép előnézete" />
              <div className="pnw-image-live-meta">
                <strong>Kiemelt kép</strong>
                <span>Új fájl kiválasztásakor itt azonnal látod a cserét.</span>
              </div>
            </>
          ) : (
            <div className="pnw-image-placeholder">
              <strong>Nincs még kiemelt kép</strong>
              <span>A kiválasztott kép előnézete itt jelenik meg.</span>
            </div>
          )}
        </div>
        <input
          key={fileKey}
          id="pnw-featured"
          className="pnw-featured-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
        <small>JPG, PNG, WebP vagy GIF. Új kép feltöltésével a jelenlegi kiemelt kép lecserélődik.</small>
        <fieldset className="pnw-image-position">
          <legend>A kép helye a hírben</legend>
          <label>
            <input
              type="radio"
              name="pnw-image-position"
              checked={imagePosition === 'top'}
              onChange={() => onImagePositionChange('top')}
            />
            <span>A szöveg felett</span>
          </label>
          <label>
            <input
              type="radio"
              name="pnw-image-position"
              checked={imagePosition === 'bottom'}
              onChange={() => onImagePositionChange('bottom')}
            />
            <span>A szöveg alatt</span>
          </label>
        </fieldset>
      </div>
    </>
  )
}

type PickerProps = {
  kind: TermKind
  legend: string
  required?: boolean
  emptyText: string
  terms: Term[]
  selectedIds: string[]
  onChange: (value: string[]) => void
  canCreateTerms: boolean
}

/**
 * One checkbox list of categories or tags. Every term is offered to every
 * account - the old per-account allow-list is gone (AGENT.md 6.16) - and the
 * "új" row below it appears only with `pnw_manage_terms`. A term created
 * here is ticked straight away, so creating and using it is one motion.
 */
function TermPicker({ kind, legend, required, emptyText, terms, selectedIds, onChange, canCreateTerms }: PickerProps) {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const visible = termsOfKind(terms, kind)

  function toggle(id: string, checked: boolean): void {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((existing) => existing !== id))
  }

  async function create(): Promise<void> {
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    setError(null)
    try {
      const term = await api.createTerm(kind, name)
      onChange([...selectedIds, term.id])
      setNewName('')
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'save_error'
      setError(TERM_ERROR_MESSAGES[code] ?? 'A létrehozás nem sikerült.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <fieldset className="pnw-field pnw-category-field">
      <legend>
        {legend} {required && <span>*</span>}
      </legend>
      {visible.length === 0 ? (
        <div className="pnw-empty-inline">{emptyText}</div>
      ) : (
        <div className="pnw-category-grid">
          {visible.map((term) => (
            <label key={term.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(term.id)}
                onChange={(event) => toggle(term.id, event.target.checked)}
              />
              <span>{term.name}</span>
            </label>
          ))}
        </div>
      )}

      {canCreateTerms && (
        <div className="pnw-term-add">
          <input
            type="text"
            maxLength={60}
            value={newName}
            placeholder={kind === 'category' ? 'Új kategória neve' : 'Új címke neve'}
            aria-label={kind === 'category' ? 'Új kategória neve' : 'Új címke neve'}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              // The picker sits inside the editor's own <form>-less layout,
              // but Enter still submits in the Users-style forms - keep it a
              // create, never a save.
              event.preventDefault()
              create()
            }}
          />
          <button
            type="button"
            className="pnw-button pnw-button-secondary pnw-button-small"
            disabled={busy || newName.trim() === ''}
            onClick={create}
          >
            + Létrehozás
          </button>
        </div>
      )}
      {error && <small className="pnw-term-error">{error}</small>}
    </fieldset>
  )
}
