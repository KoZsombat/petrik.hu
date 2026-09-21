import { useEffect } from 'react'

/**
 * Puts WordPress's per-page body classes back on <body> while a page is shown.
 *
 * WordPress gave every page a body class describing what it was - `archive`,
 * `single`, `et_right_sidebar` - and the theme's stylesheet leans on them for
 * real layout decisions: which side the sidebar goes, how wide the content
 * column is, what size the listing headings are. A single-page app has one
 * <body> for the whole site, so the classes have to be set and cleared as the
 * route changes rather than rendered.
 *
 * The classes the whole site shares (`et-db`, `et_divi_theme`) live in
 * index.html; only the ones that vary by page belong here.
 */
export function useBodyClass(classes: string[]): void {
  // Joined so the effect re-runs on a change of contents, not of array identity.
  const key = classes.join(' ')
  useEffect(() => {
    const added = key.split(' ').filter(Boolean)
    document.body.classList.add(...added)
    return () => document.body.classList.remove(...added)
  }, [key])
}
