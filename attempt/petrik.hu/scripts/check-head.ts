/**
 * Checks that every route reproduces the mirror's <head>.
 *
 *   node --experimental-strip-types scripts/check-head.ts
 *
 * Compared: the title, the description, the robots meta, and whether there is
 * a canonical link. The canonical's href is deliberately not compared - the
 * crawler rewrote every one of them to a relative path, so the mirror's value
 * is not the original; see scripts/head.ts.
 *
 * All of it is applied by an effect after React mounts, so none of it can be
 * read out of the served HTML - the page has to run. This drives the same
 * headless Chromium the other checks use, over the DevTools protocol.
 *
 * Both servers have to be running, and - as in check-text.ts - nothing else
 * may be driving a browser at the same time: they share the debugging port.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MIRRORED } from './pages.ts'

const CHROME =
  process.env.CHROME_PATH ??
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1243/chrome-win64/chrome.exe')

const APP = 'http://localhost:5173'
const MIRROR = 'http://localhost:8899'
const PORT = 9335

async function attach(): Promise<WebSocket> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
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
      /* the browser is not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('could not attach to Chromium')
}

let nextId = 1
function send(socket: WebSocket, method: string, params: unknown): Promise<{ result?: { value?: unknown } }> {
  const id = nextId++
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

const READ_HEAD = `JSON.stringify({
  title: document.title,
  description: document.head.querySelector('meta[name="description"]')?.content ?? '',
  robots: document.head.querySelector('meta[name="robots"]')?.content ?? '',
  canonical: Boolean(document.head.querySelector('link[rel="canonical"]')),
})`

async function headAt(socket: WebSocket, url: string): Promise<string> {
  await send(socket, 'Page.navigate', { url })
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const result = await send(socket, 'Runtime.evaluate', {
    expression: READ_HEAD,
    returnByValue: true,
  })
  return String(result.result?.value ?? '')
}

const profile = mkdtempSync(join(tmpdir(), 'head-'))
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

for (const page of MIRRORED) {
  const app = await headAt(socket, APP + page.route)
  const mirror = await headAt(socket, MIRROR + page.route)
  const name = (page.dir || 'home').padEnd(38)
  if (app === mirror) {
    console.log(`${name} ok  ${JSON.parse(app).title}`)
  } else {
    failures += 1
    console.log(`${name} DIFFERS`)
    console.log(`  app:    ${app}`)
    console.log(`  mirror: ${mirror}`)
  }
}

console.log('')
console.log(
  failures
    ? `${failures}/${MIRRORED.length} routes have the wrong head`
    : `${MIRRORED.length}/${MIRRORED.length} routes reproduce the mirror's head`,
)

browser.kill()
process.exit(failures ? 1 : 0)
