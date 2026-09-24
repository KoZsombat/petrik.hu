/**
 * The date format every mirrored post prints ("2026. szept 15.") - the
 * theme's own. Intl adds a period after the abbreviated month that the
 * theme's dates never have, so it is stripped back out.
 *
 * Shared by the single-post template and by the live-post summaries
 * (src/lib/posts/postsContext.ts), so a post published through /hirkezelo/
 * prints its date the same way as the mirrored cards it sits next to in an
 * archive listing (AGENT.md 6.18).
 */
const FORMAT = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })

export function formatPostDate(iso: string): string {
  return FORMAT.format(new Date(iso)).replace(/\.(\s+\d)/, '$1')
}
