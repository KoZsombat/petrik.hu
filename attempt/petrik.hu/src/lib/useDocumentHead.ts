import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { heads } from '../data/head.ts'

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

  useEffect(() => {
    const head = heads[pathname]
    if (head) {
      document.title = head.title
      setMeta('description', head.description)
      setMeta('robots', head.robots)
      setCanonical(head.canonical ? window.location.origin + pathname : undefined)
      return
    }

    if (pathname === '/hirkezelo/') {
      document.title = HIRKEZELO_TITLE
      setMeta('description', undefined)
      setMeta('robots', 'noindex, nofollow')
      setCanonical(undefined)
      return
    }

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
  }, [pathname])
}
