import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PublicPage, PublicSiteContent } from '../../../../../shared/pnw/page-types.ts'
import { SiteContentContext } from './siteContext.ts'
import type { SiteContentValue } from './siteContext.ts'

const EMPTY: PublicSiteContent = { pages: [], overrides: {}, menu: null }

/**
 * Fetches the Szerkesztő's content once per full page load - modelled 1:1 on
 * PostsProvider.tsx and mounted beside it in Layout.tsx, which stays mounted
 * across client-side navigation. A dead backend leaves the site exactly as it
 * is without one: no overrides, the static menu, and builder pages 404
 * (AGENT.md 6.19).
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PublicSiteContent>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/public/site')
      .then((response) => (response.ok ? response.json() : EMPTY))
      .then((data: Partial<PublicSiteContent>) => {
        if (!cancelled) {
          setContent({ pages: data.pages ?? [], overrides: data.overrides ?? {}, menu: data.menu ?? null })
        }
      })
      .catch(() => {
        /* no backend running - the static site still has to work on its own */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<SiteContentValue>(() => {
    const pages: Record<string, PublicPage> = {}
    for (const page of content.pages) pages[page.slug] = page
    return { overrides: content.overrides, pages, menu: content.menu, loading }
  }, [content, loading])

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}
