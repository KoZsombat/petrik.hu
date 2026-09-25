/**
 * Regenerates every builder page component and its design stylesheet from the
 * mirror, then reports what was written.
 *
 *   node --experimental-strip-types scripts/generate.ts
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { PAGES, scopeClass, type PageEntry } from './pages.ts'
import { PROJECT_ROOT } from './mirror.ts'

const node = process.execPath

function run(script: string, args: string[]): string {
  return execFileSync(node, ['--experimental-strip-types', script, ...args], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
}

/** Where the component lands under src/pages, without the extension. */
const stemOf = (page: PageEntry) => page.out ?? page.component

/**
 * Pages written in the WordPress editor carry no Divi module design block, so
 * there is nothing to scope. Every other kind has one - including the docs
 * pages, whose bodies are Divi trees like any other.
 */
const hasDesignCss = (page: PageEntry) => page.kind !== 'classic'

/**
 * With no arguments every page is regenerated. Naming components narrows it to
 * those - useful when one module changes and a 129-page rewrite would bury the
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
  const scope = scopeClass(page)
  const stem = stemOf(page)
  // A component in a subdirectory needs one more `../` on each of its imports.
  const up = stem.split('/').length

  let source = run('scripts/walk.ts', [arg, `--scope=${scope}`, `--kind=${page.kind}`, `--up=${up}`])
  source = source.replace('export default function Page()', `export default function ${page.component}()`)

  const lines = source.split('\n')
  if (hasDesignCss(page)) {
    // Give the page its own design stylesheet import, after the last component import.
    const lastImport = lines.reduce((last, line, i) => (line.startsWith('import ') ? i : last), 0)
    lines.splice(lastImport + 1, 0, `import './${page.component}.css'`)
  }

  const target = resolve(PROJECT_ROOT, `src/pages/${stem}.tsx`)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, lines.join('\n'), 'utf8')

  if (hasDesignCss(page)) {
    run('scripts/page-css.ts', [
      page.dir === '' ? '.' : page.dir,
      `src/pages/${stem}.css`,
      `.${scope}`,
    ])
  }
  written += 1
}

console.log(`generated ${written} page components and stylesheets`)

// The Szerkesztő's module map (AGENT.md 6.19) is keyed by the same `index`
// props just written, so it is rebuilt in the same run - never one without the
// other. It fails loudly if the mirror and the components disagree.
process.stdout.write(run('scripts/page-inventory.ts', []))

// A quick sanity check: every generated file should parse as JSX-ish source.
for (const page of selected) {
  const file = resolve(PROJECT_ROOT, `src/pages/${stemOf(page)}.tsx`)
  const text = readFileSync(file, 'utf8')
  if (!text.includes('export default function')) {
    console.error(`  !! ${stemOf(page)}.tsx has no default export`)
  }
}
