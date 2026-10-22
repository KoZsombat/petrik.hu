import { createContext, useContext } from 'react'
import { primaryMenu, secondaryMenu } from '../../data/site.ts'
import type { MenuItem } from '../../data/site.ts'
import type { DocLibrary, PublicPage, SiteMenu } from '../../../../../shared/pnw/page-types.ts'

/**
 * What the Szerkesztő changed (AGENT.md 6.20), fetched once per page load by
 * SiteContentProvider.tsx - the same shape of thing postsContext.ts is for
 * live news. Kept apart from the provider component for the same
 * react-refresh reason.
 *
 * Every consumer must treat "nothing here" as the normal case: with no
 * backend, or before anyone edited anything, `pages` is empty and `menu` is
 * null, and every page renders its bundled default document.
 */
export type SiteContentValue = {
  /**
   * Published edits and tombstones, keyed by route (`/nyolcadikos/`, or
   * `/nyilt-nap/` for a page created in the Szerkesztő).
   */
  pages: Record<string, PublicPage>
  menu: SiteMenu | null
  /** The edited Dokumentumtár; null until someone saves one (useDocLibrary falls back to src/data/docs.ts). */
  library: DocLibrary | null
  /** True until the fetch settles - DocumentPage waits for it before deciding a custom route is a 404. */
  loading: boolean
}

export const SiteContentContext = createContext<SiteContentValue>({
  pages: {},
  menu: null,
  library: null,
  loading: false,
})

export function useSiteContent(): SiteContentValue {
  return useContext(SiteContentContext)
}

function withoutRoutes(items: MenuItem[], hidden: Set<string>): MenuItem[] {
  return items
    .filter((item) => !item.to || !hidden.has(item.to))
    .map((item) => (item.children ? { ...item, children: withoutRoutes(item.children, hidden) } : item))
}

/**
 * The menus the header and the top bar render: the edited tree when there is
 * one, otherwise the static one from src/data/site.ts. A page the Szerkesztő
 * deleted drops out of either.
 */
export function useSiteMenu(): { primary: MenuItem[]; secondary: MenuItem[] } {
  const { menu, pages } = useSiteContent()
  const primary = menu?.primary ?? primaryMenu
  const secondary = menu?.secondary ?? secondaryMenu

  const deleted = new Set(
    Object.values(pages)
      .filter((page) => page.deleted)
      .map((page) => page.route),
  )
  if (deleted.size === 0) return { primary, secondary }
  return { primary: withoutRoutes(primary, deleted), secondary: withoutRoutes(secondary, deleted) }
}
