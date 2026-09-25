import type { Post, Term } from '../../../../../shared/pnw/types.ts'
import { termNames } from '../../lib/terms.ts'

/**
 * One line of taxonomy under a list row's title. Tags are appended after the
 * categories because the mirror's own post template never shows them (see
 * AGENT.md 6.16) - inside the Hírkezelő they still have to be visible.
 */
export function termLine(terms: Term[], post: Post): string {
  const categoryPart = post.categoryIds.length === 0 ? 'Nincs kategória' : termNames(terms, post.categoryIds).join(', ')
  const tags = termNames(terms, post.tagIds)
  return tags.length === 0 ? categoryPart : `${categoryPart} · Címkék: ${tags.join(', ')}`
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
