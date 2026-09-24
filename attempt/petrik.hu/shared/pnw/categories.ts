/**
 * The editor's category checkboxes use the site's real WordPress categories
 * rather than an invented list - derived from src/data/archives.ts, which
 * already has every category archive's real route and label from the mirror.
 *
 * The mirror has no numeric term_id in scope (archives.ts is keyed by route,
 * not id), so the category archive's own route is used as the stable id
 * here - a re-implementation detail, not a claim about the real WordPress ids.
 */
import { archives } from '../../src/data/archives.ts'

export type Category = {
  id: string
  name: string
}

function dedupe(): Category[] {
  const seen = new Map<string, string>()
  for (const archive of Object.values(archives)) {
    if (archive.kind !== 'category') continue
    // Paged category archives ("/kategoria/hirek/page/2/") are the same
    // category as the unpaged one - collapse them to one entry.
    const id = archive.route.replace(/page\/\d+\/$/, '')
    if (!seen.has(id)) seen.set(id, archive.label)
  }
  return Array.from(seen, ([id, name]) => ({ id, name }))
}

export const categories: Category[] = dedupe()
