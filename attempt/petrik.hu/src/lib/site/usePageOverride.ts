import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { overrideKey } from '../../../shared/pnw/page-types.ts'
import type { ModuleOverrideMap, OverrideKind, PageOverrides } from '../../../shared/pnw/page-types.ts'
import { OverrideScopeContext, useSiteContent } from './siteContext.ts'

/**
 * The router matches `/nyolcadikos` as well as `/nyolcadikos/`; overrides are
 * stored under the mirror's own trailing-slash form.
 */
export function routeKey(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

/** The current route's override layer, or undefined - the normal case. */
export function useRouteOverrides(): PageOverrides | undefined {
  const enabled = useContext(OverrideScopeContext)
  const { pathname } = useLocation()
  const { overrides } = useSiteContent()
  return enabled ? overrides[routeKey(pathname)] : undefined
}

/**
 * What the Szerkesztő saved for the module a generated page renders with
 * this `index` (AGENT.md 6.19), or undefined. The Divi primitives call this
 * with the index prop they already had, so the generated pages need no
 * change at all.
 */
export function usePageOverride<K extends OverrideKind>(kind: K, index: number): ModuleOverrideMap[K] | undefined {
  return useRouteOverrides()?.modules[overrideKey(kind, index)] as ModuleOverrideMap[K] | undefined
}

export type SectionOverride = {
  hidden: boolean
  /** The flex `order`, only when the page was reordered. */
  order?: number
}

/**
 * A section's visibility and position. Reordering puts
 * `.et_builder_inner_content` into a flex column (divi-layout.css, gated on
 * the `data-reordered` attribute Section.tsx sets), so every section of that
 * page needs an `order` - one missing from `sectionOrder` goes after the
 * listed ones, in its original order.
 */
export function useSectionOverride(index: number): SectionOverride {
  const overrides = useRouteOverrides()
  if (!overrides) return { hidden: false }

  const hidden = overrides.hiddenSections.includes(index)
  const order = overrides.sectionOrder
  if (!order) return { hidden }
  const position = order.indexOf(index)
  return { hidden, order: position === -1 ? order.length + index : position }
}
