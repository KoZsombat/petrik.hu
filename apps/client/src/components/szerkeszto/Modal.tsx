import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * The Szerkesztő's edit dialog (AGENT.md 6.23): a native <dialog> opened with
 * showModal(), so it sits in the browser's top layer above everything (the
 * tree, the sticky boxes, the live preview), traps focus, closes on Escape and
 * is announced as a dialog by screen readers. Used for every node's fields -
 * a module's content however many parts it has, a section/row/column's
 * settings and design - so what is being edited is always fully in view
 * instead of unfolding inside a crowded tree.
 *
 * Edits apply live (the tree's state is the source of truth), so closing is
 * just "Kész"; there is nothing to cancel. Mount it only while open.
 */
export default function Modal({ title, kicker, onClose, children }: { title: string; kicker?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      className="szk-modal"
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // A click on the backdrop lands on the <dialog> itself; the frame fills the rest of it.
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="szk-modal-frame">
        <header className="szk-modal-head">
          <div>
            {kicker && <div className="pnw-kicker">{kicker}</div>}
            <h3>{title}</h3>
          </div>
          <button type="button" className="szk-modal-close" aria-label="Bezárás" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="szk-modal-body">{children}</div>
        <footer className="szk-modal-foot">
          <button type="button" className="pnw-button" onClick={onClose}>
            Kész
          </button>
        </footer>
      </div>
    </dialog>
  )
}
