import { useSyncExternalStore } from 'react'

/**
 * Divi's blog grid changed its column count with the viewport, and it did so
 * through a CSS trick: a `content` string on a ::before pseudo-element told the
 * Salvattore script how many columns to deal the posts into. Reproducing that
 * needs the breakpoint in JavaScript, because the number of columns decides how
 * the posts are distributed, not just how they are styled.
 *
 * Divi's rule, for a feed asking for `desktop` columns:
 *   >= 981px   desktop columns
 *   768-980px  at most 2
 *   <= 767px   1
 */
const TABLET = '(min-width: 768px) and (max-width: 980px)'
const DESKTOP = '(min-width: 981px)'

function subscribe(onChange: () => void): () => void {
  const queries = [window.matchMedia(TABLET), window.matchMedia(DESKTOP)]
  queries.forEach((query) => query.addEventListener('change', onChange))
  return () => queries.forEach((query) => query.removeEventListener('change', onChange))
}

export function useColumnCount(desktop: number): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (window.matchMedia(DESKTOP).matches) return desktop
      if (window.matchMedia(TABLET).matches) return Math.min(desktop, 2)
      return 1
    },
    // Server-side and during the first paint there is no viewport to measure;
    // the desktop layout is the sensible default.
    () => desktop,
  )
}
