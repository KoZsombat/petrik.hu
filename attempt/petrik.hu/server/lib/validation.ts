import type { RichTextDocument } from '../../shared/pnw/types.ts'

/** Mirrors the save_news/reviewer_save check on wp_strip_all_tags(content). */
export function hasRealText(content: RichTextDocument): boolean {
  return content.some((block) => block.runs.some((run) => run.text.trim() !== ''))
}

/**
 * Keeps only ids that really exist as terms of the right kind. There is no
 * per-account allow-list any more - every account may use every category and
 * tag (AGENT.md 6.16) - so the only thing left to check is existence, which
 * the caller reads fresh from the terms table (a term created a second ago
 * has to be usable immediately).
 */
export function sanitizeTermIds(ids: unknown, known: Set<string>): string[] {
  if (!Array.isArray(ids)) return []
  const seen = new Set<string>()
  return ids.filter((id): id is string => {
    if (typeof id !== 'string' || !known.has(id) || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

/** Form fields arrive as JSON strings (FormData), JSON bodies as real arrays. */
export function parseIdList(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
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
