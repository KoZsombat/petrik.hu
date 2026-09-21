/**
 * Builds a component stylesheet out of the rules the mirror actually applied.
 *
 * The theme's and the plugins' styling is spread over cached bundles and inline
 * blocks that run to hundreds of kilobytes, and they carry alternative layouts
 * whose selectors look applicable but never match this site's markup. Picking
 * rules out of that by hand is how AGENT.md's "do not invent CSS" rule gets
 * broken by accident, so this asks the browser instead: it walks every element
 * under a root and keeps the rules that actually matched, in cascade order.
 *
 *   node --experimental-strip-types scripts/collect-css.ts <preset>
 *
 * Presets are defined below. Each one names the pages to visit, the root the
 * walk starts from, which selectors are worth keeping, and where to write.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { PROJECT_ROOT } from './mirror.ts'

const CHROME =
  process.env.CHROME_PATH ??
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1243/chrome-win64/chrome.exe')

const PORT = 9355
const MIRROR = 'http://localhost:8899'

type Preset = {
  /** Pages to visit. Two templates styled separately need one entry each. */
  pages: string[]
  /** The subtree to collect from. */
  root: string
  /** A rule is kept when its selector mentions one of these. */
  keep: string[]
  /** ... unless it also mentions one of these, for parts not ported. */
  drop: string[]
  /**
   * A class put on the page's root element, and woven into every selector, so
   * the rules cannot reach any other page. Divi and its plugins style generic
   * classes like .et_pb_post that other components also render.
   */
  scope?: { className: string; root: string }
  out: string
}

const PRESETS: Record<string, Preset> = {
  docs: {
    pages: [
      `${MIRROR}/docs/hazirend/`,
      `${MIRROR}/docs/akadalymentesitesi-nyilatkozat/`,
      `${MIRROR}/dokumentumtar/`,
      `${MIRROR}/dokumentum-kategoria/szabalyzatok-es-hazirendek/`,
    ],
    root: '.betterdocs-wrapper, .betterdocs-wrapper *',
    keep: [
      'betterdocs',
      'docs-navigation',
      'docs-search',
      'reading-time',
      'wp-block-file',
      'feedback-update-form',
    ],
    // Only the search spinner, which has nothing to wait for without the
    // plugin's ajax. The reactions footer is rendered inert, so it is styled.
    drop: ['docs-search-loader'],
    out: 'src/components/docs/betterdocs.css',
  },
  /**
   * The theme's two-column frame: content column, sidebar, and the hairline
   * between them. Shared by every page that has a sidebar - the archives, the
   * single post, the classic WordPress page and the search results - so it is
   * global and keyed on the body classes the theme itself used.
   */
  frame: {
    pages: [
      `${MIRROR}/kategoria/hirek/`,
      `${MIRROR}/kutatok-ejszakaja-a-petrikben/`,
      // The classic WordPress page: same frame, but it is the only one of the
      // three with a `.main_title` heading.
      `${MIRROR}/adatkezelesi-tajekoztato/`,
    ],
    root: '#main-content, #main-content *',
    // `main_title` is the page heading on a classic WordPress page. It is not
    // reachable through any of the id tokens above, and the one rule on it -
    // a 20px bottom margin - is what separates the heading from the body.
    // `.main_title` is the page heading on a classic WordPress page. It is not
    // reachable through any of the id tokens above, and the one rule on it -
    // a 20px bottom margin - is what separates the heading from the body. The
    // leading dot matters: without it the token also matches the theme's
    // `h1.et_pb_contact_main_title` rule, which would put a global font-size
    // for every h1 into this shared stylesheet.
    keep: ['#left-area', '#sidebar', '#content-area', '#main-content', '.main_title'],
    drop: [],
    out: 'src/styles/sidebar-layout.css',
  },
  /** The share bar under the single post, which is rendered but inert. */
  share: {
    pages: [`${MIRROR}/kutatok-ejszakaja-a-petrikben/`],
    root: '.shared-counts-wrap, .shared-counts-wrap *',
    keep: ['shared-counts'],
    drop: [],
    out: 'src/components/SharedCounts.css',
  },
  /**
   * The single post's title block. Its rules are keyed on `body.single`, which
   * is why they need a pass of their own: no selector here mentions #left-area
   * or any of the other tokens the frame preset looks for.
   */
  post: {
    pages: [`${MIRROR}/kutatok-ejszakaja-a-petrikben/`],
    root: '.et_post_meta_wrapper, .et_post_meta_wrapper *',
    keep: ['et_post_meta_wrapper'],
    drop: [],
    out: 'src/components/PostHeader.css',
  },
  /**
   * The home page's fullwidth slider and gallery. Both were written from a
   * guess at first - the slider's inner height in particular - so they are
   * collected properly here.
   */
  slider: {
    pages: [`${MIRROR}/`],
    root: '.et_pb_slider, .et_pb_slider *',
    keep: ['et_pb_slide', 'et_pb_slider', 'et_pb_container', 'et_parallax', 'et-pb-'],
    drop: [],
    out: 'src/components/divi/HeroSlider.css',
  },
  /*
   * The gallery. This was wired up, then backed out again when the collected
   * rules gave a module of zero height, then wired up for good once the reason
   * was clear - two of them, and neither was the rules:
   *
   *   - `.et_pb_gallery_grid .et_pb_gallery_item` is `display: none`, and Divi's
   *     script put `display: block` back on the items of the current page. The
   *     component now writes that inline, as the script did.
   *   - the module's only width rule is scoped to the column it sits in
   *     (`.et_pb_gutters3 .et_pb_column_1_6 .et_pb_grid_item`), and the per-page
   *     guard was throwing it away. See STRUCTURAL_RE.
   */
  gallery: {
    pages: [`${MIRROR}/`],
    root: '.et_pb_gallery, .et_pb_gallery *',
    keep: ['et_pb_gallery', 'et_pb_grid_item', 'et_overlay'],
    drop: [],
    out: 'src/components/divi/Gallery.css',
  },
  archive: {
    // One of each family: the query differs, the template does not.
    pages: [
      `${MIRROR}/kategoria/hirek/`,
      `${MIRROR}/kategoria/egyeb/page/2/`,
      `${MIRROR}/2026/09/15/`,
      `${MIRROR}/author/galberey/`,
    ],
    root: '#left-area, #left-area *',
    // The frame is collected separately; this is the listing itself.
    keep: [
      'entry-featured-image-url',
      'entry-title',
      'post-meta',
      'pagination',
      'et_pb_post',
    ],
    drop: [],
    scope: { className: 'archive-view', root: '#main-content' },
    out: 'src/components/ArchiveView.css',
  },
}

/**
 * Widths to visit. The browser reports only the rules that match right now, so
 * a rule inside a media query is invisible unless the viewport is inside it -
 * collecting at one width would silently drop the whole responsive layer.
 * These are the theme's and the plugins' breakpoints, plus a phone width.
 */
const WIDTHS = [1440, 1100, 980, 900, 767, 479]

const presetName = process.argv[2] ?? ''
const preset = PRESETS[presetName]
if (!preset) {
  console.error(`usage: collect-css.ts <${Object.keys(PRESETS).join('|')}>`)
  process.exit(1)
}

async function connect(): Promise<WebSocket> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = (await res.json()) as { type: string; webSocketDebuggerUrl: string }[]
      const page = targets.find((t) => t.type === 'page')
      if (page) {
        const socket = new WebSocket(page.webSocketDebuggerUrl)
        await new Promise((ok, fail) => {
          socket.onopen = ok
          socket.onerror = fail
        })
        return socket
      }
    } catch {
      /* browser not up yet */
    }
    await new Promise((ok) => setTimeout(ok, 250))
  }
  throw new Error('could not attach to Chromium')
}

/**
 * The slice of the DevTools protocol these scripts read back. Typed here
 * rather than left as `any` so a change in the protocol shows up as a type
 * error instead of an empty stylesheet.
 */
type CdpRule = {
  origin: string
  selectorList?: { text: string; selectors: { text: string }[] }
  style?: { cssText?: string; range?: { startLine: number; startColumn: number } }
  styleSheetId: string
  media?: { text: string }[]
}
type CdpMatch = { rule: CdpRule; matchingSelectors?: number[] }
type CdpStyles = {
  matchedCSSRules?: CdpMatch[]
  pseudoElements?: { matches?: CdpMatch[] }[]
  inlineStyle?: { cssText?: string }
}
type CdpNode = { root: { nodeId: number } }
type CdpNodes = { nodeIds: number[] }

let nextId = 1
function send<T>(socket: WebSocket, method: string, params: unknown = {}): Promise<T> {
  const id = nextId
  nextId += 1
  return new Promise((ok, fail) => {
    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(String(event.data))
      if (message.id !== id) return
      socket.removeEventListener('message', onMessage)
      if (message.error) fail(new Error(`${method}: ${message.error.message}`))
      else ok(message.result)
    }
    socket.addEventListener('message', onMessage)
    socket.send(JSON.stringify({ id, method, params }))
  })
}

type Collected = { order: string; media: string; selector: string; body: string }

/**
 * Ancestors of the page rather than parts of it. The theme writes selectors
 * from the document root down, so a scope class put in front of `body …` asks
 * for a <body> inside the page - which cannot exist, and the rule silently
 * matches nothing. The scope goes after them instead. (page-css.ts carries the
 * same list for Divi's per-page stylesheets; that is where this was first hit.)
 */
/** A Divi module class carrying a per-page index, e.g. .et_pb_section_0. */
const PER_PAGE_RE = /\.et_pb_[a-z_]+_[0-9]+/

/*
 * Divi's structural classes carry numbers too, and they are not per-page:
 * .et_pb_column_1_6 is "one sixth wide" and .et_pb_row_6col "six columns", the
 * same on every page. PER_PAGE_RE matches them all the same - it reads
 * .et_pb_column_1 and stops - so they are taken out of the selector before the
 * test runs. This is not hypothetical: the gallery's only width rule is
 * `.et_pb_gutters3 .et_pb_column_1_6 .et_pb_grid_item`, and dropping it left
 * the module with no width at all.
 */
const STRUCTURAL_RE = /\.et_pb_(?:column|row)_(?:[0-9]+_[0-9]+|[0-9]+col)/g

const OUTER = [
  'html',
  'body',
  '.et-db',
  '.et_divi_theme',
  // WordPress put these on <body> too; useBodyClass restores them.
  '.et_right_sidebar',
  '.et_left_sidebar',
  '.et_no_sidebar',
  '#page-container',
  '#et-main-area',
]

/** Weaves the scope class into one selector. */
function scopePart(part: string, scope: NonNullable<Preset['scope']>): string {
  const tokens = part.split(/\s+/)
  let at = 0
  while (at < tokens.length && OUTER.some((outer) => tokens[at].startsWith(outer))) at += 1
  if (at === tokens.length) return part
  // The root element carries the class, so it attaches rather than descends.
  if (tokens[at].startsWith(scope.root)) {
    tokens[at] = tokens[at].replace(scope.root, `${scope.root}.${scope.className}`)
    return tokens.join(' ')
  }
  return [...tokens.slice(0, at), `.${scope.className}`, ...tokens.slice(at)].join(' ')
}

const outPath = resolve(PROJECT_ROOT, preset.out)

const profile = mkdtempSync(join(tmpdir(), 'docs-css-'))
const browser = spawn(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])

const socket = await connect()

await send<void>(socket, 'DOM.enable')
await send<void>(socket, 'CSS.enable')

const collected = new Map<string, Collected>()

for (const [url, width] of preset.pages.flatMap((url) => WIDTHS.map((w): [string, number] => [url, w]))) {
  await send<void>(socket, 'Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width <= 980,
  })
  await send<void>(socket, 'Page.navigate', { url })
  await new Promise((ok) => setTimeout(ok, 2500))

  const { root } = await send<CdpNode>(socket, 'DOM.getDocument', { depth: -1 })
  const { nodeIds } = await send<CdpNodes>(socket, 'DOM.querySelectorAll', {
    nodeId: root.nodeId,
    selector: preset.root,
  })

  for (const nodeId of nodeIds) {
    let styles
    try {
      styles = await send<CdpStyles>(socket, 'CSS.getMatchedStylesForNode', { nodeId })
    } catch {
      continue // node went away between the query and the lookup
    }

    const buckets = [
      { media: '', rules: styles.matchedCSSRules ?? [] },
      ...(styles.pseudoElements ?? []).map((pseudo) => ({
        media: '',
        rules: pseudo.matches ?? [],
      })),
    ]

    for (const bucket of buckets) {
      for (const entry of bucket.rules) {
        const rule = entry.rule
        if (rule.origin !== 'regular') continue
        const selector = rule.selectorList?.text ?? ''
        if (!preset.keep.some((token) => selector.includes(token))) continue
        if (preset.drop.some((token) => selector.includes(token))) continue
        // A Divi module class with a number on it - .et_pb_section_0,
        // .et_pb_text_3 - belongs to one page: Divi numbers modules per page,
        // so the same name means something different on the next one. Those
        // rules are page-css.ts's job, and it scopes them. Letting one into a
        // shared component stylesheet applies the home page's hero height to
        // the first section of every page, which is exactly what happened.
        if (PER_PAGE_RE.test(selector.replace(STRUCTURAL_RE, ''))) continue
        const body = (rule.style?.cssText ?? '').trim()
        if (!body) continue

        const media = (rule.media ?? [])
          .filter((m: { text: string }) => m.text && m.text !== 'all')
          .map((m: { text: string }) => m.text)
          .join(' and ')

        const key = `${media}||${selector}||${body}`
        // Chrome returns a node's rules already in cascade order, weakest
        // first, so the order they are met in is the order they have to be
        // written in. Ranking by stylesheet instead would be wrong: this page
        // interleaves its <link>s with the inline block that overrides them,
        // and the ids change on every reload anyway. Numbering on first
        // sighting keeps what Chrome said, across widths and pages alike.
        if (!collected.has(key)) {
          collected.set(key, { order: String(collected.size).padStart(6, '0'), media, selector, body })
        }
      }
    }
  }
  console.error(`  ${url} @${width}px -> ${collected.size} rules so far`)
}

browser.kill()

/* -- emit ------------------------------------------------------------------ */

const rules = [...collected.values()].sort((a, b) => a.order.localeCompare(b.order))

const lines: string[] = [
  '/*',
  ` * Generated by scripts/collect-css.ts (preset: ${presetName}) - do not edit.`,
  ' *',
  ' * Only the rules the original browser actually matched against the mirrored',
  ' * markup are here, in the order it applied them; the unused alternative',
  ' * layouts the theme and its plugins ship are not.',
  ' */',
  '',
]

let openMedia = ''
for (const rule of rules) {
  if (rule.media !== openMedia) {
    if (openMedia) lines.push('}', '')
    openMedia = rule.media
    if (openMedia) lines.push(`@media ${openMedia} {`)
  }
  const indent = openMedia ? '  ' : ''
  const selector = rule.selector
    .split(',')
    .map((part) => (preset.scope ? scopePart(part.trim(), preset.scope) : part.trim()))
    .join(`,\n${indent}`)
  lines.push(`${indent}${selector} {`)
  for (const decl of rule.body.split(';')) {
    if (decl.trim()) lines.push(`${indent}  ${decl.trim()};`)
  }
  lines.push(`${indent}}`)
}
if (openMedia) lines.push('}')
lines.push('')

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(`collect-css [${presetName}]: ${rules.length} rules -> ${preset.out}`)
process.exit(0)
