import { useContext } from 'react'
import { createPortal } from 'react-dom'
import PageRenderer from '../pagebuilder/PageRenderer.tsx'
import type { PageDocument } from '../../../../../shared/pnw/page-types.ts'
import { PreviewSlotContext } from './previewSlot.ts'

/**
 * The live preview of a builder page (AGENT.md 6.19): the very PageRenderer
 * the public /<slug>/ route uses, re-rendered on every edit. It is portalled
 * out of the 75% editor frame into a slot below it, so what it shows is the
 * page at the site's real width and with the site's real CSS.
 */
export default function PagePreview({ document, slug }: { document: PageDocument; slug: string }) {
  const slot = useContext(PreviewSlotContext)
  if (!slot) return null

  return createPortal(
    <div className="szk-preview">
      <div className="szk-preview-label">Élő előnézet - így jelenik meg az oldal a /{slug}/ címen</div>
      <PageRenderer document={document} className={`page-${slug}`} />
    </div>,
    slot,
  )
}
