import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { heads } from '../data/head.ts'
import { useSiteContent } from './site/siteContext.ts'
import { routeKey } from './site/usePageOverride.ts'

/**
 * The two routes the mirror has no page for, so there is nothing to copy.
 *
 * `/kereses/` replaces WordPress's `?s=` search, which the crawler could not
 * capture, and the 404 wording is the port's own for the same reason. Both
 * follow the site's "<page> | petrik.hu" pattern so a tab looks no different
 * from any other.
 */
const SEARCH_TITLE = 'Keresés | petrik.hu'
const NOT_FOUND_TITLE = 'Az oldal nem található | petrik.hu'

/**
 * /hirkezelo/ is not a mirrored page either - it never existed in the
 * snapshot - but unlike search/404 it is a real tool with real (if only
 * seeded-demo) accounts behind it, so it gets `noindex, nofollow` rather
 * than no robots meta at all. See AGENT.md 6.15.
 */
const HIRKEZELO_TITLE = 'Hírkezelő | petrik.hu'

/**
 * The same for the shared login and the Szerkesztő (AGENT.md 6.19): real
 * tools, never in the snapshot, never to be indexed.
 */
const TOOL_TITLES: Record<string, string> = {
  '/hirkezelo/': HIRKEZELO_TITLE,
  '/bejelentkezes/': 'Bejelentkezés | petrik.hu',
  '/szerkeszto/': 'Szerkesztő | petrik.hu',
}

/** A top-level `/<slug>/` - the only shape a Szerkesztő page can have. */
const SINGLE_SEGMENT = /^\/([^/]+)\/?$/

/**
 * Sets or removes one <meta> in <head>, keyed by its name.
 *
 * Removing matters as much as setting: 25 of the mirror's routes carry a
 * robots meta and the rest carry none, so a tag left behind from the previous
 * route would be as wrong as a missing one.
 */
function setMeta(name: string, content: string | undefined): void {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!content) {
    existing?.remove()
    return
  }
  const meta = existing ?? document.createElement('meta')
  meta.setAttribute('name', name)
  meta.setAttribute('content', content)
  if (!existing) document.head.appendChild(meta)
}

/** The same, for the canonical link. */
function setCanonical(href: string | undefined): void {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!href) {
    existing?.remove()
    return
  }
  const link = existing ?? document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', href)
  if (!existing) document.head.appendChild(link)
}

/**
 * Puts back what WordPress served in <head> for the current route.
 *
 * WordPress rendered a whole document per request, so every page arrived with
 * its own title and metadata. A single-page app has the one in index.html,
 * which would leave every route sharing the site name - and the tab, the
 * bookmark, the browser history and anything that reads the page all take it
 * from there. The values come from src/data/head.ts, transcribed from the
 * mirror, the same way the body classes do in useBodyClass.
 *
 * The canonical is resolved here rather than stored: the mirror's hrefs were
 * rewritten by the crawler, and what WordPress emitted was a self-canonical -
 * the page's own URL. Building it from the current origin keeps that true
 * wherever the port is served, and invents no domain.
 */
export function useDocumentHead(): void {
  const { pathname } = useLocation()
  const site = useSiteContent()

  useEffect(() => {
    const route = routeKey(pathname)
    const override = site.overrides[route]

    // A mirrored page the Szerkesztő hid is served as the 404 (Layout.tsx).
    // `route`, not `pathname`: the router serves /nyolcadikos as well as /nyolcadikos/.
    const head = override?.hidden ? undefined : heads[route]
    if (head) {
      // The Szerkesztő may replace a mirrored page's title and description
      // (AGENT.md 6.19); robots and canonical stay the mirror's.
      document.title = override?.title ? `${override.title} | petrik.hu` : head.title
      setMeta('description', override?.description ?? head.description)
      setMeta('robots', head.robots)
      setCanonical(head.canonical ? window.location.origin + route : undefined)
      return
    }

    const toolTitle = TOOL_TITLES[route]
    if (toolTitle) {
      document.title = toolTitle
      setMeta('description', undefined)
      setMeta('robots', 'noindex, nofollow')
      setCanonical(undefined)
      return
    }

    // A page built in the Szerkesztő (src/pages/DynamicPage.tsx). Until the
    // one site fetch settles it is unknown whether this is one, so the 404
    // title must not flash first.
    const slug = SINGLE_SEGMENT.exec(pathname)?.[1]
    const page = slug ? site.pages[slug] : undefined
    if (page) {
      document.title = `${page.title} | petrik.hu`
      setMeta('description', page.description || undefined)
      setMeta('robots', undefined)
      setCanonical(window.location.origin + route)
      return
    }
    if (slug && site.loading) return

    // A live post published through /hirkezelo/ - real content, but its
    // title/etc. is dynamic data this static map can't know in advance.
    // src/pages/PublishedPost.tsx sets document.title itself once it loads;
    // this only has to not fight that by falling through to NOT_FOUND_TITLE
    // below on every render before the fetch resolves.
    if (pathname.startsWith('/hirek/')) return

    document.title = pathname === '/kereses/' ? SEARCH_TITLE : NOT_FOUND_TITLE
    setMeta('description', undefined)
    setMeta('robots', undefined)
    setCanonical(undefined)
  }, [pathname, site])
}
