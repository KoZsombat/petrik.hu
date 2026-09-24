/**
 * Replaces the earlier categories.ts (deleted). Categories and tags are real,
 * editable rows now (server/data/terms-repo.ts, AGENT.md 6.16) - this module
 * only supplies what a brand-new database is seeded with: the site's real
 * WordPress categories, derived from src/data/archives.ts, which already has
 * every category archive's real route and label from the mirror.
 *
 * The mirror has no numeric term_id in scope (archives.ts is keyed by route,
 * not id), so a seeded category's own archive route is used as its stable id
 * here - a re-implementation detail, not a claim about the real WordPress
 * ids. Terms created inside the Hírkezelő get a random id and no route,
 * because the mirror has no archive page for them.
 */
import { archives } from '../../src/data/archives.ts'
import type { Term } from './types.ts'

function dedupe(): Term[] {
  const seen = new Map<string, string>()
  for (const archive of Object.values(archives)) {
    if (archive.kind !== 'category') continue
    // Paged category archives ("/kategoria/hirek/page/2/") are the same
    // category as the unpaged one - collapse them to one entry.
    const route = archive.route.replace(/page\/\d+\/$/, '')
    if (!seen.has(route)) seen.set(route, archive.label)
  }
  return Array.from(seen, ([route, name]) => ({ id: route, kind: 'category' as const, name, route }))
}

/** The categories a fresh database starts with - the mirror's own WordPress categories. */
export const SEED_CATEGORIES: Term[] = dedupe()
