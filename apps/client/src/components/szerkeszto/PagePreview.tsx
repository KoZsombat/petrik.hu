import { useContext } from 'react'
import { createPortal } from 'react-dom'
import PageRenderer from '../pagebuilder/PageRenderer.tsx'
import type { PageDocument } from '../../../../../shared/pnw/page-types.ts'
import { PreviewSlotContext } from './previewSlot.ts'

/**
 * The live preview of any page (AGENT.md 6.20): the very PageRenderer the
 * public site uses, re-rendered on every edit - so it shows the page's own
 * design stylesheet and the design settings just set. It is portalled out of
 * the 75% editor frame into a slot below it, so what it shows is the page at
 * the site's real width and with the site's real CSS.
 */
export default function PagePreview({ document, route, className }: { document: PageDocument; route: string; className?: string }) {
  const slot = useContext(PreviewSlotContext)
  if (!slot) return null

  return createPortal(
    <div className="szk-preview">
      <div className="szk-preview-label">Élő előnézet - így jelenik meg az oldal a {route} címen</div>
      <PageRenderer document={document} className={className} />
    </div>,
    slot,
  )
}
