/**
 * Regenerates every page's default document and design stylesheet from the
 * mirror (AGENT.md 6.20), then reports what was written.
 *
 *   PETRIK_MIRROR=<mirror dir> node --experimental-strip-types scripts/generate.ts [Component...]
 *
 * walk.ts is still the one place that reads the mirror. It prints a page as a
 * React component; that source is converted in memory to a PageDocument
 * (scripts/tsx-to-document.ts) and never written to disk, so the two shapes
 * cannot disagree. The result lands in src/data/pages/: `<Component>.json`,
 * `<Component>.css` and the registry `index.ts`.
 *
 * Afterwards run scripts/render-pages.ts check - or, when the mirror really
 * changed, review the diff and `render-pages.ts baseline`.
 */
import { execFileSync } from 'node:child_process'
import { PAGES, scopeClass } from './pages.ts'
import { PROJECT_ROOT } from './mirror.ts'
import { writeDocument, writeMirrorRoutes, writeRegistry } from './documents.ts'

const node = process.execPath

function run(script: string, args: string[]): string {
  return execFileSync(node, ['--experimental-strip-types', script, ...args], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
}

/**
 * Pages written in the WordPress editor carry no Divi module design block, so
 * there is nothing to scope. Every other kind has one - including the docs
 * pages, whose bodies are Divi trees like any other.
 */
const hasDesignCss = (page: (typeof PAGES)[number]) => page.kind !== 'classic'

/**
 * With no arguments every page is regenerated. Naming components narrows it to
 * those - useful when one module changes and a 53-page rewrite would bury the
 * one file that was meant to move.
 */
const only = new Set(process.argv.slice(2))
const selected = only.size ? PAGES.filter((page) => only.has(page.component)) : PAGES
if (only.size && selected.length !== only.size) {
  const found = new Set(selected.map((page) => page.component))
  throw new Error(`no such page: ${[...only].filter((name) => !found.has(name)).join(', ')}`)
}

let written = 0
for (const page of selected) {
  const arg = page.dir === '' ? 'home' : page.dir
  const source = run('scripts/walk.ts', [arg, `--scope=${scopeClass(page)}`, `--kind=${page.kind}`])
  writeDocument(page.component, source)

  if (hasDesignCss(page)) {
    run('scripts/page-css.ts', [
      page.dir === '' ? '.' : page.dir,
      `src/data/pages/${page.component}.css`,
      `.${scopeClass(page)}`,
    ])
  }
  written += 1
}

writeRegistry()
writeMirrorRoutes()
console.log(`generated ${written} page documents and stylesheets`)
