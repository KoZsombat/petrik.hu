import type { RichTextDocument } from '../../../shared/pnw/types.ts'
import PostTemplatePreview from './PostTemplatePreview.tsx'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  content: RichTextDocument
  categoryIds: string[]
  image?: string
}

/**
 * Ported from PNW_Frontend_Editor_Trait::render_preview_modal(), now actually
 * live - and, on request, showing the real single-post template
 * (PostTemplatePreview) rather than an invented preview card. The real
 * template has no excerpt display at all (that's an archive/listing-card
 * thing, not a single-post thing - see src/pages/KutatokEjszakaja.tsx), so
 * unlike the plugin's own quick-preview, this one doesn't show it either.
 */
export default function PreviewModal({ open, onClose, title, content, categoryIds, image }: Props) {
  return (
    <div
      className={`pnw-preview-modal${open ? ' pnw-preview-open' : ''}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pnw-preview-title"
    >
      <div className="pnw-preview-backdrop" onClick={onClose} />
      <div className="pnw-preview-dialog">
        <div className="pnw-preview-toolbar">
          <div>
            <div className="pnw-kicker">Gyors előnézet</div>
            <strong id="pnw-preview-title">Így fog kinézni a hír a valódi sablonban</strong>
          </div>
          <button type="button" className="pnw-preview-close" onClick={onClose} aria-label="Előnézet bezárása">
            ×
          </button>
        </div>
        <div className="pnw-preview-hint">
          Ugyanaz a fejléc/kétoszlopos elrendezés, amit egy publikált hír használ (lásd a Kutatók éjszakája mintahírt) -
          csak a végleges kép/videó-beágyazások és a Divi-specifikus modulok nem részei ennek az egyszerű szerkesztőnek.
        </div>
        <div className="pnw-preview-body">
          {/* Mounted only while actually open: PostTemplatePreview applies
              real site-wide body classes (single, et_right_sidebar) via
              useBodyClass for the two-column frame, and those must not leak
              onto the rest of /hirkezelo/ while the modal is closed. */}
          {open && <PostTemplatePreview title={title} content={content} categoryIds={categoryIds} image={image} />}
        </div>
      </div>
    </div>
  )
}
