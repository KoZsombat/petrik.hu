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
