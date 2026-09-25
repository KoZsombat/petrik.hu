import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Restores the browser's usual "new page starts at the top" behaviour, which
 * client-side routing otherwise loses.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
