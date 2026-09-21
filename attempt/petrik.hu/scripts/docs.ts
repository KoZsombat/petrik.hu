/**
 * Collects the BetterDocs index from the mirror and writes it to
 * src/data/docs.ts.
 *
 * The docs pages share one piece of chrome: a category sidebar that is
 * byte-identical on all 27 of them apart from two "active" markers. Rather
 * than generate that markup 27 times, it is scraped once into data here and
 * rendered by src/components/docs/DocsCategoryList.tsx.
 *
 *   node --experimental-strip-types scripts/docs.ts
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parse } from 'node-html-parser'
import { MIRROR_ROOT, PROJECT_ROOT } from './mirror.ts'
import { resolveUrl } from './extract.ts'

/** The page whose sidebar defines the category order. Any docs page would do. */
const REFERENCE = 'hazirend'

const q = (value: string) => JSON.stringify(value)

/** "/docs/hazirend/" -> "hazirend". Also copes with the self-link to "/". */
function docSlug(url: string): string {
  const match = /^\/docs\/([^/]+)\/$/.exec(url)
  return match ? match[1] : ''
}

type Category = { id: number; slug: string; title: string; docs: string[]; count: number }

type Tag = { id: number; slug: string; title: string; docs: string[] }

type Entry = {
  slug: string
  title: string
  id: number
  category: string
  readingTime: string
  prev: string
  next: string
  protected: boolean
  /** Tag slugs the footer lists under the document. */
  tags: string[]
}

const problems: string[] = []
const report = (message: string) => {
  problems.push(message)
  console.error(`  ! ${message}`)
}

/* -- the category sidebar, read once -------------------------------------- */

const referenceDir = `docs/${REFERENCE}`
const referenceRoot = parse(readFileSync(join(MIRROR_ROOT, referenceDir, 'index.html'), 'utf8'))
const sidebar = referenceRoot.querySelector('#betterdocs-sidebar')
if (!sidebar) throw new Error(`no #betterdocs-sidebar in ${referenceDir}`)

const categories: Category[] = sidebar
  .querySelectorAll('article.betterdocs-single-category-wrapper')
  .map((article) => {
    const title = article.querySelector('.betterdocs-category-title')?.text.trim() ?? ''
    const counts = article.querySelector('.betterdocs-category-items-counts')
    const docs = article
      .querySelectorAll('.betterdocs-articles-list a')
      .map((link) => docSlug(resolveUrl(link.getAttribute('href') ?? '', referenceDir)))
      .filter(Boolean)
    return {
      id: Number(article.getAttribute('data-id') ?? 0),
      // Filled in below from the breadcrumbs, which are the only place the
      // sidebar's categories are tied to their taxonomy slugs.
      slug: '',
      title,
      docs,
      count: Number(counts?.getAttribute('data-count') ?? 0),
    }
  })

/* -- one pass per docs page ----------------------------------------------- */

const dirs = readdirSync(join(MIRROR_ROOT, 'docs'), { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name)
  .sort()

const entries = new Map<string, Entry>()
/** Category title -> taxonomy slug, learned from the breadcrumbs. */
const categorySlugs = new Map<string, string>()

for (const slug of dirs) {
  const dir = `docs/${slug}`
  const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))

  const title = root.querySelector('#betterdocs-entry-title')?.text.trim() ?? ''
  if (!title) report(`${slug}: no #betterdocs-entry-title`)

  const current = root.querySelector('.betterdocs-breadcrumb-item.item-current')
  const idClass = (current?.getAttribute('class') ?? '')
    .split(/\s+/)
    .find((name) => /^item-[0-9]+$/.test(name))
  const id = idClass ? Number(idClass.slice('item-'.length)) : 0
  if (!id) report(`${slug}: no item-<id> class on the current breadcrumb`)

  // The breadcrumb runs Home > Dokumentumtár > <category> > <title>; the
  // category is the last link before the current item.
  const categoryLink = root
    .querySelectorAll('.betterdocs-breadcrumb-item a')
    .map((link) => ({
      label: link.text.trim(),
      to: resolveUrl(link.getAttribute('href') ?? '', dir),
    }))
    .filter((link) => link.to.startsWith('/dokumentum-kategoria/'))
    .pop()
  if (!categoryLink) report(`${slug}: no /dokumentum-kategoria/ link in the breadcrumb`)
  const categorySlug = categoryLink ? categoryLink.to.split('/').filter(Boolean)[1] : ''
  if (categoryLink) categorySlugs.set(categoryLink.label, categorySlug)

  const readingTime = root.querySelector('.reading-time p')?.text.trim() ?? ''
  if (!readingTime.endsWith('min read')) report(`${slug}: odd reading time ${q(readingTime)}`)

  const navHref = (rel: string) =>
    docSlug(
      resolveUrl(root.querySelector(`.docs-navigation a[rel="${rel}"]`)?.getAttribute('href') ?? '', dir),
    )

  entries.set(slug, {
    slug,
    title,
    id,
    category: categorySlug,
    readingTime,
    // A doc that is alone in its category links to itself, which resolves to
    // the empty slug because the mirror writes it as a bare "index.html".
    prev: navHref('prev') || slug,
    next: navHref('next') || slug,
    protected: Boolean(root.querySelector('.et_password_protected_form')),
    // The footer lists the document's tags above the reactions widget.
    tags: root
      .querySelectorAll('.betterdocs-tags a')
      .map((link) => {
        const to = resolveUrl(link.getAttribute('href') ?? '', dir)
        return /^\/dokumentum-cimke\/([^/]+)\/$/.exec(to)?.[1] ?? ''
      })
      .filter(Boolean),
  })
}

/* -- the doc tags ---------------------------------------------------------- */

/**
 * BetterDocs also grouped documents by tag. Only one tag archive was crawled,
 * and nothing on the site links to it, but the page exists in the mirror and
 * the template is the category page's with a different heading.
 */
const tags: Tag[] = []
const tagRoot = join(MIRROR_ROOT, 'dokumentum-cimke')
if (existsSync(tagRoot)) {
  for (const slug of readdirSync(tagRoot, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort()) {
    const dir = `dokumentum-cimke/${slug}`
    const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))
    const title = root.querySelector('.docs-cat-heading')?.text.trim() ?? ''
    if (!title) report(`tag ${slug}: no .docs-cat-heading`)
    const current = root.querySelector('.betterdocs-breadcrumb-item.item-current')
    const idClass = (current?.getAttribute('class') ?? '')
      .split(/\s+/)
      .find((name) => /^item-tag-[0-9]+$/.test(name))
    const docs = root
      .querySelectorAll('.betterdocs-entry-body a')
      .map((link) => docSlug(resolveUrl(link.getAttribute('href') ?? '', dir)))
      .filter(Boolean)
    if (!docs.length) report(`tag ${slug}: lists no documents`)
    tags.push({
      id: idClass ? Number(idClass.slice('item-tag-'.length)) : 0,
      slug,
      title,
      docs,
    })
  }
}

/* -- checks: the mirror is the authority, so disagreement is a bug --------- */

for (const category of categories) {
  category.slug = categorySlugs.get(category.title) ?? ''
  if (!category.slug) report(`category ${q(category.title)}: no taxonomy slug found`)
  if (category.count !== category.docs.length) {
    report(`category ${q(category.title)}: data-count ${category.count} but ${category.docs.length} links`)
  }
}

const listed = categories.flatMap((category) => category.docs)
const missing = dirs.filter((slug) => !listed.includes(slug))
const extra = listed.filter((slug) => !dirs.includes(slug))
if (missing.length) report(`in the mirror but not in the sidebar: ${missing.join(', ')}`)
if (extra.length) report(`in the sidebar but not in the mirror: ${extra.join(', ')}`)

for (const category of categories) {
  for (const [at, slug] of category.docs.entries()) {
    const entry = entries.get(slug)
    if (!entry) continue
    if (entry.category !== category.slug) {
      report(`${slug}: breadcrumb says ${entry.category}, sidebar says ${category.slug}`)
    }
    // BetterDocs' prev/next wrap around inside the category, so they must be
    // the cyclic neighbours of the sidebar order. Scraped, then checked here.
    const size = category.docs.length
    const prev = category.docs[(at - 1 + size) % size]
    const next = category.docs[(at + 1) % size]
    if (entry.prev !== prev) report(`${slug}: prev is ${entry.prev}, cyclic neighbour is ${prev}`)
    if (entry.next !== next) report(`${slug}: next is ${entry.next}, cyclic neighbour is ${next}`)
  }
}

/* -- write ----------------------------------------------------------------- */

const categoryLines = categories.map((category) =>
  [
    '  {',
    `    id: ${category.id},`,
    `    slug: ${q(category.slug)},`,
    `    title: ${q(category.title)},`,
    `    docs: [${category.docs.map(q).join(', ')}],`,
    '  },',
  ].join('\n'),
)

const tagLines = tags.map((tag) =>
  [
    '  {',
    `    id: ${tag.id},`,
    `    slug: ${q(tag.slug)},`,
    `    title: ${q(tag.title)},`,
    `    docs: [${tag.docs.map(q).join(', ')}],`,
    '  },',
  ].join('\n'),
)

const entryLines = [...entries.values()].map((entry) =>
  [
    `  ${q(entry.slug)}: {`,
    `    slug: ${q(entry.slug)},`,
    `    title: ${q(entry.title)},`,
    `    id: ${entry.id},`,
    `    category: ${q(entry.category)},`,
    `    readingTime: ${q(entry.readingTime)},`,
    `    prev: ${q(entry.prev)},`,
    `    next: ${q(entry.next)},`,
    ...(entry.tags.length ? [`    tags: [${entry.tags.map(q).join(', ')}],`] : []),
    ...(entry.protected ? ['    protected: true,'] : []),
    '  },',
  ].join('\n'),
)

const source = [
  '/**',
  " * The BetterDocs index, collected from the mirror's docs pages.",
  ' * Generated by scripts/docs.ts - do not edit by hand.',
  ' *',
  ' * Every docs page carried the same category sidebar, so it lives here once',
  ' * and DocsCategoryList renders it, marking the active entry from the route.',
  ' */',
  '',
  '/** A BetterDocs category, in the order the plugin listed them. */',
  'export type DocCategory = {',
  "  /** The plugin's term id, from the card's data-id attribute. */",
  '  id: number',
  '  /** Slug under /dokumentum-kategoria/. */',
  '  slug: string',
  '  title: string',
  '  /** Doc slugs in the plugin\'s order; the length is the printed count. */',
  '  docs: string[]',
  '}',
  '',
  'export type DocEntry = {',
  '  slug: string',
  '  title: string',
  '  /** WordPress post id, which the breadcrumb prints as item-<id>. */',
  '  id: number',
  '  /** Slug of the owning category. */',
  '  category: string',
  '  /** Verbatim, e.g. "1 min read" or "< 1 min read". */',
  '  readingTime: string',
  '  /** Cyclic neighbours within the category; the doc itself when alone. */',
  '  prev: string',
  '  next: string',
  '  /** Tag slugs the footer lists under the document. */',
  '  tags?: string[]',
  '  /** True for the two docs the original kept behind a password. */',
  '  protected?: boolean',
  '}',
  '',
  'export const docCategories: DocCategory[] = [',
  ...categoryLines,
  ']',
  '',
  '/**',
  ' * A BetterDocs tag. Only one was crawled, and nothing links to it, but the',
  ' * page is in the mirror so it is ported like the rest.',
  ' */',
  'export type DocTag = {',
  '  id: number',
  '  slug: string',
  '  title: string',
  '  docs: string[]',
  '}',
  '',
  'export const docTags: DocTag[] = [',
  ...tagLines,
  ']',
  '',
  'export const docs: Record<string, DocEntry> = {',
  ...entryLines,
  '}',
  '',
  '/** Looks a doc up by slug, returning undefined when there is no such page. */',
  'export function docBySlug(slug: string): DocEntry | undefined {',
  '  return docs[slug]',
  '}',
  '',
  '/** The category a doc belongs to. */',
  'export function categoryOf(doc: DocEntry): DocCategory | undefined {',
  '  return docCategories.find((category) => category.slug === doc.category)',
  '}',
  '',
]

const out = resolve(PROJECT_ROOT, 'src/data/docs.ts')
writeFileSync(out, source.join('\n'), 'utf8')
console.log(
  `docs: ${categories.length} categories, ${tags.length} tags, ${entries.size} docs -> src/data/docs.ts` +
    (problems.length ? ` (${problems.length} problems above)` : ''),
)
if (problems.length) process.exit(1)
