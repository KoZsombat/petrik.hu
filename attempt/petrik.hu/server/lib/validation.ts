import type { RichTextDocument } from '../../shared/pnw/types.ts'
import { categories } from '../../shared/pnw/categories.ts'

/** Mirrors the save_news/reviewer_save check on wp_strip_all_tags(content). */
export function hasRealText(content: RichTextDocument): boolean {
  return content.some((block) => block.runs.some((run) => run.text.trim() !== ''))
}

const KNOWN_CATEGORY_IDS = new Set(categories.map((category) => category.id))

/** Keeps only ids that are both real categories and within the allowed set. */
export function sanitizeCategoryIds(ids: unknown, allowed: string[]): string[] {
  if (!Array.isArray(ids)) return []
  const allowedSet = new Set(allowed)
  return ids.filter(
    (id): id is string => typeof id === 'string' && KNOWN_CATEGORY_IDS.has(id) && allowedSet.has(id),
  )
}

export function parseRichText(raw: unknown): RichTextDocument | null {
  if (typeof raw !== 'string') return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed as RichTextDocument
  } catch {
    return null
  }
}
