import { useEffect, useState } from 'react'
import type { RichTextDocument } from '../../../shared/pnw/types.ts'
import { categories } from '../../../shared/pnw/categories.ts'
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
  /** Undefined shows every category - matches render_common_fields()'s $all_categories. */
  allowedCategoryIds?: string[]
  currentImage?: string
  onImageChange: (file: File | null) => void
}

/** Ported from PNW_Frontend_Editor_Trait::render_common_fields(). */
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
  allowedCategoryIds,
  currentImage,
  onImageChange,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const visibleCategories = allowedCategoryIds
    ? categories.filter((category) => allowedCategoryIds.includes(category.id))
    : categories

  function toggleCategory(id: string, checked: boolean): void {
    onCategoryIdsChange(checked ? [...categoryIds, id] : categoryIds.filter((existing) => existing !== id))
  }

  function handleFile(file: File | null): void {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(file ? URL.createObjectURL(file) : null)
    onImageChange(file)
  }

  const shownImage = preview ?? currentImage

  return (
    <>
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

      <fieldset className="pnw-field pnw-category-field">
        <legend>
          Kategória <span>*</span>
        </legend>
        <div className="pnw-category-grid">
          {visibleCategories.map((category) => (
            <label key={category.id}>
              <input
                type="checkbox"
                checked={categoryIds.includes(category.id)}
                onChange={(event) => toggleCategory(category.id, event.target.checked)}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

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
          id="pnw-featured"
          className="pnw-featured-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
        <small>JPG, PNG, WebP vagy GIF. Új kép feltöltésével a jelenlegi kiemelt kép lecserélődik.</small>
      </div>
    </>
  )
}
