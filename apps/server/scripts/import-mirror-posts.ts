/**
 * Imports the news posts of the old petrik.hu mirror into the Hírkezelő's
 * database (AGENT.md 6.24), so they can be edited, archived and restored like
 * any post written there - and are reachable at their original URL again.
 *
 *   PETRIK_MIRROR=<mirror dir> npm run import-posts -w apps/server
 *
 * `PNW_DATA_DIR` / `PNW_UPLOADS_DIR` (server/config.ts) point it at another
 * database and upload folder, for a dry run. It is idempotent: a slug that is
 * already in the database is skipped, so a second run imports nothing.
 *
 * Every `body.single-post` page of the mirror is a post - the sample post
 * `kutatok-ejszakaja-a-petrikben` too, which used to be a static page of its
 * own. Two shapes occur:
 * a Divi layout (`.et_builder_inner_content`), whose modules are flattened in
 * reading order, and plain Gutenberg blocks. Both become a RichTextDocument;
 * the pictures, galleries and iframes become its media blocks. Every file the
 * content uses is copied under `<uploads>/mirror/`, keeping the WordPress path.
 *
 * Nothing is dropped silently: whatever could not be mapped is printed at the
 * end, per post.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { parse } from 'node-html-parser'
import type { HTMLElement, Node } from 'node-html-parser'
import { STATUS } from '../../../shared/pnw/types.ts'
import type { Align, Post, RichGalleryItem, RichTextBlock, RichTextDocument, TextRun } from '../../../shared/pnw/types.ts'
import { isEmbedSrc } from '../../../shared/pnw/types.ts'
import { isSafeColor } from '../../../shared/pnw/richtext.ts'
import { MIRROR_ROOT } from '../../client/scripts/mirror.ts'
import { posts as summaries } from '../../client/src/data/posts.ts'
import { UPLOADS_DIR, UPLOADS_URL_PREFIX } from '../config.ts'
import { db } from '../data/db.ts'
import { existingSlugs, insertPost } from '../data/posts-repo.ts'
import { allTerms, seedInitialTerms } from '../data/terms-repo.ts'
import { allUsers, insertUser, seedInitialUsers } from '../data/users-repo.ts'
import { logAudit } from '../lib/audit.ts'

const SITE_HOSTS = ['petrik.hu', 'www.petrik.hu']

/** What could not be mapped, per post - printed at the end. */
const problems = new Map<string, string[]>()
let currentSlug = ''
function problem(what: string): void {
  const list = problems.get(currentSlug) ?? []
  list.push(what)
  problems.set(currentSlug, list)
}

/* -- files and links ------------------------------------------------------- */

const copied = new Set<string>()

/**
 * Copies one `wp-content/uploads/...` file of the mirror into the upload
 * folder and returns its public URL, null when the mirror never saved it, or
 * false when it is larger than `maxBytes`.
 */
function copyUpload(original: string, maxBytes: number): string | null | false {
  const path = preferVariant(original)
  const rest = path.replace(/^wp-content\/uploads\//, '')
  const url = `${UPLOADS_URL_PREFIX}/mirror/${rest}`
  if (copied.has(rest)) return url
  const source = [
    join(MIRROR_ROOT, path),
    join(MIRROR_ROOT, encodeURI(path)),
    // The crawler saved a few names as their UTF-8 bytes read as Windows-1252 (`–` as `â€“`).
    join(MIRROR_ROOT, asWindows1252(path)),
  ].find((candidate) => existsSync(candidate))
  if (!source) return null
  if (statSync(source).size > maxBytes) return false
  const target = join(UPLOADS_DIR, 'mirror', rest)
  mkdirSync(dirname(target), { recursive: true })
  if (!existsSync(target)) copyFileSync(source, target)
  copied.add(rest)
  return url
}

/** Windows-1252's 0x80-0x9F, which Node's TextDecoder reads as Latin-1 control codes instead. */
const CP1252_HIGH =
  '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f' +
  '\u0090‘’“”•–—˜™š›œ\u009džŸ'

/** A name's UTF-8 bytes read as Windows-1252 - how the crawler stored a few of them. */
function asWindows1252(name: string): string {
  return [...Buffer.from(name, 'utf8')]
    .map((byte) => (byte >= 0x80 && byte <= 0x9f ? CP1252_HIGH[byte - 0x80] : String.fromCharCode(byte)))
    .join('')
}

const dirListings = new Map<string, string[]>()

/**
 * A full-size picture (`foo.jpg`, `foo-scaled.jpg`) a lightbox or a link
 * opens: WordPress saved resized copies beside it (`foo-1280x853.jpg`), and the
 * smallest one at least 1024px wide is what gets copied instead - the
 * originals are what made the uploads several hundred megabytes.
 */
function preferVariant(path: string): string {
  const match = path.match(/^(.*\/)([^/]+?)(-scaled)?\.(jpe?g|png|webp)$/i)
  if (!match || /-\d+x\d+$/.test(match[2])) return path
  const [, dir, base, , ext] = match
  const absolute = join(MIRROR_ROOT, dir)
  if (!dirListings.has(dir)) dirListings.set(dir, existsSync(absolute) ? readdirSync(absolute) : [])
  const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)x\\d+\\.${ext}$`, 'i')
  const best = dirListings
    .get(dir)!
    .map((name) => ({ name, width: Number(name.match(pattern)?.[1] ?? 0) }))
    .filter((file) => file.width >= 1024)
    .sort((a, b) => a.width - b.width)[0]
  return best ? dir + best.name : path
}

/**
 * A URL found on a post page (which sits one level below the mirror root) as
 * the ported site's: an upload is copied and served from the server, a page
 * of the old site becomes a root-relative route, anything else stays as is.
 * Returns undefined for a link that leads nowhere (`#`, `index.html#`).
 */
function mapUrl(raw: string | undefined, maxBytes = Infinity): string | undefined {
  let url = (raw ?? '').trim()
  if (!url || url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('data:')) return undefined
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return url

  let path: string
  if (/^(https?:)?\/\//i.test(url)) {
    let parsed: URL
    try {
      parsed = new URL(url.startsWith('//') ? `https:${url}` : url)
      if (!SITE_HOSTS.includes(parsed.hostname)) return url
      path = decodeURI(parsed.pathname) + parsed.search
    } catch {
      return url
    }
  } else {
    url = url.replace(/#.*$/, '')
    // The post's own page (`index.html#`, the crawler's rewrite of `#`).
    if (!url || url === 'index.html') return undefined
    const parts: string[] = []
    let decoded = url
    try {
      decoded = decodeURI(url)
    } catch {
      /* a stray `%` - keep the raw text */
    }
    for (const segment of decoded.split('/')) {
      if (!segment || segment === '.' || segment === 'index.html') continue
      if (segment === '..') parts.pop()
      else parts.push(segment)
    }
    path = parts.join('/')
    // Relative to the post's own directory unless it climbed out of it.
    if (!url.startsWith('..') && !url.startsWith('/')) problem(`relative link kept as root path: ${raw}`)
    path = '/' + path + (url.endsWith('/') || !parts.length || !parts[parts.length - 1].includes('.') ? '/' : '')
  }
  path = path.replace(/^\/+/, '/').replace(/index\.html$/, '')
  if (!path.startsWith('/')) path = '/' + path
  if (path.startsWith('/wp-content/')) {
    const file = copyUpload(path.slice(1).replace(/\/$/, ''), maxBytes)
    if (file) return file
    if (file === false) {
      problem(`full-size picture over ${maxBytes / 1048576} MB not copied, its link dropped: ${path}`)
      return undefined
    }
    problem(`missing file in the mirror: ${path}`)
    return `https://petrik.hu${path}`
  }
  return path === '//' ? '/' : path
}

/** An image source, copied; null (and a problem) when the file is not in the mirror. */
function mapImage(raw: string | undefined, maxBytes = Infinity): string | null {
  const url = mapUrl(raw, maxBytes)
  if (!url) return null
  if (url.startsWith('https://petrik.hu/')) return null
  return url
}

/**
 * What a lightbox or a picture's link may open. A few galleries link 40 MB
 * camera PNGs that WordPress kept no smaller copy of; the thumbnail stays,
 * the link to the original goes.
 */
const LIGHTBOX_MAX_BYTES = 10 * 1048576

/* -- inline text ------------------------------------------------------------ */

type Marks = Omit<TextRun, 'text'>

const sameMarks = (a: Marks, b: Marks) =>
  !!a.bold === !!b.bold && !!a.italic === !!b.italic && !!a.underline === !!b.underline && a.href === b.href && a.color === b.color

const isElement = (node: Node): node is HTMLElement => node.nodeType === 1
const tagOf = (el: HTMLElement) => el.rawTagName?.toLowerCase() ?? ''
const classesOf = (el: HTMLElement) => (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
const hasClass = (el: HTMLElement, name: string) => classesOf(el).includes(name)

function styleOf(el: HTMLElement, name: string): string | undefined {
  for (const part of (el.getAttribute('style') ?? '').split(';')) {
    const at = part.indexOf(':')
    if (at > 0 && part.slice(0, at).trim().toLowerCase() === name) return part.slice(at + 1).trim()
  }
  return undefined
}

function marksOf(el: HTMLElement, marks: Marks): Marks {
  const tag = tagOf(el)
  const next = { ...marks }
  if (tag === 'strong' || tag === 'b') next.bold = true
  if (tag === 'em' || tag === 'i') next.italic = true
  if (tag === 'u') next.underline = true
  if (tag === 'a') next.href = mapUrl(el.getAttribute('href')) ?? next.href
  const weight = styleOf(el, 'font-weight')
  if (weight === 'bold' || (weight && Number(weight) >= 600)) next.bold = true
  if (styleOf(el, 'font-style') === 'italic') next.italic = true
  if (styleOf(el, 'text-decoration')?.includes('underline')) next.underline = true
  const color = styleOf(el, 'color')
  if (color && isSafeColor(color)) next.color = color
  return next
}

const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'div', 'figure', 'table', 'iframe', 'section', 'script', 'img',
])

/**
 * Collects blocks out of a container. Inline content is gathered into runs
 * until a block element interrupts it - so a picture inside a paragraph splits
 * the paragraph rather than vanishing.
 */
class Collector {
  blocks: RichTextDocument = []
  private runs: TextRun[] = []
  private readonly align?: Align | 'justify'

  constructor(align?: Align | 'justify') {
    this.align = align
  }

  text(text: string, marks: Marks): void {
    const value = text.replace(/[ \t\r\n]+/g, ' ')
    if (!value) return
    const last = this.runs[this.runs.length - 1]
    if (last && sameMarks(last, marks)) last.text += value
    else this.runs.push(clean({ text: value, ...marks }))
  }

  lineBreak(): void {
    const last = this.runs[this.runs.length - 1]
    if (last) last.text = last.text.replace(/ $/, '') + '\n'
  }

  /** Closes the inline run in progress as a paragraph (or the given type). */
  flush(type: RichTextBlock['type'] = 'paragraph', extra: Partial<RichTextBlock> = {}): void {
    const runs = trimRuns(this.runs)
    this.runs = []
    if (!runs.length) return
    this.blocks.push(clean({ id: newId(), type, align: this.align, ...extra, runs }) as RichTextBlock)
  }

  push(block: RichTextBlock): void {
    this.flush()
    this.blocks.push(block)
  }
}

function trimRuns(runs: TextRun[]): TextRun[] {
  const out = runs.map((run) => ({ ...run }))
  while (out.length && !out[0].text.replace(/^[\s\n]+/, '')) out.shift()
  while (out.length && !out[out.length - 1].text.replace(/[\s\n]+$/, '')) out.pop()
  if (!out.length) return []
  out[0].text = out[0].text.replace(/^[ \n]+/, '')
  out[out.length - 1].text = out[out.length - 1].text.replace(/[ \n]+$/, '')
  return out
}

function clean<T extends object>(value: T): T {
  for (const key of Object.keys(value) as (keyof T)[]) if (value[key] === undefined) delete value[key]
  return value
}

let idCounter = 0
const newId = () => `m${(idCounter++).toString(36)}`

function alignOf(el: HTMLElement): Align | 'justify' | undefined {
  const fromClass = classesOf(el).find((name) => name.startsWith('has-text-align-'))?.slice('has-text-align-'.length)
  const value = fromClass ?? styleOf(el, 'text-align')
  return value === 'center' || value === 'right' || value === 'justify' ? value : undefined
}

/** One node, inline or block, into the collector. */
function walk(node: Node, out: Collector, marks: Marks, listDepth = 0): void {
  if (!isElement(node)) {
    if (node.nodeType === 3) out.text(node.text, marks)
    return
  }
  const el = node
  const tag = tagOf(el)

  if (tag === 'br') return out.lineBreak()
  if (tag === 'style' || tag === 'noscript' || hasClass(el, 'shared-counts-wrap') || hasClass(el, 'et_overlay')) return

  if (BLOCK_TAGS.has(tag) || hasClass(el, 'wp-block-gallery') || hasClass(el, 'wp-block-embed')) {
    out.flush()
    for (const block of blocksOf(el, marks, listDepth)) out.blocks.push(block)
    return
  }
  for (const child of el.childNodes) walk(child, out, marksOf(el, marks), listDepth)
}

/** The inline content of one element as runs (blocks inside it are split out after it). */
function inlineBlock(el: HTMLElement, type: RichTextBlock['type'], extra: Partial<RichTextBlock>, marks: Marks): RichTextDocument {
  const out = new Collector(alignOf(el))
  for (const child of el.childNodes) walk(child, out, marksOf(el, marks))
  out.flush(type, extra)
  return out.blocks
}

/** A block element (or a wrapper of them) as blocks. */
function blocksOf(el: HTMLElement, marks: Marks = {}, listDepth = 0): RichTextDocument {
  const tag = tagOf(el)

  if (hasClass(el, 'wp-block-gallery')) return galleryOf(el.querySelectorAll('img').map((img) => ({ img, link: closestLink(img, el) })))
  if (hasClass(el, 'wp-block-embed')) {
    const iframe = el.querySelector('iframe')
    return iframe ? embedOf(iframe) : []
  }
  if (tag === 'figure') {
    const img = el.querySelector('img')
    if (img) return imageOf(img, closestLink(img, el), el.querySelector('figcaption')?.text.trim())
    const iframe = el.querySelector('iframe')
    if (iframe) return embedOf(iframe)
    return containerBlocks(el, marks, listDepth)
  }
  if (tag === 'img') return imageOf(el, closestLink(el, el.parentNode as HTMLElement))
  if (tag === 'iframe') return embedOf(el)
  if (tag === 'script') {
    const title = el.getAttribute('data-title')
    if ((el.getAttribute('src') ?? '').includes('venngage')) {
      problem(`Venngage infographic "${title}" (a script embed) kept as a note`)
      return [{ id: newId(), type: 'paragraph', runs: [{ text: `Infografika: ${title ?? ''} (Venngage)`, italic: true }] }]
    }
    problem(`script dropped: ${el.getAttribute('src') ?? 'inline'}`)
    return []
  }
  if (tag === 'table') return tableOf(el)
  if (/^h[1-6]$/.test(tag)) return inlineBlock(el, 'heading', { level: Number(tag[1]) as RichTextBlock['level'] }, marks)
  if (tag === 'p') return inlineBlock(el, 'paragraph', {}, marks)
  if (tag === 'blockquote') {
    const inner = containerBlocks(el, marks, listDepth)
    return inner.map((block) => (block.type === 'paragraph' ? { ...block, type: 'blockquote' } : block))
  }
  if (tag === 'ul' || tag === 'ol') {
    const type = tag === 'ul' ? 'bulleted-list' : 'numbered-list'
    const out: RichTextDocument = []
    for (const li of el.childNodes.filter(isElement).filter((child) => tagOf(child) === 'li')) {
      // A nested list inside the item follows it one level deeper.
      const nested = li.childNodes.filter(isElement).filter((child) => tagOf(child) === 'ul' || tagOf(child) === 'ol')
      const own = new Collector(alignOf(li))
      for (const child of li.childNodes) {
        if (isElement(child) && nested.includes(child)) continue
        walk(child, own, marksOf(li, marks), listDepth)
      }
      own.flush(type, listDepth ? { depth: listDepth } : {})
      out.push(...own.blocks)
      for (const list of nested) out.push(...blocksOf(list, marks, listDepth + 1))
    }
    return out
  }
  return containerBlocks(el, marks, listDepth)
}

/** A wrapper (div, section, a bare figure): its children, inline runs grouped into paragraphs. */
function containerBlocks(el: HTMLElement, marks: Marks, listDepth: number): RichTextDocument {
  const out = new Collector(alignOf(el))
  for (const child of el.childNodes) walk(child, out, marksOf(el, marks), listDepth)
  out.flush()
  return out.blocks
}

function closestLink(img: HTMLElement, stop: HTMLElement | null): HTMLElement | undefined {
  let node = img.parentNode as HTMLElement | null
  while (node && node !== stop?.parentNode) {
    if (tagOf(node) === 'a') return node
    node = node.parentNode as HTMLElement | null
  }
  return undefined
}

const px = (value: string | undefined): number | undefined => {
  const match = value?.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? Math.round(Number(match[1])) : undefined
}

/**
 * The file a content picture is shown from. Divi points `src` at the original
 * upload - often a 2560px `-scaled` file of several megabytes - while the post
 * column is never wider than 1080px; the srcset's smallest variant that is
 * still at least 1024px wide looks the same and is a fraction of the size.
 */
function displaySrc(img: HTMLElement): string | undefined {
  const src = img.getAttribute('src') ?? img.getAttribute('data-src')
  const candidates = (img.getAttribute('srcset') ?? '')
    .split(',')
    .map((part) => part.trim().split(/\s+/))
    .map(([url, size]) => ({ url, width: Number(size?.replace(/w$/, '')) }))
    .filter((candidate) => candidate.url && candidate.width >= 1024)
    .sort((a, b) => a.width - b.width)
  return candidates[0]?.url ?? src
}

function imageOf(img: HTMLElement, link?: HTMLElement, caption?: string): RichTextDocument {
  const src = mapImage(displaySrc(img))
  if (!src) {
    problem(`image not in the mirror: ${img.getAttribute('src')}`)
    return []
  }
  // A width the editor set by hand (`style="width:135px"`) is what the picture showed at.
  const width = px(styleOf(img, 'width')) ?? (Number(img.getAttribute('width')) || undefined)
  const height = px(styleOf(img, 'width')) ? undefined : Number(img.getAttribute('height')) || undefined
  const href = link ? mapUrl(link.getAttribute('href'), LIGHTBOX_MAX_BYTES) : undefined
  return [
    {
      id: newId(),
      type: 'image',
      image: clean({ src, alt: img.getAttribute('alt') ?? '', caption: caption || undefined, href, width, height }),
      runs: [{ text: '' }],
    },
  ]
}

function galleryOf(items: { img: HTMLElement; link?: HTMLElement }[]): RichTextDocument {
  const gallery: RichGalleryItem[] = []
  for (const { img, link } of items) {
    const src = mapImage(img.getAttribute('src'))
    if (!src) {
      problem(`gallery image not in the mirror: ${img.getAttribute('src')}`)
      continue
    }
    const full = link ? mapImage(link.getAttribute('href'), LIGHTBOX_MAX_BYTES) ?? undefined : undefined
    gallery.push(clean({ src, alt: img.getAttribute('alt') ?? '', full: full && full !== src ? full : undefined }))
  }
  return gallery.length ? [{ id: newId(), type: 'gallery', gallery, runs: [{ text: '' }] }] : []
}

function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`
}

function embedOf(iframe: HTMLElement): RichTextDocument {
  let src = (iframe.getAttribute('src') ?? iframe.getAttribute('data-src') ?? '').trim()
  if (src.startsWith('//')) src = `https:${src}`
  const youtube = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/)
  if (youtube) src = youtubeEmbed(youtube[1])
  if (!isEmbedSrc(src)) {
    problem(`iframe on a host not allowed: ${src}`)
    return src.startsWith('https://')
      ? [{ id: newId(), type: 'paragraph', runs: [{ text: iframe.getAttribute('title') || src, href: src }] }]
      : []
  }
  const width = Number(iframe.getAttribute('width')) || Number(iframe.getAttribute('data-original-width')) || 0
  const height = Number(iframe.getAttribute('height')) || Number(iframe.getAttribute('data-original-height')) || 0
  // A video, or a box Divi/WordPress kept at a ratio (`padding-bottom: 56.25%`): responsive. Anything else keeps its fixed height.
  const ratioBox = (iframe.parentNode as HTMLElement | null)?.getAttribute('style')?.match(/padding-bottom:\s*([\d.]+)%/)
  const aspect = youtube
    ? 9 / 16
    : ratioBox
      ? Number(ratioBox[1]) / 100
      : width > 0 && height > 0 && !(iframe.getAttribute('width') ?? '').includes('%')
        ? height / width
        : undefined
  return [
    {
      id: newId(),
      type: 'embed',
      embed: clean({
        src,
        title: iframe.getAttribute('title') || undefined,
        aspect: aspect ? Math.round(aspect * 10000) / 10000 : undefined,
        height: aspect ? undefined : Math.round(height) || 500,
      }),
      runs: [{ text: '' }],
    },
  ]
}

function tableOf(table: HTMLElement): RichTextDocument {
  const rows = table
    .querySelectorAll('tr')
    .map((tr) => tr.childNodes.filter(isElement).filter((cell) => ['td', 'th'].includes(tagOf(cell))))
    .map((cells) => cells.map((cell) => cell.text.replace(/\s+/g, ' ').trim().slice(0, 2000)))
    .filter((row) => row.length)
  if (!rows.length) return []
  const header = !!table.querySelector('thead') || !!table.querySelector('th')
  return [{ id: newId(), type: 'table', table: { header, rows: rows.slice(0, 100).map((row) => row.slice(0, 30)) }, runs: [{ text: '' }] }]
}

/* -- Divi modules ------------------------------------------------------------ */

function textAlignOf(module: HTMLElement): Align | 'justify' | undefined {
  const name = classesOf(module).find((cls) => cls.startsWith('et_pb_text_align_'))?.slice('et_pb_text_align_'.length)
  return name === 'center' || name === 'right' ? name : name === 'justified' ? 'justify' : undefined
}

/** A module's blocks get the module's alignment unless they carry their own. */
function aligned(blocks: RichTextDocument, align: Align | 'justify' | undefined): RichTextDocument {
  if (!align) return blocks
  return blocks.map((block) => (block.align || ['image', 'gallery', 'embed', 'table'].includes(block.type) ? block : { ...block, align }))
}

const heading = (text: string, level: RichTextBlock['level'] = 4): RichTextBlock[] =>
  text.trim() ? [{ id: newId(), type: 'heading', level, runs: [{ text: text.replace(/\s+/g, ' ').trim() }] }] : []

const DATE_TIME = new Intl.DateTimeFormat('hu-HU', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Budapest' })

function moduleBlocks(module: HTMLElement): RichTextDocument {
  const is = (name: string) => hasClass(module, name)
  const inner = (selector: string) => module.querySelector(selector)
  const from = (selector: string) => {
    const el = inner(selector)
    return el ? containerBlocks(el, {}, 0) : []
  }

  if (is('et_pb_text')) return aligned(from('.et_pb_text_inner'), textAlignOf(module))
  if (is('et_pb_divider')) return []
  if (is('et_pb_image')) {
    const img = inner('img')
    return img ? imageOf(img, closestLink(img, module)) : []
  }
  if (is('et_pb_gallery')) {
    return galleryOf(module.querySelectorAll('.et_pb_gallery_image').flatMap((item) => {
      const img = item.querySelector('img')
      return img ? [{ img, link: item.querySelector('a') ?? undefined }] : []
    }))
  }
  if (is('et_pb_button_module_wrapper') || is('et_pb_button')) {
    const link = tagOf(module) === 'a' ? module : inner('a.et_pb_button')
    if (!link) return []
    return [{ id: newId(), type: 'paragraph', runs: [{ text: link.text.trim(), href: mapUrl(link.getAttribute('href')), bold: true }] }]
  }
  if (is('et_pb_blurb')) {
    const img = inner('.et_pb_main_blurb_image img')
    return aligned(
      [
        ...(img ? imageOf(img, closestLink(img, module)) : []),
        ...heading(inner('.et_pb_module_header')?.text ?? ''),
        ...from('.et_pb_blurb_description'),
      ],
      textAlignOf(module),
    )
  }
  if (is('et_pb_toggle')) return [...heading(inner('.et_pb_toggle_title')?.text ?? '', 5), ...from('.et_pb_toggle_content')]
  if (is('et_pb_team_member')) {
    const img = inner('.et_pb_team_member_image img')
    const position = inner('.et_pb_member_position')?.text.trim()
    return [
      ...(img ? imageOf(img) : []),
      ...heading(inner('.et_pb_module_header')?.text ?? ''),
      ...(position ? [{ id: newId(), type: 'paragraph' as const, runs: [{ text: position, italic: true }] }] : []),
      ...from('.et_pb_team_member_description > div'),
    ]
  }
  if (is('et_pb_testimonial')) {
    const author = inner('.et_pb_testimonial_author')?.text.trim()
    return aligned(
      [
        ...from('.et_pb_testimonial_content').map((block) => (block.type === 'paragraph' ? { ...block, type: 'blockquote' as const } : block)),
        ...(author ? [{ id: newId(), type: 'paragraph' as const, runs: [{ text: `– ${author}`, bold: true }] }] : []),
      ],
      textAlignOf(module),
    )
  }
  if (is('et_pb_video')) {
    const iframe = inner('iframe')
    if (iframe) return embedOf(iframe)
    // A video Divi had not loaded yet: only the play overlay, its thumbnail naming the YouTube id.
    const thumb = inner('.et_pb_video_overlay')?.getAttribute('style')?.match(/ytimg\.com\/vi\/([\w-]+)\//)
    if (thumb) return [{ id: newId(), type: 'embed', embed: { src: youtubeEmbed(thumb[1]), aspect: 0.5625 }, runs: [{ text: '' }] }]
    const source = inner('source')?.getAttribute('src') ?? inner('video')?.getAttribute('src')
    const file = source ? mapUrl(source) : undefined
    if (file) {
      problem(`self-hosted video kept as a link: ${source}`)
      return [{ id: newId(), type: 'paragraph', runs: [{ text: 'Videó megtekintése', href: file }] }]
    }
    problem('video module empty in the mirror too - dropped')
    return []
  }
  if (is('et_pb_code')) return from('.et_pb_code_inner')
  if (is('et_pb_countdown_timer')) {
    const title = inner('.title')?.text.trim() ?? ''
    const end = Number(module.getAttribute('data-end-timestamp'))
    const when = end ? DATE_TIME.format(new Date(end * 1000)) : ''
    return [{ id: newId(), type: 'paragraph', runs: [{ text: [title, when].filter(Boolean).join(': '), bold: true }] }]
  }
  problem(`unknown module, kept as text: ${classesOf(module).slice(0, 3).join(' ')}`)
  return containerBlocks(module, {}, 0)
}

function diviContent(builder: HTMLElement): RichTextDocument {
  // Modules never nest, but a button sits in a wrapper that is a module too.
  const modules = builder
    .querySelectorAll('.et_pb_module')
    .filter((module) => !hasAncestorModule(module, builder))
  return modules.flatMap(moduleBlocks)
}

function hasAncestorModule(el: HTMLElement, stop: HTMLElement): boolean {
  let node = el.parentNode as HTMLElement | null
  while (node && node !== stop) {
    if (hasClass(node, 'et_pb_module')) return true
    node = node.parentNode as HTMLElement | null
  }
  return false
}

/* -- the post ------------------------------------------------------------------ */

const MONTHS: Record<string, number> = {
  jan: 1, febr: 2, feb: 2, márc: 3, ápr: 4, máj: 5, jún: 6, júl: 7, aug: 8, szept: 9, okt: 10, nov: 11, dec: 12,
}

/**
 * "2023. okt 17." - the theme's date, the only one the page carries. Noon in
 * Budapest, plus the WordPress post id in seconds, so posts of the same day
 * keep the order WordPress gave them.
 */
function parseDate(text: string, postId: number): string {
  const match = text.trim().match(/^(\d{4})\.\s*([a-záéíóöőúüű]+)\.?\s*(\d{1,2})\./i)
  const month = match ? MONTHS[match[2].toLowerCase()] : undefined
  if (!match || !month) throw new Error(`unreadable date: ${text}`)
  const noon = Date.UTC(Number(match[1]), month - 1, Number(match[3]), 10, 0, 0)
  return new Date(noon + (postId % 3600) * 1000).toISOString()
}

/** WordPress's own rule for a post with no excerpt: the first 55 words of the text. */
function excerptOf(content: RichTextDocument): string {
  const words = content
    .filter((block) => !['image', 'gallery', 'embed', 'table', 'heading'].includes(block.type))
    .map((block) => block.runs.map((run) => run.text).join(''))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
  return words.length > 55 ? `${words.slice(0, 55).join(' ')}...` : words.join(' ')
}

function postDirs(): string[] {
  return readdirSync(MIRROR_ROOT).filter((dir) => {
    const file = join(MIRROR_ROOT, dir, 'index.html')
    return existsSync(file) && /<body[^>]*\bsingle-post\b/.test(readFileSync(file, 'utf8'))
  })
}

function authorAccounts(): Map<string, string> {
  const byName = new Map(allUsers().map((user) => [user.displayName, user.id]))
  return byName
}

/** An author of the old site: a Hírkezelő account with no rights at all, so it can never sign in to anything. */
function authorId(name: string, accounts: Map<string, string>): string {
  const existing = accounts.get(name)
  if (existing) return existing
  const id = randomUUID()
  const username =
    'regi.' +
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.|\.$/g, '')
  insertUser({ id, username, displayName: name, permissions: [], passwordHash: bcrypt.hashSync(randomBytes(24).toString('hex'), 10) })
  accounts.set(name, id)
  return id
}

function importAll(): void {
  seedInitialUsers()
  seedInitialTerms()

  const categoriesByRoute = new Map(
    allTerms()
      .filter((term) => term.kind === 'category' && term.route)
      .map((term) => [term.route!, term.id]),
  )
  const fallbackCategory = categoriesByRoute.get('/kategoria/hirek/')
  const accounts = authorAccounts()
  const taken = existingSlugs()

  const dirs = postDirs()
  let imported = 0
  let skipped = 0
  const now = new Date().toISOString()

  const run = db.transaction(() => {
    for (const dir of dirs) {
      const slug = decodeURIComponent(dir)
      currentSlug = slug
      if (taken.has(slug)) {
        skipped += 1
        continue
      }

      const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))
      const article = root.querySelector('#left-area article')
      if (!article) throw new Error(`${dir}: no post article`)
      const summary = summaries[slug]
      if (!summary) problem('in no list of the mirror (no summary in src/data/posts.ts) - excerpt taken from the text')

      const title = article.querySelector('.entry-title')?.text.trim() ?? summary?.title ?? slug
      const wpId = Number(article.getAttribute('id')?.replace(/^post-/, '')) || summary?.id || 0
      const date = parseDate(article.querySelector('.post-meta .published')?.text ?? summary?.date ?? '', wpId)

      const categoryIds = [
        ...new Set(
          article
            .querySelectorAll('.post-meta a[rel~="category"]')
            .map((link) => categoriesByRoute.get(mapUrl(link.getAttribute('href')) ?? ''))
            .filter((id): id is string => !!id),
        ),
      ]
      if (!categoryIds.length) {
        problem('no known category - filed under Hírek')
        if (fallbackCategory) categoryIds.push(fallbackCategory)
      }

      const entry = article.querySelector('.entry-content')
      if (!entry) throw new Error(`${dir}: no entry content`)
      const builder = entry.querySelector('.et_builder_inner_content')
      const content = builder ? diviContent(builder) : containerBlocks(entry, {}, 0)
      if (!content.length) problem('no content')

      const post: Post = {
        id: randomUUID(),
        slug,
        title,
        content: content.length ? content : [{ id: newId(), type: 'paragraph', runs: [{ text: '' }] }],
        excerpt: summary?.archiveExcerpt ?? summary?.excerpt ?? excerptOf(content),
        categoryIds,
        tagIds: [],
        origin: 'mirror',
        authorId: authorId(summary?.author?.name ?? 'petrik.hu', accounts),
        status: STATUS.PUBLISH,
        createdAt: date,
        modifiedAt: now,
        date,
      }
      insertPost(post)
      logAudit(post.id, 'imported', '', STATUS.PUBLISH, `A régi petrik.hu-ról: /${slug}/`)
      imported += 1
    }
  })
  run()

  console.log(`mirror: ${MIRROR_ROOT}`)
  console.log(`${dirs.length} posts in the mirror: ${imported} imported, ${skipped} skipped (already in the database)`)
  console.log(`${copied.size} files copied to ${join(UPLOADS_DIR, 'mirror')}`)
  if (problems.size) {
    console.log('\nnot mapped one to one:')
    for (const [slug, list] of problems) {
      for (const what of new Set(list)) console.log(`  ${slug}: ${what}`)
    }
  }
}

importAll()
