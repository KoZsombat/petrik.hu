/**
 * Compares the text a ported page renders with the text the mirror renders.
 *
 * Geometry checks catch layout drift; this catches the other half - content
 * that was dropped, duplicated or reordered while walking the Divi tree.
 *
 *   node --experimental-strip-types scripts/check-text.ts [page-dir ...]
 *
 * With no arguments it checks every page in the map. Both servers have to be
 * running: the Vite dev server on 5173 and the mirror on 8899.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MIRRORED } from './pages.ts'

const CHROME =
  process.env.CHROME_PATH ??
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1243/chrome-win64/chrome.exe')

const PORT = 9388
const APP = 'http://localhost:5173'
const MIRROR = 'http://localhost:8899'

async function attach(): Promise<WebSocket> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = (await res.json()) as { type: string; webSocketDebuggerUrl: string }[]
      const page = targets.find((target) => target.type === 'page')
      if (page) {
        const socket = new WebSocket(page.webSocketDebuggerUrl)
        await new Promise((resolve, reject) => {
          socket.onopen = resolve
          socket.onerror = reject
        })
        return socket
      }
    } catch {
      /* browser not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('could not attach to Chromium')
}

let messageId = 0
function send(socket: WebSocket, method: string, params: unknown): Promise<{ result?: { value?: unknown } }> {
  messageId += 1
  const id = messageId
  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(String(event.data))
      if (message.id === id) {
        socket.removeEventListener('message', onMessage)
        resolve(message.result)
      }
    }
    socket.addEventListener('message', onMessage)
    socket.send(JSON.stringify({ id, method, params }))
  })
}

/**
 * The visible text of the page body, one block element per line.
 *
 * Splitting on block boundaries is what makes the two sides comparable: the
 * mirror's HTML has newlines between its block tags, which textContent turns
 * into spaces, while JSX renders the same blocks with nothing between them.
 * Normalising per block keeps that difference out of the way while still
 * catching a space lost inside a sentence.
 */
const TEXT_EXPRESSION = `(() => {
  // Docs pages have no #main-content on either side: BetterDocs replaced the
  // theme's content area wholesale, so the comparable root is its wrapper.
  const root = document.querySelector('#main-content, .betterdocs-wrapper')
  if (!root) return ''
  const clone = root.cloneNode(true)
  // Removed on both sides because they are known, deliberate differences:
  //  - icon-font glyphs are decoration, and the two sides space them differently
  //  - a card for a post outside this port shows a note where the mirror shows
  //    its "bővebben" link, since linking into a 404 would be worse
  const IGNORED = [
    'script',
    'style',
    '.et-pb-icon',
    '.et_overlay',
    '.post-unavailable-note',
    '.more-link',
    '.pagination',
    //  - the search spinner has nothing to wait for without the plugin's ajax
    '.docs-search-loader',
    //  - the reading-time clock is an inline SVG, not text
    '.reading-time svg',
    //  - the two password-protected documents: the mirror shows WordPress's
    //    login form, the port shows a note saying so, and neither can be the
    //    document itself
    '.docs-protected-note',
    '.et_password_protected_form',
  ].join(', ')
  for (const el of clone.querySelectorAll(IGNORED)) el.remove()
  // A Divi module body can hold a bare string with no paragraph around it, and
  // two such modules are separate boxes on the page. Wrapping those loose runs
  // in a paragraph - on both sides - makes them count as blocks like the rest.
  for (const body of clone.querySelectorAll('.et_pb_text_inner, .et_pb_blurb_description')) {
    for (const node of Array.from(body.childNodes)) {
      if (node.nodeType !== 3) continue
      const text = (node.textContent || '').trim()
      if (!text) continue
      const wrapper = document.createElement('p')
      wrapper.textContent = text
      body.replaceChild(wrapper, node)
    }
  }
  const BLOCKS =
    'p,h1,h2,h3,h4,h5,h6,li,td,th,caption,blockquote,figcaption,.et_pb_button,.et_pb_sum'
  const blocks = clone.querySelectorAll(BLOCKS)
  const lines = blocks.length
    ? Array.from(blocks, (el) => el.textContent || '')
    : [clone.textContent || '']
  // Text that sits outside any block element still has to be accounted for.
  for (const el of blocks) el.remove()
  const leftover = clone.textContent || ''
  return [...lines, leftover]
    .map((line) => line.replace(/\\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\\n')
})()`

async function textAt(socket: WebSocket, url: string): Promise<string> {
  await send(socket, 'Page.navigate', { url })
  await new Promise((resolve) => setTimeout(resolve, 2500))
  const result = await send(socket, 'Runtime.evaluate', {
    expression: TEXT_EXPRESSION,
    returnByValue: true,
  })
  return String(result.result?.value ?? '')
}

/** First position where two strings diverge, with a little context. */
function firstDifference(a: string, b: string): string {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1
  const from = Math.max(0, i - 60)
  return [
    `  at character ${i}:`,
    `    app:    …${a.slice(from, i + 90)}`,
    `    mirror: …${b.slice(from, i + 90)}`,
  ].join('\n')
}

/**
 * Every mirrored route, from the one enumeration in pages.ts. The archives and
 * the document library's listings have no component file of their own - one
 * view renders all of them - so they are not in PAGES, but their URLs line up
 * with the mirror exactly.
 */
const ALL = MIRRORED


/**
 * With no arguments every page is checked, which is now 117 of them and takes
 * several minutes. `--only=docs` narrows it to one kind while working on that
 * kind; naming directories still picks out individual pages.
 */
const args = process.argv.slice(2)
const only = args.find((arg) => arg.startsWith('--only='))?.slice('--only='.length)
const wanted = args.filter((arg) => !arg.startsWith('--'))

const pages = wanted.length
  ? ALL.filter((page) => wanted.includes(page.dir || 'home'))
  : only
    ? ALL.filter((page) => page.kind === only)
    : ALL

const profile = mkdtempSync(join(tmpdir(), 'text-'))
const browser = spawn(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,900',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])

const socket = await attach()
let failures = 0

for (const page of pages) {
  const app = await textAt(socket, APP + page.route)
  const mirror = await textAt(socket, `${MIRROR}/${page.dir}${page.dir ? '/' : ''}`)
  const label = (page.dir || 'home').padEnd(38)

  if (app === mirror) {
    console.log(`${label} ok  (${app.length} chars)`)
    continue
  }
  failures += 1
  console.log(`${label} DIFF app ${app.length} vs mirror ${mirror.length} chars`)
  console.log(firstDifference(app, mirror))
}

console.log(`\n${pages.length - failures}/${pages.length} pages render identical text`)
browser.kill()
process.exit(failures ? 1 : 0)
