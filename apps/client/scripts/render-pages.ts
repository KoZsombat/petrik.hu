/**
 * Server-side renders every page's default document to static HTML - the gate
 * that keeps an unedited page byte-identical (AGENT.md 6.20).
 *
 *   node --experimental-strip-types scripts/render-pages.ts check
 *       renders every default document and compares its SHA-256 with
 *       scripts/render-baseline.json, which was taken from the generated TSX
 *       components these documents replaced. Exits 1 on any difference.
 *   node --experimental-strip-types scripts/render-pages.ts snapshot <dir>
 *       writes <dir>/<Component>.html - take one before a change to the
 *       renderer or a Divi component...
 *   node --experimental-strip-types scripts/render-pages.ts compare <dir>
 *       ...and diff against it afterwards, with the first differing bytes.
 *   node --experimental-strip-types scripts/render-pages.ts baseline
 *       rewrites render-baseline.json from the current render. Only after a
 *       deliberate change of what the pages should be (regenerating from a
 *       newer mirror, a posts.ts update) - never to make a failure go away.
 *
 * Vite does the module loading (JSX, CSS imports, JSON), so no browser is
 * needed - the markup a page emits does not depend on one. The output is
 * `renderToStaticMarkup` under a StaticRouter at the page's route.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { PAGES } from './pages.ts'
import { PROJECT_ROOT } from './mirror.ts'

const [mode, dirArg, ...rest] = process.argv.slice(2)
const MODES = ['check', 'snapshot', 'compare', 'baseline']
if (!MODES.includes(mode) || ((mode === 'snapshot' || mode === 'compare') && !dirArg)) {
  console.error('usage: render-pages.ts check | baseline | snapshot <dir> | compare <dir>  [Component...]')
  process.exit(1)
}
const dir = dirArg && (mode === 'snapshot' || mode === 'compare') ? resolve(dirArg) : null
const only = new Set(dir ? rest : [dirArg, ...rest].filter(Boolean))
if (mode === 'snapshot' && dir) mkdirSync(dir, { recursive: true })

const baselineFile = resolve(PROJECT_ROOT, 'scripts/render-baseline.json')
const baseline: Record<string, string> = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : {}
const sha = (text: string) => createHash('sha256').update(text).digest('hex')

const vite = await createServer({
  root: PROJECT_ROOT,
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'error',
})

try {
  // Native imports, not ssrLoadModule: Vite externalises node_modules in SSR,
  // so these are the same instances the page modules get.
  const { createElement: h } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const router = await import('react-router-dom')
  const registry = await vite.ssrLoadModule('/src/data/pages/index.ts')
  const renderer = await vite.ssrLoadModule('/src/components/pagebuilder/PageRenderer.tsx')

  const next: Record<string, string> = {}
  let failures = 0
  let checked = 0
  for (const page of PAGES) {
    if (only.size && !only.has(page.component)) continue
    const entry = registry.pageDefaults[page.route]
    if (!entry) {
      console.error(`  no default document for ${page.route}`)
      failures += 1
      continue
    }
    const html = renderToStaticMarkup(
      h(router.StaticRouter, { location: page.route }, h(renderer.default, { document: entry.document })),
    )
    checked += 1
    next[page.component] = sha(html)

    if (mode === 'snapshot' && dir) writeFileSync(resolve(dir, `${page.component}.html`), html, 'utf8')

    if (mode === 'compare' && dir) {
      const file = resolve(dir, `${page.component}.html`)
      if (!existsSync(file)) {
        console.error(`  no snapshot for ${page.component}`)
        failures += 1
        continue
      }
      const expected = readFileSync(file, 'utf8')
      if (html !== expected) {
        failures += 1
        let at = 0
        while (at < html.length && html[at] === expected[at]) at += 1
        console.error(`  DIFF ${page.component} at ${at}`)
        console.error(`    old: ...${expected.slice(Math.max(0, at - 80), at + 120)}`)
        console.error(`    new: ...${html.slice(Math.max(0, at - 80), at + 120)}`)
      }
    }

    if (mode === 'check' && baseline[page.component] !== next[page.component]) {
      failures += 1
      console.error(`  DIFF ${page.component}: renders differently from the baseline`)
    }
  }

  if (mode === 'baseline') {
    writeFileSync(baselineFile, JSON.stringify({ ...baseline, ...next }, null, 1) + '\n', 'utf8')
    console.log(`baseline written: ${checked} pages`)
  } else {
    console.log(`${mode}: ${checked} pages, ${failures} failures`)
  }
  process.exitCode = failures ? 1 : 0
} finally {
  await vite.close()
}
