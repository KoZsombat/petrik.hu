import { useEffect, useState } from 'react'

/**
 * Divi's shrinking header: true once the page is scrolled past the point where
 * the theme swaps the header into its compact state.
 *
 * The original did this in JavaScript - it watched the scroll position and put
 * `et-fixed-header` on #main-header - and all the sizing hangs off that class
 * in CSS. There is no way to express it in CSS alone, so this is the React
 * equivalent the port's rules ask for.
 *
 * The threshold is measured, not guessed: on the mirror the class appears at a
 * scroll position of 60 and not at 59.
 */
const THRESHOLD = 60

export function useFixedHeader(): boolean {
  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    const read = () => setFixed(window.scrollY >= THRESHOLD)
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [])

  return fixed
}
