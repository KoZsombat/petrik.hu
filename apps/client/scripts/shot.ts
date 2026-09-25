/**
 * Screenshots a URL at an exact viewport width.
 *
 * Chrome clamps --window-size below roughly 500px, so the viewport is emulated
 * over the DevTools protocol rather than set on the window.
 *
 *   node --experimental-strip-types scripts/shot.ts <url> <width> <out.png> [fullPage]
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const CHROME =
  process.env.CHROME_PATH ??
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1243/chrome-win64/chrome.exe')

const PORT = 9366

async function attach(): Promise<WebSocket> {
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
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('could not attach to Chromium')
}

function send(
  socket: WebSocket,
  id: number,
  method: string,
  params: unknown,
): Promise<{ data?: string }> {
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

const [url, widthArg, out, fullPage] = process.argv.slice(2)
const width = Number(widthArg)
const profile = mkdtempSync(join(tmpdir(), 'shot-'))
const browser = spawn(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])

const socket = await attach()
await send(socket, 1, 'Emulation.setDeviceMetricsOverride', {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: width <= 980,
})
await send(socket, 2, 'Page.navigate', { url })
await new Promise((resolve) => setTimeout(resolve, 4000))

const shot = await send(socket, 3, 'Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: fullPage === 'full',
  ...(fullPage === 'full' ? { clip: undefined } : {}),
})

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, Buffer.from(shot.data ?? '', 'base64'))
console.log(`${url} @${width}px -> ${out}`)
browser.kill()
process.exit(0)
