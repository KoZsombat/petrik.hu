/**
 * Checks that the route table and the page components still agree.
 *
 * The route table is written by hand, and the reason it is kept that way is
 * that a page component nobody wired up then shows as an unused file. With 117
 * routes across three files that is no longer something anyone will notice by
 * looking, so it is checked here instead. No browser needed.
 *
 *   node --experimental-strip-types scripts/check-routes.ts
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { PAGES } from './pages.ts'
import { archives } from '../src/data/archives.ts'
import { PROJECT_ROOT } from './mirror.ts'

/** Every .tsx under src/routes plus App.tsx: where routes may be declared. */
function routeSources(): { path: string; text: string }[] {
  const files = [resolve(PROJECT_ROOT, 'src/App.tsx')]
  const routesDir = resolve(PROJECT_ROOT, 'src/routes')
  try {
    for (const name of readdirSync(routesDir)) {
      if (name.endsWith('.tsx')) files.push(join(routesDir, name))
    }
  } catch {
    /* no routes directory yet */
  }
  return files.map((path) => ({ path, text: readFileSync(path, 'utf8') }))
}

/** Every page component on disk, as a path relative to src/pages. */
function pageFiles(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    if (item.isDirectory()) return pageFiles(join(dir, item.name), `${prefix}${item.name}/`)
    return item.name.endsWith('.tsx') ? [`${prefix}${item.name.replace(/\.tsx$/, '')}`] : []
  })
}

const sources = routeSources()
const all = sources.map((source) => source.text).join('\n')
const problems: string[] = []

/* 1. every page in the map has a route */

for (const page of PAGES) {
  if (!all.includes(`path="${page.route}"`)) {
    problems.push(`no route for ${page.route} (${page.out ?? page.component})`)
  }
}

/* 2. every component on disk is imported by exactly one route module */

const pagesDir = resolve(PROJECT_ROOT, 'src/pages')
/** Rendered by another component rather than reached by a route of its own. */
const NOT_ROUTED = new Set(['NotFound'])

for (const stem of pageFiles(pagesDir)) {
  if (NOT_ROUTED.has(stem)) continue
  const importing = sources.filter((source) => source.text.includes(`/pages/${stem}.tsx'`))
  if (importing.length === 0) {
    problems.push(`src/pages/${stem}.tsx is not imported by any route module`)
  } else if (importing.length > 1) {
    const where = importing.map((s) => relative(PROJECT_ROOT, s.path)).join(', ')
    problems.push(`src/pages/${stem}.tsx is imported by more than one route module: ${where}`)
  }
}

/* 3. the archives are reachable */

// They share one component, so what matters is that the mapping is still there
// and that nothing else claims those paths.
const archiveRoutes = Object.keys(archives)
const mapsArchives = all.includes('Object.values(archives).map')
if (!mapsArchives) {
  problems.push('App.tsx no longer maps the archive routes from src/data/archives.ts')
}
for (const route of archiveRoutes) {
  if (all.includes(`path="${route}"`)) {
    problems.push(`${route} is both mapped from the data and listed by hand`)
  }
}

/* -- report ---------------------------------------------------------------- */

const counted = PAGES.length + archiveRoutes.length
if (problems.length) {
  for (const problem of problems) console.error(`  ! ${problem}`)
  console.error(`\ncheck-routes: ${problems.length} problems across ${counted} routes`)
  process.exit(1)
}
console.log(
  `check-routes: ok - ${PAGES.length} page components wired up, ` +
    `${archiveRoutes.length} archives mapped from data`,
)
