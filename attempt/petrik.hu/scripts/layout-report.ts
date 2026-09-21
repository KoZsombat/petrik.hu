/**
 * Measures every ported page against the mirror and reports, per page, the
 * largest deviation in position and size.
 *
 * measure.ts answers "where exactly does this element differ"; this answers
 * "which pages still differ at all, and by how much", which is the table
 * AGENT.md section 8.2 needs and the thing that goes stale fastest.
 *
 *   node --experimental-strip-types scripts/layout-report.ts [--only=<kind>] [width]
 *
 * Needs both servers (see AGENT.md section 3). Takes a few seconds per page.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PAGES } from './pages.ts'
import { archives } from '../src/data/archives.ts'

const CHROME =
  process.env.CHROME_PATH ??
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1243/chrome-win64/chrome.exe')

const PORT = 9344
const APP = 'http://localhost:5173'
const MIRROR = 'http://localhost:8899'

/**
 * What to compare. Deliberately broad - every element that carries a box the
 * reader can see - but excluding the parts the port knowingly leaves out, which
 * would otherwise make the element counts differ and stop the comparison dead.
 */
const SELECTOR = [
  // Divi's structural boxes, which the port reproduces one for one, plus the
  // theme's listing markup. Comparing every descendant instead sounds stricter
  // but is weaker: the port flattens some of the editor's wrapper divs, so the
  // two sides stop corresponding and the numbers become noise.
  '.et_pb_section',
  '.et_pb_row',
  '.et_pb_column',
  '.et_pb_module',
  '#left-area',
  '#sidebar',
  '#left-area > article',
  '.pagination',
  '.betterdocs-content-area',
  '.betterdocs-entry-header',
  '.betterdocs-entry-content',
  '#betterdocs-sidebar',
  '#betterdocs-breadcrumb',
  '.reading-time',
  '.docs-navigation',
].join(', ')

const SKIP = [
  '.et_overlay',
  '.post-unavailable-note',
  '.more-link',
  '.betterdocs-entry-footer',
  '.betterdocs-entry-footer *',
  '.shared-counts-wrap',
  '.shared-counts-wrap *',
  '.docs-search-loader',
  '.et_password_protected_form',
  '.et_password_protected_form *',
  '.docs-protected-note',
  '.docs-protected-note *',
  '.betterdocs-search-clear',
  '.betterdocs-search-clear *',
  '.betterdocs-category-collapse-button',
  '.pagination-unavailable',
].join(', ')

type Box = { tag: string; x: number; y: number; w: number; h: number }

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

let nextId = 1
function send(socket: WebSocket, method: string, params: unknown): Promise<{ result?: { value?: unknown } }> {
  const id = nextId
  nextId += 1
  return new Promise((ok) => {
    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(String(event.data))
      if (message.id !== id) return
      socket.removeEventListener('message', onMessage)
      ok(message.result)
    }
    socket.addEventListener('message', onMessage)
    socket.send(JSON.stringify({ id, method, params }))
  })
}

const EXPRESSION = `(() => {
  const skip = new Set(Array.from(document.querySelectorAll(${JSON.stringify(SKIP)})))
  return Array.from(document.querySelectorAll(${JSON.stringify(SELECTOR)}))
    .filter((el) => !skip.has(el))
    .map((el) => {
      const r = el.getBoundingClientRect()
      return {
        tag: el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : ''),
        x: Math.round(r.x * 10) / 10,
        y: Math.round((r.y + window.scrollY) * 10) / 10,
        w: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
      }
    })
})()`

async function boxesAt(socket: WebSocket, url: string): Promise<Box[]> {
  await send(socket, 'Page.navigate', { url })
  await new Promise((ok) => setTimeout(ok, 2600))
  const result = await send(socket, 'Runtime.evaluate', {
    expression: EXPRESSION,
    returnByValue: true,
  })
  return (result.result?.value ?? []) as Box[]
}

const args = process.argv.slice(2)
const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length)
const width = Number(args.find((a) => /^[0-9]+$/.test(a)) ?? 1440)

type Target = { label: string; route: string; dir: string; kind: string }
const targets: Target[] = [
  ...PAGES.map((page) => ({
    label: page.dir || 'home',
    route: page.route,
    dir: page.dir,
    kind: page.kind,
  })),
  ...Object.values(archives).map((archive) => ({
    label: archive.route.replace(/^\/|\/$/g, ''),
    route: archive.route,
    dir: archive.route.replace(/^\/|\/$/g, ''),
    kind: 'archive',
  })),
].filter((target) => !only || target.kind === only)

const profile = mkdtempSync(join(tmpdir(), 'layout-'))
const browser = spawn(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])

const socket = await connect()
await send(socket, 'Emulation.setDeviceMetricsOverride', {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: width <= 980,
})

console.log(`Largest deviation per page at ${width}px. App minus mirror, in pixels.\n`)
console.log('page                                 pairs  max|dx| max|dy| max|dw| max|dh|')

let clean = 0
const mismatched: string[] = []
/** Elements present on one side only, which are reported but not compared. */
const unmatchedTotal = new Map<string, number>()

for (const target of targets) {
  const mirror = await boxesAt(socket, `${MIRROR}/${target.dir}${target.dir ? '/' : ''}`)
  const app = await boxesAt(socket, APP + target.route)

  /*
   * Paired by tag and first class plus the count of that key so far, not by
   * position in the list. Pairing by position is what measure.ts refuses to do
   * for good reason: one extra element early on shifts every later pair, and
   * the report then compares a heading against a sidebar and prints a
   * thousand-pixel difference that means nothing.
   */
  const index = (boxes: Box[]) => {
    const seen = new Map<string, number>()
    const out = new Map<string, Box>()
    for (const box of boxes) {
      const n = seen.get(box.tag) ?? 0
      seen.set(box.tag, n + 1)
      out.set(`${box.tag}#${n}`, box)
    }
    return out
  }
  const left = index(mirror)
  const right = index(app)
  const shared = [...left.keys()].filter((key) => right.has(key))
  const unpaired = left.size + right.size - 2 * shared.length

  if (!shared.length) {
    mismatched.push(`${target.label} (nothing pairable)`)
    console.log(`${target.label.padEnd(38)} nothing pairable`)
    continue
  }

  let dx = 0
  let dy = 0
  let dw = 0
  let dh = 0
  for (const key of shared) {
    const a = right.get(key)!
    const m = left.get(key)!
    dx = Math.max(dx, Math.abs(a.x - m.x))
    dy = Math.max(dy, Math.abs(a.y - m.y))
    dw = Math.max(dw, Math.abs(a.w - m.w))
    dh = Math.max(dh, Math.abs(a.h - m.h))
  }
  if (unpaired) unmatchedTotal.set(target.label, unpaired)
  const worst = Math.max(dx, dy, dw, dh)
  if (worst === 0) clean += 1
  const cell = (n: number) => n.toFixed(1).padStart(7)
  const odd = unmatchedTotal.get(target.label)
  console.log(
    `${target.label.padEnd(38)} ${String(shared.length).padStart(4)} ` +
      `${cell(dx)} ${cell(dy)} ${cell(dw)} ${cell(dh)}` +
      `${worst === 0 ? '  ok' : ''}${odd ? `  (${odd} unpaired)` : ''}`,
  )
}

console.log(
  `\n${clean}/${targets.length - mismatched.length} compared pages match exactly` +
    (mismatched.length ? `; ${mismatched.length} could not be compared` : ''),
)
browser.kill()
process.exit(0)
