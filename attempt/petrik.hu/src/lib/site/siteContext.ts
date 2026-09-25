import { createContext, useContext } from 'react'
import { primaryMenu, secondaryMenu } from '../../data/site.ts'
import type { MenuItem } from '../../data/site.ts'
import type { PageOverrides, PublicPage, SiteMenu } from '../../../shared/pnw/page-types.ts'

/**
 * What the Szerkesztő changed (AGENT.md 6.19), fetched once per page load by
 * SiteContentProvider.tsx - the same shape of thing postsContext.ts is for
 * live news. Kept apart from the provider component for the same
 * react-refresh reason.
 *
 * Every consumer must treat "nothing here" as the normal case: with no
 * backend, or before anyone edited anything, `overrides` and `pages` are
 * empty and `menu` is null, and the site renders exactly as generated.
 */
export type SiteContentValue = {
  /** Keyed by route, e.g. `/nyolcadikos/`. */
  overrides: Record<string, PageOverrides>
  /** Published builder pages, keyed by slug. */
  pages: Record<string, PublicPage>
  menu: SiteMenu | null
  /** True until the fetch settles - DynamicPage waits for it before deciding on a 404. */
  loading: boolean
}

export const SiteContentContext = createContext<SiteContentValue>({
  overrides: {},
  pages: {},
  menu: null,
  loading: false,
})

export function useSiteContent(): SiteContentValue {
  return useContext(SiteContentContext)
}

/**
 * False inside a PageRenderer: a builder document's modules number
 * themselves from 0 too, and must never pick up the overrides the current
 * route's generated page stores under the same `text:3` key.
 */
export const OverrideScopeContext = createContext(true)

function withoutRoutes(items: MenuItem[], hidden: Set<string>): MenuItem[] {
  return items
    .filter((item) => !item.to || !hidden.has(item.to))
    .map((item) => (item.children ? { ...item, children: withoutRoutes(item.children, hidden) } : item))
}

/**
 * The menus the header and the top bar render: the edited tree when there is
 * one, otherwise the static one from src/data/site.ts. A mirrored page the
 * Szerkesztő hid ("Rejtés") drops out of either.
 */
export function useSiteMenu(): { primary: MenuItem[]; secondary: MenuItem[] } {
  const { menu, overrides } = useSiteContent()
  const primary = menu?.primary ?? primaryMenu
  const secondary = menu?.secondary ?? secondaryMenu

  const hidden = new Set(
    Object.values(overrides)
      .filter((entry) => entry.hidden)
      .map((entry) => entry.route),
  )
  if (hidden.size === 0) return { primary, secondary }
  return { primary: withoutRoutes(primary, hidden), secondary: withoutRoutes(secondary, hidden) }
}
