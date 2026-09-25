import { createContext } from 'react'

/**
 * Where PagePreview.tsx portals its page (AGENT.md 6.19): an element
 * Szerkeszto.tsx renders *after* its `.pnw-app` frame, so the preview gets the
 * real page's full width and none of the frame's `.pnw-app *` rules.
 */
export const PreviewSlotContext = createContext<HTMLElement | null>(null)
