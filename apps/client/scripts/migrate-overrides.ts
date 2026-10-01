/**
 * Migrates the Szerkesztő's v1 data (AGENT.md 6.19) to documents (6.20).
 *
 *   node --experimental-strip-types scripts/migrate-overrides.ts <database-file>          (dry run)
 *   node --experimental-strip-types scripts/migrate-overrides.ts <database-file> --write
 *
 * Run it once against a *copy* of the production database, look at the report,
 * then for real. It needs the new server to have started once on that
 * database (that is what rebuilds the `pages` table under the route-keyed
 * schema); it only ever reads `page_overrides` and writes `pages`.
 *
 * For every `page_overrides` row it takes the page's default document, applies
 * what the row said - module overrides by (kind, Divi index), hidden
 * sections dropped, `sectionOrder` applied, `extraSections` appended -, carries
 * the title and description over, and writes the result as a `pages` row of a
 * mirrored route. A page that was "Rejtve" (served as the 404) becomes a
 * tombstone (deleted). The result is run through the server's own validator
 * first; a row that does not validate is reported and left alone. With
 * `--write`, once every row migrated, `page_overrides` is dropped.
 *
 * Uses node:sqlite, so it needs no dependency beyond Node itself.
 */
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { PROJECT_ROOT } from './mirror.ts'
import { PAGES } from './pages.ts'
import { heads } from '../src/data/head.ts'
import { MIRROR_ROUTES } from '../../../shared/pnw/mirror-routes.ts'
import { normalizeDocument } from '../../../shared/pnw/page-doc.ts'
import { toRichContent } from '../../../shared/pnw/rich-content.ts'
import { sanitizePageDocument } from '../../server/lib/validation.ts'
import type { PageOverrides } from '../../../shared/pnw/legacy-overrides.ts'
import type { PageDocument, PageModule, PageSection } from '../../../shared/pnw/page-types.ts'

const [databaseFile, ...flags] = process.argv.slice(2)
const write = flags.includes('--write')
if (!databaseFile) {
  console.error('usage: migrate-overrides.ts <database-file> [--write]')
  process.exit(1)
}

const db = new DatabaseSync(resolve(databaseFile))

const tables = new Set(
  (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map((row) => row.name),
)
if (!tables.has('page_overrides')) {
  console.log('No page_overrides table - nothing to migrate.')
  process.exit(0)
}
const pageColumns = (db.prepare('PRAGMA table_info(pages)').all() as { name: string }[]).map((column) => column.name)
if (!pageColumns.includes('route')) {
  console.error('The pages table is still the v1 one. Start the new server once on this database (it rebuilds the table), then run this again.')
  process.exit(1)
}

const componentOf = new Map(PAGES.map((page) => [page.route, page.component]))

function defaultDocument(route: string): PageDocument | null {
  const component = componentOf.get(route)
  if (!component) return null
  return normalizeDocument(JSON.parse(readFileSync(resolve(PROJECT_ROOT, `src/data/pages/${component}.json`), 'utf8')) as PageDocument)
}

function mirroredTitle(route: string): string {
  const title = heads[route]?.title ?? route
  return title.replace(/\s*[|–-]\s*petrik\.hu$/i, '') || route
}

/** Image overrides replaced the picture; its srcset, sizes and intrinsic size belonged to the old file. */
function applyModule(module: PageModule, overrides: PageOverrides): PageModule {
  if (module.index === undefined) return module
  const entry = overrides.modules[`${module.kind}:${module.index}`] as Record<string, unknown> | undefined
  if (!entry) return module

  switch (module.kind) {
    case 'text':
      return entry.content ? { ...module, content: toRichContent(entry.content) } : module
    case 'image': {
      const next = { ...module }
      if (typeof entry.src === 'string') {
        next.src = entry.src
        delete next.width
        delete next.height
        delete next.srcSet
        delete next.sizes
        delete next.loading
      }
      if (typeof entry.alt === 'string') next.alt = entry.alt
      if (typeof entry.href === 'string') next.href = entry.href
      return next
    }
    case 'button': {
      const next = { ...module }
      if (typeof entry.label === 'string') next.label = entry.label
      // A new target replaces both the route and the URL - it is one or the other.
      if (entry.to || entry.href) {
        delete next.to
        delete next.href
        if (typeof entry.to === 'string') next.to = entry.to
        if (typeof entry.href === 'string') next.href = entry.href
      }
      return next
    }
    case 'blurb': {
      const next = { ...module }
      if (typeof entry.title === 'string') next.title = entry.title
      if (entry.content) next.content = toRichContent(entry.content)
      return next
    }
    default:
      return module
  }
}

function migrate(route: string, overrides: PageOverrides): { title: string; description: string; document: PageDocument } | string {
  const base = defaultDocument(route)
  if (!base) return `${route} is not a mirrored route any more`

  let sections: PageSection[] = base.sections
    .filter((section) => !overrides.hiddenSections.includes(section.index ?? -1))
    .map((section) => ({
      ...section,
      modules: section.modules?.map((module) => applyModule(module, overrides)),
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({ ...column, modules: column.modules.map((module) => applyModule(module, overrides)) })),
      })),
    }))

  const order = overrides.sectionOrder
  if (order) {
    // Listed sections first, in the listed order; the rest after them by Divi index - the flex `order` v1 gave them.
    const rank = (section: PageSection) => {
      const at = order.indexOf(section.index ?? -1)
      return at === -1 ? order.length + (section.index ?? 0) : at
    }
    sections = [...sections].sort((a, b) => rank(a) - rank(b))
  }

  // Appended sections have no Divi numbers yet; normalizeDocument gives each one above the highest of its kind.
  const extras = overrides.extraSections.map((section) => ({ ...section }))
  const merged = normalizeDocument({ ...base, sections: [...sections, ...extras] })

  return {
    title: overrides.title ?? mirroredTitle(route),
    description: overrides.description ?? '',
    document: merged,
  }
}

type OverrideRow = { route: string; data: string; modified_at: string; modified_by_id: string | null }
const rows = db.prepare('SELECT route, data, modified_at, modified_by_id FROM page_overrides').all() as OverrideRow[]
const existing = new Set((db.prepare('SELECT route FROM pages').all() as { route: string }[]).map((row) => row.route))

const insert = db.prepare(`
  INSERT INTO pages (id, route, origin, template, deleted, slug, title, description, document, status, author_id, created_at, modified_at, modified_by_id)
  VALUES (?, ?, 'mirror', ?, ?, NULL, ?, ?, ?, 'publish', ?, ?, ?, ?)
`)

let migrated = 0
let skipped = 0
let failed = 0
for (const row of rows) {
  const overrides = JSON.parse(row.data) as PageOverrides
  const identity = MIRROR_ROUTES[row.route]
  if (!identity) {
    console.log(`  ! ${row.route}: not a mirrored route - skipped`)
    failed += 1
    continue
  }
  if (existing.has(row.route)) {
    console.log(`  - ${row.route}: already has a pages row - skipped`)
    skipped += 1
    continue
  }
  const author = row.modified_by_id ?? 'migration'

  if (overrides.hidden) {
    console.log(`  ✓ ${row.route}: hidden -> deleted (tombstone)`)
    if (write) insert.run(randomUUID(), row.route, identity.template, 1, overrides.title ?? row.route, '', null, author, row.modified_at, row.modified_at, row.modified_by_id)
    migrated += 1
    continue
  }

  const result = migrate(row.route, overrides)
  if (typeof result === 'string') {
    console.log(`  ! ${result}`)
    failed += 1
    continue
  }
  const clean = sanitizePageDocument(result.document, identity)
  if (!clean) {
    console.log(`  ! ${row.route}: the migrated document does not validate - left alone`)
    failed += 1
    continue
  }
  const summary = [
    `${Object.keys(overrides.modules).length} module edit(s)`,
    overrides.hiddenSections.length ? `${overrides.hiddenSections.length} hidden section(s)` : '',
    overrides.sectionOrder ? 'reordered' : '',
    overrides.extraSections.length ? `${overrides.extraSections.length} appended section(s)` : '',
  ]
    .filter(Boolean)
    .join(', ')
  console.log(`  ✓ ${row.route}: ${summary || 'no content changes'}`)
  if (write) {
    insert.run(
      randomUUID(),
      row.route,
      identity.template,
      0,
      result.title,
      result.description,
      JSON.stringify(clean),
      author,
      row.modified_at,
      row.modified_at,
      row.modified_by_id,
    )
  }
  migrated += 1
}

console.log(`\n${migrated} migrated, ${skipped} skipped, ${failed} failed${write ? '' : '  (dry run - nothing written; add --write)'}`)

if (write && failed === 0) {
  db.exec('DROP TABLE page_overrides')
  console.log('page_overrides dropped.')
} else if (write) {
  console.log('page_overrides kept: some rows did not migrate.')
}
db.close()
process.exitCode = failed ? 1 : 0
