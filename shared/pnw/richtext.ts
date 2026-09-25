/**
 * Pure data helpers over the RichTextDocument model (see types.ts) - no React,
 * so both the frontend editor/preview and the server's search filtering can
 * use the same "what is this block's plain text" logic.
 */
import type { BlockType, RichTextBlock, RichTextDocument } from './types.ts'

let counter = 0
function blockId(): string {
  counter += 1
  return `b${Date.now().toString(36)}${counter}`
}

export function emptyBlock(type: BlockType = 'paragraph'): RichTextBlock {
  return { id: blockId(), type, runs: [{ text: '' }] }
}

export function emptyDocument(): RichTextDocument {
  return [emptyBlock()]
}

/** The editor keeps one run per block (see RichTextEditor.tsx); this reads any block regardless. */
export function blockText(block: RichTextBlock): string {
  return block.runs.map((run) => run.text).join('')
}

export function documentText(doc: RichTextDocument): string {
  return doc.map(blockText).join('\n')
}

export function isBlank(doc: RichTextDocument): boolean {
  return doc.every((block) => blockText(block).trim() === '')
}

/**
 * The only link targets a run (or a Szerkesztő button/image/menu item) may
 * carry: a root-relative in-app route, or an http(s)/mailto/tel URL. Anything
 * else - `javascript:` first of all - is dropped on save and ignored on render.
 */
export function isSafeHref(href: string): boolean {
  if (href.startsWith('/') && !href.startsWith('//')) return true
  return /^(https?:\/\/|mailto:|tel:)/i.test(href)
}

/** `#rgb`/`#rrggbb`/`rgb()`/`rgba()` or a bare colour keyword - never anything that could close a style. */
export function isSafeColor(color: string): boolean {
  return /^(#[0-9a-f]{3,8}|rgba?\([0-9.,\s%]+\)|[a-z]+)$/i.test(color.trim())
}
