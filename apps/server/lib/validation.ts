import type { Align, BlockType, RichTextBlock, RichTextDocument, TextRun } from '../../../shared/pnw/types.ts'
import { COLUMN_SPANS, MODULE_KINDS } from '../../../shared/pnw/page-types.ts'
import type {
  MenuNode,
  ModuleOverride,
  OverrideKind,
  PageColumn,
  PageDocument,
  PageModule,
  PageOverrides,
  PageRow,
  PageSection,
  SiteMenu,
  TextAlign,
} from '../../../shared/pnw/page-types.ts'
import { isSafeColor, isSafeHref } from '../../../shared/pnw/richtext.ts'

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

/* --- the Szerkesztő (AGENT.md 6.19) ---------------------------------------
 *
 * Everything below rebuilds the value from scratch rather than passing the
 * parsed JSON through: unknown keys are dropped, unknown module kinds and
 * non-string content reject the whole document, and every link/colour/image
 * goes through the same allow-list the renderer uses. The JSON columns must
 * never round-trip an untrusted shape into the public renderer.
 */

type Plain = Record<string, unknown>

const isObject = (value: unknown): value is Plain =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const MAX_TEXT = 20_000
const MAX_LABEL = 300
const MAX_ITEMS = 400

class Invalid extends Error {}

function fail(what: string): never {
  throw new Invalid(what)
}

function str(value: unknown, max = MAX_LABEL, what = 'string'): string {
  if (typeof value !== 'string' || value.length > max) fail(what)
  return value
}

function optStr(value: unknown, max = MAX_LABEL): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return str(value, max)
}

function list(value: unknown, what: string): unknown[] {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) fail(what)
  return value
}

function nodeId(value: unknown): string {
  const text = str(value, 64, 'id')
  if (!/^[A-Za-z0-9_-]+$/.test(text)) fail('id')
  return text
}

/** A link target: an in-app route or an http(s)/mailto/tel URL - see isSafeHref(). */
function optHref(value: unknown): string | undefined {
  const text = optStr(value, 2000)
  if (text === undefined) return undefined
  if (!isSafeHref(text)) fail('href')
  return text
}

/** An image: a root-relative path (`/media/...`, `/uploads/...`) or an http(s) URL. */
function imageSrc(value: unknown): string {
  const text = str(value, 2000, 'src')
  const rootRelative = text.startsWith('/') && !text.startsWith('//')
  if (!rootRelative && !/^https?:\/\//i.test(text)) fail('src')
  return text
}

function optColor(value: unknown): string | undefined {
  const text = optStr(value, 64)
  if (text === undefined) return undefined
  if (!isSafeColor(text)) fail('color')
  return text
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], what: string): T {
  if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) fail(what)
  return value as T
}

function optOneOf<T extends string>(value: unknown, allowed: readonly T[], what: string): T | undefined {
  return value === undefined || value === null ? undefined : oneOf(value, allowed, what)
}

const BLOCK_TYPES: readonly BlockType[] = ['paragraph', 'heading', 'bulleted-list', 'numbered-list', 'blockquote']
const BLOCK_ALIGNS = ['left', 'center', 'right', 'justify'] as const
const ALIGNS: readonly Align[] = ['left', 'center', 'right']
const TEXT_ALIGNS: readonly TextAlign[] = ['left', 'center', 'right', 'justified']

function richText(value: unknown): RichTextDocument {
  return list(value, 'content').map((raw) => {
    if (!isObject(raw)) fail('block')
    const block: RichTextBlock = {
      id: nodeId(raw.id),
      type: oneOf(raw.type, BLOCK_TYPES, 'block type'),
      runs: list(raw.runs, 'runs').map((rawRun) => {
        if (!isObject(rawRun)) fail('run')
        const run: TextRun = { text: str(rawRun.text, MAX_TEXT, 'text') }
        if (rawRun.bold === true) run.bold = true
        if (rawRun.italic === true) run.italic = true
        if (rawRun.underline === true) run.underline = true
        const color = optColor(rawRun.color)
        if (color) run.color = color
        const href = optHref(rawRun.href)
        if (href) run.href = href
        return run
      }),
    }
    const align = optOneOf(raw.align, BLOCK_ALIGNS, 'align')
    if (align) block.align = align
    if (raw.level !== undefined && raw.level !== null) {
      if (raw.level !== 1 && raw.level !== 2 && raw.level !== 3 && raw.level !== 4) fail('level')
      block.level = raw.level
    }
    return block
  })
}

function optDimension(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0 || value > 10_000) fail('dimension')
  return value
}

/** A button's `to` is an in-app route only; an external target goes in `href`. */
function optRoute(value: unknown): string | undefined {
  const to = optHref(value)
  if (to && !to.startsWith('/')) fail('route')
  return to
}

function pageModule(raw: unknown): PageModule {
  if (!isObject(raw)) fail('module')
  const id = nodeId(raw.id)
  const kind = oneOf(raw.kind, MODULE_KINDS, 'module kind')

  switch (kind) {
    case 'text':
      return {
        kind,
        id,
        align: optOneOf(raw.align, TEXT_ALIGNS, 'align'),
        bgLayout: optOneOf(raw.bgLayout, ['light', 'dark'] as const, 'bgLayout'),
        content: richText(raw.content),
      }
    case 'image':
      return {
        kind,
        id,
        src: imageSrc(raw.src),
        alt: optStr(raw.alt),
        href: optHref(raw.href),
        width: optDimension(raw.width),
        height: optDimension(raw.height),
      }
    case 'button':
      return {
        kind,
        id,
        label: str(raw.label, MAX_LABEL, 'label'),
        to: optRoute(raw.to),
        href: optHref(raw.href),
        align: optOneOf(raw.align, ALIGNS, 'align'),
      }
    case 'blurb': {
      let image: { src: string; alt?: string } | undefined
      if (raw.image !== undefined && raw.image !== null) {
        if (!isObject(raw.image)) fail('blurb image')
        image = { src: imageSrc(raw.image.src), alt: optStr(raw.image.alt) }
      }
      return {
        kind,
        id,
        title: optStr(raw.title),
        titleHref: optHref(raw.titleHref),
        image,
        icon: optStr(raw.icon, 4),
        content: richText(raw.content),
      }
    }
    case 'divider':
      return { kind, id }
    case 'video': {
      // Empty while the author has not pasted a link yet - it then renders nothing.
      const url = str(raw.url, 2000, 'url')
      if (url && !/^https?:\/\//i.test(url)) fail('url')
      return { kind, id, url }
    }
    case 'toggle':
      return { kind, id, title: str(raw.title, MAX_LABEL, 'title'), content: richText(raw.content) }
  }
}

function pageSection(raw: unknown): PageSection {
  if (!isObject(raw)) fail('section')
  const section: PageSection = {
    id: nodeId(raw.id),
    rows: list(raw.rows, 'rows').map((rawRow) => {
      if (!isObject(rawRow)) fail('row')
      const row: PageRow = {
        id: nodeId(rawRow.id),
        columns: list(rawRow.columns, 'columns').map((rawColumn) => {
          if (!isObject(rawColumn)) fail('column')
          const column: PageColumn = {
            id: nodeId(rawColumn.id),
            span: oneOf(rawColumn.span, COLUMN_SPANS, 'span'),
            modules: list(rawColumn.modules, 'modules').map(pageModule),
          }
          if (rawColumn.bordered === true) column.bordered = true
          return column
        }),
      }
      if (rawRow.gutters === 3 || rawRow.gutters === 4) row.gutters = rawRow.gutters
      return row
    }),
  }
  if (raw.first === true) section.first = true
  if (raw.dividerTop === true) section.dividerTop = true
  if (raw.dividerBottom === true) section.dividerBottom = true
  if (raw.background !== undefined && raw.background !== null) {
    if (!isObject(raw.background)) fail('background')
    const color = optColor(raw.background.color)
    const rawImage = raw.background.image
    const image = rawImage === undefined || rawImage === null || rawImage === '' ? undefined : imageSrc(rawImage)
    if (color || image) section.background = { color, image }
  }
  return section
}

function attempt<T>(build: () => T): T | null {
  try {
    return build()
  } catch (error) {
    if (error instanceof Invalid) return null
    throw error
  }
}

export function sanitizePageDocument(raw: unknown): PageDocument | null {
  return attempt(() => {
    if (!isObject(raw)) fail('document')
    return { sections: list(raw.sections, 'sections').map(pageSection) }
  })
}

function nonNegativeIntegers(value: unknown, what: string): number[] {
  return list(value, what).map((entry) => {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 0) fail(what)
    return entry
  })
}

/**
 * A mirrored page's override layer. The caller has already checked `route`
 * is a mirrored route - this only checks the shape.
 */
export function sanitizePageOverrides(raw: unknown, route: string): PageOverrides | null {
  return attempt(() => {
    if (!isObject(raw) || !isObject(raw.modules)) fail('overrides')
    const entries = Object.entries(raw.modules)
    if (entries.length > MAX_ITEMS) fail('modules')

    const modules: Record<string, ModuleOverride> = {}
    for (const [key, value] of entries) {
      const match = /^(text|image|button|blurb):(\d{1,4})$/.exec(key)
      if (!match || !isObject(value)) fail('module override')
      const kind = match[1] as OverrideKind
      if (kind === 'text') {
        modules[key] = { content: richText(value.content) }
      } else if (kind === 'image') {
        modules[key] = {
          src: value.src === undefined ? undefined : imageSrc(value.src),
          alt: optStr(value.alt),
          href: optHref(value.href),
        }
      } else if (kind === 'button') {
        modules[key] = { label: optStr(value.label), to: optRoute(value.to), href: optHref(value.href) }
      } else {
        modules[key] = {
          title: optStr(value.title),
          content: value.content === undefined ? undefined : richText(value.content),
        }
      }
    }

    const overrides: PageOverrides = {
      route,
      modules,
      hiddenSections: nonNegativeIntegers(raw.hiddenSections ?? [], 'hiddenSections'),
      extraSections: list(raw.extraSections ?? [], 'extraSections').map(pageSection),
    }
    if (raw.sectionOrder !== undefined && raw.sectionOrder !== null) {
      overrides.sectionOrder = nonNegativeIntegers(raw.sectionOrder, 'sectionOrder')
    }
    const title = optStr(raw.title)
    if (title) overrides.title = title
    const description = optStr(raw.description, 1000)
    if (description) overrides.description = description
    if (raw.hidden === true) overrides.hidden = true
    return overrides
  })
}

function menuNodes(value: unknown, depth: number): MenuNode[] {
  return list(value, 'menu').map((raw) => {
    if (!isObject(raw)) fail('menu item')
    const node: MenuNode = { label: str(raw.label, 120, 'label') }
    if (!node.label.trim()) fail('label')
    const to = optRoute(raw.to)
    if (to) node.to = to
    const href = optHref(raw.href)
    if (href && !to) node.href = href
    if (raw.children !== undefined && raw.children !== null) {
      // The theme styles two levels (a dropdown under a top-level item), no deeper.
      if (depth > 0) fail('menu depth')
      node.children = menuNodes(raw.children, depth + 1)
    }
    return node
  })
}

/** The top bar's menu is flat (depth starts at 1, so it may not have children). */
export function sanitizeSiteMenu(raw: unknown): SiteMenu | null {
  return attempt(() => {
    if (!isObject(raw)) fail('menu')
    return { primary: menuNodes(raw.primary, 0), secondary: menuNodes(raw.secondary, 1) }
  })
}
