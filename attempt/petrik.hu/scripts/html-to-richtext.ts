/**
 * The mirror's module HTML -> the Szerkesztő's RichTextDocument (AGENT.md
 * 6.19). Dev-time only: scripts/page-inventory.ts runs it over every
 * editable module, and the result is the starting content the editor opens a
 * module with. Nothing in server/ or src/ imports this file.
 *
 * It follows scripts/extract.ts's reading of the markup - the same block tags,
 * the same URL rewriting, the same flattening of block-holding <div>s - so an
 * untouched module converted here renders like the generated JSX it came from.
 *
 * What the model cannot express is *not* approximated: a table, an inline
 * image, a styled <div>, a font-size on a paragraph... makes the whole module
 * `lossy`, and the editor lists it read-only rather than degrading it on the
 * first save.
 */
import type { HTMLElement, Node } from 'node-html-parser'
import { rewriteUrl } from './extract.ts'
import type { Align, RichTextBlock, RichTextDocument, TextRun } from '../shared/pnw/types.ts'
import { isSafeColor } from '../shared/pnw/richtext.ts'

export type Conversion = { content: RichTextDocument } | { lossy: string }

class Lossy extends Error {}

function lossy(reason: string): never {
  throw new Lossy(reason)
}

type Marks = Omit<TextRun, 'text'>

const HEADINGS: Record<string, 1 | 2 | 3 | 4> = { h1: 1, h2: 2, h3: 3, h4: 4 }
const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'div'])
const tagOf = (el: HTMLElement) => el.rawTagName?.toLowerCase() ?? ''

/** `style="a: b; c: d"` as pairs; anything but the allowed properties is lossy. */
function styleOf(el: HTMLElement, allowed: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of (el.getAttribute('style') ?? '').split(';')) {
    const at = part.indexOf(':')
    if (at < 0) continue
    const name = part.slice(0, at).trim().toLowerCase()
    const value = part.slice(at + 1).trim()
    if (!name || !value) continue
    if (!allowed.includes(name)) lossy(`style ${name} on <${tagOf(el)}>`)
    out[name] = value
  }
  return out
}

function colorOf(style: Record<string, string>): string | undefined {
  const color = style.color
  if (color === undefined) return undefined
  if (!isSafeColor(color)) lossy(`colour ${color}`)
  return color
}

function alignOf(style: Record<string, string>): RichTextBlock['align'] {
  const align = style['text-align']
  if (align === undefined || align === 'left') return undefined
  if (align === 'center' || align === 'right' || align === 'justify') return align as Align | 'justify'
  lossy(`text-align ${align}`)
}

class Builder {
  blocks: RichTextBlock[] = []
  private counter = 0
  private readonly depth: number
  private readonly idPrefix: string

  constructor(depth: number, idPrefix: string) {
    this.depth = depth
    this.idPrefix = idPrefix
  }

  id(): string {
    this.counter += 1
    return `${this.idPrefix}${this.counter}`
  }

  /** The runs of an inline subtree, with the marks inherited from above. */
  runs(nodes: Node[], marks: Marks): TextRun[] {
    const out: TextRun[] = []
    for (const node of nodes) {
      if (node.nodeType === 3) {
        // HTML whitespace collapses to one space; a no-break space is not whitespace to it.
        const text = (node as unknown as { text: string }).text.replace(/[ \t\r\n\f]+/g, ' ')
        if (text) out.push({ ...marks, text })
        continue
      }
      if (node.nodeType !== 1) continue
      const el = node as HTMLElement
      const tag = tagOf(el)
      switch (tag) {
        case 'strong':
        case 'b':
          out.push(...this.runs(el.childNodes, { ...marks, bold: true }))
          break
        case 'em':
        case 'i':
          out.push(...this.runs(el.childNodes, { ...marks, italic: true }))
          break
        case 'u':
          out.push(...this.runs(el.childNodes, { ...marks, underline: true }))
          break
        case 'br':
          out.push({ ...marks, text: '\n' })
          break
        case 'span': {
          const color = colorOf(styleOf(el, ['color']))
          out.push(...this.runs(el.childNodes, color ? { ...marks, color } : marks))
          break
        }
        case 'a': {
          const href = rewriteUrl(el.getAttribute('href') ?? '', this.depth)
          const linked = href && href !== '#' ? { ...marks, href } : marks
          out.push(...this.runs(el.childNodes, linked))
          break
        }
        default:
          lossy(`<${tag}>`)
      }
    }
    return out
  }

  /** Adds a block from inline content, tidied the way the browser would lay it out. */
  push(type: RichTextBlock['type'], runs: TextRun[], extra: Partial<RichTextBlock> = {}): void {
    const tidy = normalize(runs)
    if (tidy.every((run) => !run.text.trim())) return // extract.ts drops empty blocks too
    this.blocks.push({ id: this.id(), type, ...extra, runs: tidy })
  }

  block(el: HTMLElement): void {
    const tag = tagOf(el)

    if (tag in HEADINGS || tag === 'p' || tag === 'blockquote') {
      if (el.childNodes.some((child) => child.nodeType === 1 && BLOCK_TAGS.has(tagOf(child as HTMLElement)))) {
        lossy(`blocks inside <${tag}>`)
      }
      const style = styleOf(el, ['text-align', 'color'])
      const color = colorOf(style)
      const runs = this.runs(el.childNodes, color ? { color } : {})
      const align = alignOf(style)
      const extra: Partial<RichTextBlock> = align ? { align } : {}
      if (tag in HEADINGS) this.push('heading', runs, { ...extra, level: HEADINGS[tag] })
      else this.push(tag === 'p' ? 'paragraph' : 'blockquote', runs, extra)
      return
    }

    if (tag === 'ul' || tag === 'ol') {
      styleOf(el, [])
      for (const child of el.childNodes) {
        if (child.nodeType === 3) {
          if ((child as unknown as { text: string }).text.trim()) lossy(`text directly in <${tag}>`)
          continue
        }
        if (child.nodeType !== 1) continue
        const item = child as HTMLElement
        if (tagOf(item) !== 'li') lossy(`<${tagOf(item)}> directly in <${tag}>`)
        if (item.childNodes.some((node) => node.nodeType === 1 && BLOCK_TAGS.has(tagOf(node as HTMLElement)))) {
          lossy('a nested list or block inside <li>')
        }
        styleOf(item, [])
        this.push(tag === 'ul' ? 'bulleted-list' : 'numbered-list', this.runs(item.childNodes, {}))
      }
      return
    }

    if (tag === 'div') {
      // extract.ts flattens a div only when it really holds blocks; a div of
      // inline content stays a div, which this model has no block for.
      const holdsBlocks = el.childNodes.some(
        (child) => child.nodeType === 1 && BLOCK_TAGS.has(tagOf(child as HTMLElement)),
      )
      if (!holdsBlocks) {
        if (!el.text.trim()) return
        lossy('a <div> of inline text')
      }
      styleOf(el, [])
      this.container(el)
      return
    }

    lossy(`<${tag}>`)
  }

  /** A container's children: blocks, plus bare inline content gathered into paragraphs. */
  container(el: HTMLElement, skip: (HTMLElement | null)[] = []): void {
    let inline: Node[] = []
    const flush = () => {
      if (inline.length) this.push('paragraph', this.runs(inline, {}))
      inline = []
    }

    for (const child of el.childNodes) {
      if (child.nodeType === 3) {
        inline.push(child)
        continue
      }
      if (child.nodeType !== 1) continue
      const element = child as HTMLElement
      if (skip.includes(element)) continue
      if (BLOCK_TAGS.has(tagOf(element))) {
        flush()
        this.block(element)
      } else {
        inline.push(element)
      }
    }
    flush()
  }
}

/** Merges runs with equal marks, and trims the whitespace a browser would not show. */
function normalize(runs: TextRun[]): TextRun[] {
  const merged: TextRun[] = []
  for (const run of runs) {
    const last = merged[merged.length - 1]
    if (last && sameMarks(last, run)) last.text += run.text
    else merged.push({ ...run })
  }
  for (const run of merged) run.text = run.text.replace(/ *\n */g, '\n')
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^ +/, '')
    const last = merged[merged.length - 1]
    last.text = last.text.replace(/ +$/, '')
  }
  // A space at a run boundary next to a line break collapses too.
  for (let i = 1; i < merged.length; i += 1) {
    if (merged[i - 1].text.endsWith('\n')) merged[i].text = merged[i].text.replace(/^ +/, '')
    if (merged[i].text.startsWith('\n')) merged[i - 1].text = merged[i - 1].text.replace(/ +$/, '')
  }
  return merged.filter((run) => run.text !== '')
}

function sameMarks(a: TextRun, b: TextRun): boolean {
  return (
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline &&
    a.color === b.color &&
    a.href === b.href
  )
}

/**
 * Converts the inside of one module (a `.et_pb_text_inner`, a blurb's
 * description) - `depth` is the page's directory depth, as walk.ts passes it
 * to rewriteUrl. `idPrefix` keeps block ids stable across regenerations.
 */
export function htmlToRichText(
  el: HTMLElement | null,
  depth: number,
  idPrefix: string,
  skip: (HTMLElement | null)[] = [],
): Conversion {
  if (!el) return { content: [] }
  const builder = new Builder(depth, idPrefix)
  try {
    builder.container(el, skip)
  } catch (error) {
    if (error instanceof Lossy) return { lossy: error.message }
    throw error
  }
  return { content: builder.blocks }
}
