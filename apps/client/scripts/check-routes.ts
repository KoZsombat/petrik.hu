/**
 * Checks that the page registry, the route table and the page documents still
 * agree (AGENT.md 6.20).
 *
 * The 53 authored pages are documents (src/data/pages), routed from the
 * registry by App.tsx rather than one component at a time, so what can go
 * wrong is no longer "a component nobody wired up" but "a page in the map
 * without a document, a stylesheet or a route". No browser needed.
 *
 *   node --experimental-strip-types scripts/check-routes.ts
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { PAGES } from './pages.ts'
import { archives } from '../src/data/archives.ts'
import { PROJECT_ROOT } from './mirror.ts'
import type { PageDocument } from '../../../shared/pnw/page-types.ts'

const app = readFileSync(resolve(PROJECT_ROOT, 'src/App.tsx'), 'utf8')
const registry = readFileSync(resolve(PROJECT_ROOT, 'src/data/pages/index.ts'), 'utf8')
const dataDir = resolve(PROJECT_ROOT, 'src/data/pages')
const problems: string[] = []

/* 1. every page in the map has a document, a stylesheet and a registry entry */

for (const page of PAGES) {
  const json = resolve(dataDir, `${page.component}.json`)
  if (!existsSync(json)) {
    problems.push(`no document for ${page.route}: src/data/pages/${page.component}.json`)
    continue
  }
  const document = JSON.parse(readFileSync(json, 'utf8')) as PageDocument
  if (document.template !== page.kind) {
    problems.push(`${page.route}: the document's template is ${document.template}, the page map says ${page.kind}`)
  }
  if (page.kind !== 'classic' && !existsSync(resolve(dataDir, `${page.component}.css`))) {
    problems.push(`no stylesheet for ${page.route}: src/data/pages/${page.component}.css`)
  }
  if (!registry.includes(`${JSON.stringify(page.route)}: { route:`)) {
    problems.push(`${page.route} is not in the registry (src/data/pages/index.ts)`)
  }
}

/* 2. nothing in src/data/pages that the page map does not know */

const known = new Set(PAGES.flatMap((page) => [`${page.component}.json`, `${page.component}.css`]))
for (const name of readdirSync(dataDir)) {
  if (name === 'index.ts') continue
  if (!known.has(name)) problems.push(`src/data/pages/${name} belongs to no page in scripts/pages.ts`)
}

/* 3. App.tsx still routes the registry */

if (!app.includes('Object.values(pageDefaults).map')) {
  problems.push('App.tsx no longer maps the page routes from the registry (src/data/pages)')
}

/* 4. the archives are reachable */

// They share one component, so what matters is that the mapping is still there
// and that nothing else claims those paths.
const archiveRoutes = Object.keys(archives)
if (!app.includes('Object.values(archives).map')) {
  problems.push('App.tsx no longer maps the archive routes from src/data/archives.ts')
}
for (const route of archiveRoutes) {
  if (app.includes(`path="${route}"`)) problems.push(`${route} is both mapped from the data and listed by hand`)
}

/* -- report ---------------------------------------------------------------- */

const counted = PAGES.length + archiveRoutes.length
if (problems.length) {
  for (const problem of problems) console.error(`  ! ${problem}`)
  console.error(`\ncheck-routes: ${problems.length} problems across ${counted} routes`)
  process.exit(1)
}
console.log(
  `check-routes: ok - ${PAGES.length} page documents routed from the registry, ` +
    `${archiveRoutes.length} archives mapped from data`,
)
