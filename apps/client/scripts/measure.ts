/**
 * Measures element geometry on two URLs and reports the differences.
 *
 * Used to check the ported pages against the mirror: it drives a headless
 * Chromium over the DevTools protocol using Node's built-in WebSocket, so it
 * needs no extra dependency.
 *
 *   node --experimental-strip-types scripts/measure.ts <selector> <urlA> <urlB> [width]
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME =
  process.env.CHROME_PATH ??
  join(
    process.env.LOCALAPPDATA ?? '',
    'ms-playwright/chromium-1243/chrome-win64/chrome.exe',
  )

const PORT = 9333

type Box = {
  text: string
  x: number
  y: number
  width: number
  height: number
  font: string
  weight: string
  margin: string
}

async function connect(): Promise<WebSocket> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = (await res.json()) as { type: string; webSocketDebuggerUrl: string }[]
      const page = targets.find((t) => t.type === 'page')
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

type CdpResult = { result?: { value?: unknown } }

function send(
  socket: WebSocket,
  id: number,
  method: string,
  params: unknown,
): Promise<CdpResult> {
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

async function measure(socket: WebSocket, url: string, selector: string, seed: number) {
  // Chrome clamps --window-size below about 500px, so the viewport is emulated
  // instead - otherwise a "390px" run would silently measure 500px.
  await send(socket, seed + 2, 'Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width <= 980,
  })
  await send(socket, seed, 'Page.navigate', { url })
  await new Promise((resolve) => setTimeout(resolve, 3500))
  const expression = `
    Array.from(document.querySelectorAll(${JSON.stringify(selector)})).map((el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return {
        text: (el.textContent || '').trim().slice(0, 18),
        x: Math.round(r.x * 10) / 10,
        y: Math.round((r.y + window.scrollY) * 10) / 10,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        font: s.fontFamily.split(',')[0].replace(/["']/g, ''),
        weight: s.fontWeight,
        margin: s.marginBottom,
      }
    })`
  const result = await send(socket, seed + 1, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
  })
  return (result.result?.value ?? []) as Box[]
}

const [selector, urlA, urlB, widthArg] = process.argv.slice(2)
const width = Number(widthArg ?? 1440)
const profile = mkdtempSync(join(tmpdir(), 'measure-'))
const browser = spawn(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,900',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])

const socket = await connect()
const a = await measure(socket, urlA, selector, 100)
const b = await measure(socket, urlB, selector, 200)

console.log(`selector: ${selector}`)
console.log(`A = ${urlA}`)
console.log(`B = ${urlB}`)
console.log('')

// Rows are paired by document order, so a differing element count means every
// pairing after the first extra element is meaningless. Say so rather than
// printing a wall of phantom differences.
if (a.length !== b.length) {
  console.log(`element count differs: A has ${a.length}, B has ${b.length}.`)
  console.log('Pairing by document order would be misleading - narrow the selector.')
  browser.kill()
  process.exit(1)
}

console.log(
  'text                  A.x    A.y    A.w    A.h |   dx     dy     dw     dh   font @weight',
)
const rows = Math.max(a.length, b.length)
for (let i = 0; i < rows; i += 1) {
  const left = a[i]
  const right = b[i]
  if (!left || !right) {
    console.log(`${(left ?? right).text.padEnd(20)} ${left ? 'only in A' : 'only in B'}`)
    continue
  }
  const dx = (right.x - left.x).toFixed(1)
  const dy = (right.y - left.y).toFixed(1)
  const dw = (right.width - left.width).toFixed(1)
  const dh = (right.height - left.height).toFixed(1)
  const fonts = left.font === right.font ? left.font : `${left.font} / ${right.font}`
  const weights = left.weight === right.weight ? left.weight : `${left.weight}/${right.weight}`
  const margins =
    left.margin === right.margin ? '' : ` mb:${left.margin}->${right.margin}`
  const clean = dx === '0.0' && dy === '0.0' && dw === '0.0' && dh === '0.0'
  console.log(
    `${left.text.padEnd(20)} ${String(left.x).padStart(6)} ${String(left.y).padStart(6)}` +
      ` ${String(left.width).padStart(6)} ${String(left.height).padStart(6)} |` +
      ` ${dx.padStart(6)} ${dy.padStart(6)} ${dw.padStart(6)} ${dh.padStart(6)}` +
      `  ${clean ? 'ok' : '<-- DIFF'} ${fonts} @${weights}${margins}`,
  )
}

browser.kill()
process.exit(0)
