/**
 * Shared helpers for reading the mirror's Divi markup: class handling, URL
 * rewriting and the conversion of inline HTML into JSX source.
 *
 * Used by scripts/walk.ts, which does the tree walking and JSX printing.
 */
import type { HTMLElement, Node } from 'node-html-parser'

const classesOf = (el: HTMLElement): string[] => (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

const hasClass = (el: HTMLElement, name: string): boolean => classesOf(el).includes(name)

/** The numeric suffix Divi puts on a module class, e.g. et_pb_text_3 -> 3. */
function indexOf(el: HTMLElement, prefix: string): number {
  for (const cls of classesOf(el)) {
    if (!cls.startsWith(`${prefix}_`)) continue
    const suffix = cls.slice(prefix.length + 1)
    if (/^[0-9]+$/.test(suffix)) return Number(suffix)
  }
  return 0
}

/** Rewrites a mirror-relative URL onto the ported site's own paths. */
export function rewriteUrl(url: string, depth: number): string {
  const clean = (url ?? '').trim()
  if (
    !clean ||
    clean.startsWith('http') ||
    clean.startsWith('//') ||
    clean.startsWith('mailto:') ||
    clean.startsWith('tel:') ||
    clean.startsWith('data:') ||
    clean === '#'
  ) {
    return clean
  }
  let path = decodeURI(clean)
  for (let i = 0; i < depth; i += 1) path = path.replace(/^\.\.\//, '')
  path = path.replace(/^\.\//, '').replace(/index\.html$/, '')
  if (path.startsWith('wp-content/')) return `/media/${path}`
  return `/${path.replace(/^\//, '')}`
}

/**
 * Resolves a mirror-relative URL against the directory of the page it was found
 * on, then maps it onto the ported site's paths.
 *
 * rewriteUrl() strips a fixed number of leading `../`, which is right for the
 * pages at the top of the mirror but wrong inside a subdirectory: a docs page
 * sits two levels deep yet its sibling links carry only one `../`, so stripping
 * two would drop the `docs/` prefix and point at the site root. This walks the
 * segments instead, so it is correct at any depth.
 */
export function resolveUrl(url: string, fromDir: string): string {
  const clean = (url ?? '').trim().replace(/#.*$/, '')
  if (
    !clean ||
    clean.startsWith('http') ||
    clean.startsWith('//') ||
    clean.startsWith('mailto:') ||
    clean.startsWith('tel:') ||
    clean.startsWith('data:')
  ) {
    return clean
  }
  const parts = fromDir.split('/').filter(Boolean)
  for (const segment of decodeURI(clean).split('/')) {
    if (!segment || segment === '.' || segment === 'index.html') continue
    if (segment === '..') parts.pop()
    else parts.push(segment)
  }
  const path = parts.join('/')
  if (!path) return '/'
  if (path.startsWith('wp-content/')) return `/media/${path}`
  // A trailing slash marks a directory; a file keeps its bare name.
  return parts[parts.length - 1].includes('.') ? `/${path}` : `/${path}/`
}

/* -- inline content ------------------------------------------------------- */

const ESCAPES: [RegExp, string][] = [
  [/\{/g, '&#123;'],
  [/\}/g, '&#125;'],
  [/\u00a0/g, '&nbsp;'],
]

function escapeText(text: string): string {
  return ESCAPES.reduce((acc, [rx, to]) => acc.replace(rx, to), text)
}

/**
 * An inline `style` attribute as a JSX style object, or null when there is
 * nothing in it.
 *
 * The editor coloured words by wrapping them in a styled <span>. Unwrapping
 * those spans - which is right when they carry nothing - threw the colour away
 * with them: the hero headings turned from the site's teal to plain black.
 */
function styleProp(el: HTMLElement): string | null {
  const raw = (el.getAttribute('style') ?? '').trim()
  if (!raw) return null
  const fields: string[] = []
  for (const part of raw.split(';')) {
    const at = part.indexOf(':')
    if (at < 0) continue
    const name = part.slice(0, at).trim().toLowerCase()
    const value = part.slice(at + 1).trim()
    if (!name || !value) continue
    const key = name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    fields.push(`${key}: ${JSON.stringify(value)}`)
  }
  return fields.length ? `{{ ${fields.join(', ')} }}` : null
}

/** Converts a node's inline markup into JSX source. */
function inlineJsx(node: Node, depth: number): string {
  if (node.nodeType === 3) {
    const raw = node.rawText ?? ''
    // A run of whitespace between two inline elements is one space in HTML,
    // but JSX throws away any run that contains a newline. Written out as an
    // expression it survives - the same device Header.tsx uses to keep the
    // menu from shifting. Without it a line like `<a>A</a><br />\n<a>B</a>`
    // loses the gap the original had.
    if (raw && !raw.trim()) return raw.includes('\n') ? "{' '}" : escapeText(raw)
    return escapeText(raw)
  }
  const el = node as HTMLElement
  const tag = el.rawTagName?.toLowerCase()
  const inner = el.childNodes.map((child) => inlineJsx(child, depth)).join('')

  switch (tag) {
    case 'strong':
    case 'b':
      return `<strong>${inner}</strong>`
    case 'em':
    case 'i':
      return `<em>${inner}</em>`
    case 'u':
      return `<u>${inner}</u>`
    case 'br':
      return '<br />'
    case 'span': {
      // A bare <span> is just a wrapper and is unwrapped; one with styling on
      // it is carrying meaning, so it stays.
      const style = styleProp(el)
      return style ? `<span style=${style}>${inner}</span>` : inner
    }
    case 'a': {
      const raw = el.getAttribute('href') ?? ''
      const href = rewriteUrl(raw, depth)
      if (!href || href === '#') return inner
      if (href.startsWith('http') || href.startsWith('mailto:')) {
        const external = href.startsWith('http') ? ' target="_blank" rel="noreferrer"' : ''
        return `<a href="${href}"${external}>${inner}</a>`
      }
      if (href.startsWith('/media/')) return `<a href="${href}">${inner}</a>`
      return `<Link to="${href}">${inner}</Link>`
    }
    default:
      return inner
  }
}

/** Tags that carry their own block box in the rendered page. */
const BLOCK_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'div']

/**
 * Renders a list, including the nested ones.
 *
 * The editor produced some lists as <ul><ul><li>…, with no item at the outer
 * level at all, so a list has to be walked rather than simply queried for its
 * direct <li> children.
 */
function listJsx(el: HTMLElement, depth: number): string | null {
  const tag = el.rawTagName?.toLowerCase() === 'ol' ? 'ol' : 'ul'
  const parts: string[] = []

  for (const child of el.childNodes) {
    if (child.nodeType !== 1) continue
    const item = child as HTMLElement
    const itemTag = item.rawTagName?.toLowerCase()

    if (itemTag === 'li') {
      const nested = item.childNodes
        .filter((node) => node.nodeType === 1)
        .map((node) => node as HTMLElement)
        .filter((node) => ['ul', 'ol'].includes(node.rawTagName?.toLowerCase() ?? ''))
      const text = item.childNodes
        .filter((node) => !nested.includes(node as HTMLElement))
        .map((node) => inlineJsx(node, depth))
        .join('')
        .trim()
      const sublists = nested
        .map((list) => listJsx(list, depth))
        .filter((part): part is string => Boolean(part))
      parts.push(
        sublists.length
          ? `<li>\n  ${text}\n${sublists.map((s) => '  ' + s).join('\n')}\n</li>`
          : `<li>${text}</li>`,
      )
      continue
    }

    // A list nested directly inside a list, with no item around it.
    if (itemTag === 'ul' || itemTag === 'ol') {
      const inner = listJsx(item, depth)
      if (inner) parts.push(inner)
    }
  }

  return parts.length ? `<${tag}>\n${parts.map((p) => '  ' + p).join('\n')}\n</${tag}>` : null
}

/** Renders a block-level element (p, ul, h2 ...) as JSX source. */
function blockJsx(el: HTMLElement, depth: number): string | null {
  const tag = el.rawTagName?.toLowerCase()
  if (!tag) return null
  const inner = el.childNodes.map((child) => inlineJsx(child, depth)).join('').trim()

  if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tag)) {
    if (!inner) return null
    /*
     * The editor styled whole paragraphs inline, not only the spans inside
     * them - 293 of them across the mirror - and dropping that took the size,
     * the letter-spacing and the uppercasing off every section subtitle on the
     * home page. The same styleProp the spans have always used.
     */
    const style = styleProp(el)
    return style ? `<${tag} style=${style}>${inner}</${tag}>` : `<${tag}>${inner}</${tag}>`
  }
  if (tag === 'ul' || tag === 'ol') return listJsx(el, depth)
  if (tag === 'div') {
    // Divi wraps pasted content in bare divs. Flatten one only when it really
    // holds blocks; a div whose children are inline is a paragraph in its own
    // right, and descending into it would keep the <strong> runs and throw the
    // text between them away - which is what content pasted out of Outlook
    // looks like on docs/petrik-alapitvany.
    const holdsBlocks = el.childNodes.some(
      (child) =>
        child.nodeType === 1 &&
        BLOCK_TAGS.includes((child as HTMLElement).rawTagName?.toLowerCase() ?? ''),
    )
    if (holdsBlocks) {
      const parts = el.childNodes
        .map((child) => (child.nodeType === 1 ? blockJsx(child as HTMLElement, depth) : null))
        .filter((part): part is string => Boolean(part))
      if (parts.length) return parts.join('\n')
    }
    if (!inner) return null
    // Kept as a div rather than promoted to a paragraph: Divi gives <p> a
    // bottom margin, and on a page with eight such wrappers that adds over a
    // hundred pixels the original never had.
    const style = styleProp(el)
    return style ? `<div style=${style}>${inner}</div>` : `<div>${inner}</div>`
  }
  if (['a', 'span', 'strong', 'em', 'u', 'img', 'br'].includes(tag)) {
    // The editor sometimes wraps whole paragraphs in an inline tag, as the
    // library opening hours on /elerhetoseg/ do. Keeping the blocks inside the
    // inline element preserves both the emphasis and the paragraph breaks.
    const blockChildren = el.childNodes
      .filter((child) => child.nodeType === 1)
      .map((child) => child as HTMLElement)
      .filter((child) => BLOCK_TAGS.includes(child.rawTagName?.toLowerCase() ?? ''))

    if (blockChildren.length) {
      const parts = blockChildren
        .map((child) => blockJsx(child, depth))
        .filter((part): part is string => Boolean(part))
      return parts.length ? `<${tag}>\n${parts.map((p) => '  ' + p).join('\n')}\n</${tag}>` : null
    }

    // Otherwise it is a genuinely inline run - a bare link in a blurb, say -
    // and is kept as it is rather than wrapped in a paragraph.
    return inlineJsx(el, depth) || null
  }
  return null
}

/**
 * Block children of a container, as JSX source lines.
 *
 * Bare text sitting directly in the container counts too: a Divi text module
 * can hold a plain string with no paragraph around it.
 */


/** The element before or after a node, skipping text nodes. */
function elementSibling(el: HTMLElement, node: Node, step: 1 | -1): HTMLElement | null {
  const at = el.childNodes.indexOf(node)
  for (let i = at + step; i >= 0 && i < el.childNodes.length; i += step) {
    if (el.childNodes[i].nodeType === 1) return el.childNodes[i] as HTMLElement
  }
  return null
}

function blocksOf(el: HTMLElement | null, depth: number, skip: (HTMLElement | null)[] = []): string[] {
  if (!el) return []
  const out: string[] = []
  for (const child of el.childNodes) {
    if (child.nodeType === 3) {
      const text = escapeText(child.rawText ?? '').trim()
      if (text) {
        out.push(text)
        continue
      }
      // A whitespace run between two elements is one space in HTML, but JSX
      // throws away any run that spans a newline, so it has to be written out
      // to keep `<a>A</a><br />\n<a>B</a>` reading with a gap. Between two
      // blocks the space is inert, and reproducing it there costs nothing
      // while keeping the rendered text a faithful copy.
      if (
        (child.rawText ?? '') &&
        elementSibling(el, child, -1) &&
        elementSibling(el, child, 1)
      ) {
        out.push("{' '}")
      }
      continue
    }
    if (child.nodeType !== 1) continue
    const element = child as HTMLElement
    if (skip.includes(element)) continue
    const jsx = blockJsx(element, depth)
    if (jsx) out.push(jsx)
  }
  return out
}

export { classesOf, hasClass, indexOf, inlineJsx, blockJsx, blocksOf, escapeText }

