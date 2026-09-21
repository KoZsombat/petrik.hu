/**
 * Lists every CSS rule the browser actually matches against an element.
 *
 * AGENT.md's standing rule is not to invent CSS. Grepping the mirror's sheets
 * is unreliable: they are minified, run to 180 KB, and carry eight alternative
 * plugin layouts whose selectors look plausible but never match this markup.
 * This asks the page itself, through CSS.getMatchedStylesForNode, so what comes
 * back is what the original browser applied and nothing else.
 *
 *   node --experimental-strip-types scripts/matched-css.ts <url> <selector> [width]
 *
 * Rules are printed in cascade order, lowest priority first, so the last
 * declaration of a property is the one that won.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME =
  process.env.CHROME_PATH ??
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1243/chrome-win64/chrome.exe')

const PORT = 9377

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

const [url, selector, widthArg] = process.argv.slice(2)
if (!url || !selector) {
  console.error('usage: matched-css.ts <url> <selector> [width]')
  process.exit(1)
}
const width = Number(widthArg ?? 1440)

const profile = mkdtempSync(join(tmpdir(), 'matched-css-'))
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
await send<void>(socket, 'Emulation.setDeviceMetricsOverride', {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: width <= 980,
})
await send<void>(socket, 'Page.navigate', { url })
await new Promise((ok) => setTimeout(ok, 3500))

const { root } = await send<CdpNode>(socket, 'DOM.getDocument', { depth: -1 })
const { nodeIds } = await send<CdpNodes>(socket, 'DOM.querySelectorAll', {
  nodeId: root.nodeId,
  selector,
})

console.log(`url:      ${url}`)
console.log(`selector: ${selector}  (${nodeIds.length} matched, ${width}px)`)

for (const [at, nodeId] of nodeIds.entries()) {
  const styles = await send<CdpStyles>(socket, 'CSS.getMatchedStylesForNode', { nodeId })
  console.log(`\n${'='.repeat(70)}\n[${at}] ${selector}\n${'='.repeat(70)}`)

  for (const entry of styles.matchedCSSRules ?? []) {
    const rule = entry.rule
    const origin = rule.origin === 'user-agent' ? ' (browser default)' : ''
    const media = (rule.media ?? []).map((m: { text: string }) => `@media ${m.text}`).join(' ')
    // Which parts of the selector list actually matched this element.
    const hit = (entry.matchingSelectors ?? [])
      .map((i) => rule.selectorList?.selectors[i]?.text)
      .filter(Boolean)
      .join(', ')
    const text = (rule.style?.cssText ?? '').trim()
    if (!text) continue
    console.log(`\n${media ? media + ' { ' : ''}${hit || rule.selectorList?.text}${origin} {`)
    for (const decl of text.split(';')) {
      if (decl.trim()) console.log(`  ${decl.trim()};`)
    }
    console.log(`}${media ? ' }' : ''}`)
  }

  if (styles.inlineStyle?.cssText?.trim()) {
    console.log(`\n[inline style] {\n  ${styles.inlineStyle.cssText.trim()}\n}`)
  }
}

browser.kill()
process.exit(0)
