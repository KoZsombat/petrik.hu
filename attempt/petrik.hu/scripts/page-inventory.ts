/**
 * Writes src/data/page-inventory.ts: for every generated page, the Divi
 * sections and the text/image/button/blurb modules the Szerkesztő can
 * override (AGENT.md 6.19), with each module's current content.
 *
 *   node --experimental-strip-types scripts/page-inventory.ts
 *
 * Every index is taken **straight from the mirror's class name**
 * (et_pb_text_12 -> 12), exactly as walk.ts does when it writes the `index`
 * prop - so the inventory and the generated components cannot number a
 * module differently. As a guard it then reads each generated component and
 * fails if the two disagree: an override is keyed by that number, and a
 * silent drift would put saved text on the wrong module.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'
import { MIRROR_ROOT, PROJECT_ROOT } from './mirror.ts'
import { PAGES } from './pages.ts'
import { indexOf, rewriteUrl } from './extract.ts'
import { htmlToRichText } from './html-to-richtext.ts'
import type { InventoryModule, InventorySection, PageInventory } from '../shared/pnw/page-types.ts'

const OUT = resolve(PROJECT_ROOT, 'src/data/page-inventory.ts')

const snippet = (el: HTMLElement | null | undefined, max = 140): string => {
  const text = (el?.text ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function sectionOf(el: HTMLElement): number {
  const section = el.closest('.et_pb_section') as HTMLElement | null
  return section ? indexOf(section, 'et_pb_section') : -1
}

function inventory(dir: string, component: string, kind: PageInventory['kind']): PageInventory | null {
  const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))
  // The two password-protected documents: walk.ts renders a notice instead of their tree.
  if (root.querySelector('.et_password_protected_form')) return null
  const depth = dir === '' ? 0 : dir.split('/').length
  const scope = root.querySelector('#main-content') ?? root

  const sections: InventorySection[] = scope
    .querySelectorAll('.et_pb_section')
    .map((section) => ({ index: indexOf(section, 'et_pb_section'), text: snippet(section, 90) }))

  const modules: InventoryModule[] = []

  for (const el of scope.querySelectorAll('.et_pb_text')) {
    const index = indexOf(el, 'et_pb_text')
    const converted = htmlToRichText(el.querySelector('.et_pb_text_inner'), depth, `t${index}-`)
    modules.push({
      kind: 'text',
      index,
      section: sectionOf(el),
      text: snippet(el, 300),
      ...('content' in converted ? { content: converted.content } : { content: null, lossy: converted.lossy }),
    })
  }

  for (const el of scope.querySelectorAll('.et_pb_image')) {
    const img = el.querySelector('img')
    if (!img) continue
    const href = el.querySelector('a')?.getAttribute('href')
    modules.push({
      kind: 'image',
      index: indexOf(el, 'et_pb_image'),
      section: sectionOf(el),
      src: rewriteUrl(img.getAttribute('src') ?? '', depth),
      alt: img.getAttribute('alt') ?? '',
      ...(href ? { href: rewriteUrl(href, depth) } : {}),
    })
  }

  // Only the button *module*: a fullwidth header's buttons are a.et_pb_button
  // too, but they render through FullwidthHeader, not through <Button index>.
  for (const wrapper of scope.querySelectorAll('.et_pb_button_module_wrapper')) {
    const anchor = wrapper.querySelector('a.et_pb_button')
    if (!anchor) continue
    const target = rewriteUrl(anchor.getAttribute('href') ?? '', depth)
    modules.push({
      kind: 'button',
      index: indexOf(anchor, 'et_pb_button'),
      section: sectionOf(wrapper),
      label: anchor.text.trim(),
      ...(target.startsWith('http') ? { href: target } : target ? { to: target } : {}),
    })
  }

  for (const el of scope.querySelectorAll('.et_pb_blurb')) {
    const index = indexOf(el, 'et_pb_blurb')
    const header = el.querySelector('.et_pb_module_header')
    const description = el.querySelector('.et_pb_blurb_description')
    const converted = htmlToRichText(description, depth, `b${index}-`, [header])
    modules.push({
      kind: 'blurb',
      index,
      section: sectionOf(el),
      title: header?.text.trim() ?? '',
      text: snippet(description, 300),
      ...('content' in converted ? { content: converted.content } : { content: null, lossy: converted.lossy }),
    })
  }

  // Document order within a kind; the editor groups by section itself.
  modules.sort((a, b) => a.section - b.section || a.kind.localeCompare(b.kind) || a.index - b.index)
  return { component, kind, sections, modules }
}

/** Every `<Kind … index={N}` a generated component passes, by kind. */
function generatedIndices(source: string): Record<string, Set<number>> {
  const found: Record<string, Set<number>> = {}
  for (const match of source.matchAll(/<(Text|Image|Button|Blurb|Section)\s[^>]*?\bindex=\{(\d+)\}/g)) {
    const kind = match[1].toLowerCase()
    ;(found[kind] ??= new Set()).add(Number(match[2]))
  }
  return found
}

const result: Record<string, PageInventory> = {}
const problems: string[] = []
let lossyCount = 0
let moduleCount = 0

for (const page of PAGES) {
  if (page.kind === 'classic') continue // no Divi tree, nothing keyed by index
  const entry = inventory(page.dir, page.component, page.kind)
  if (!entry) continue

  const source = readFileSync(resolve(PROJECT_ROOT, `src/pages/${page.out ?? page.component}.tsx`), 'utf8')
  const generated = generatedIndices(source)
  const inventoried: Record<string, Set<number>> = { section: new Set(entry.sections.map((s) => s.index)) }
  for (const module of entry.modules) (inventoried[module.kind] ??= new Set()).add(module.index)

  for (const kind of ['section', 'text', 'image', 'button', 'blurb']) {
    const a = [...(inventoried[kind] ?? [])].sort((x, y) => x - y).join(',')
    const b = [...(generated[kind] ?? [])].sort((x, y) => x - y).join(',')
    if (a !== b) problems.push(`${page.route} ${kind}: mirror [${a}] vs ${page.component}.tsx [${b}]`)
  }

  moduleCount += entry.modules.length
  lossyCount += entry.modules.filter((module) => 'lossy' in module && module.lossy).length
  result[page.route] = entry
}

if (problems.length) {
  console.error('page-inventory: the mirror and the generated components disagree:')
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

const lines = Object.entries(result).map(([route, entry]) => `  ${JSON.stringify(route)}: ${JSON.stringify(entry)},`)
writeFileSync(
  OUT,
  [
    '/**',
    ' * GENERATED by scripts/page-inventory.ts - do not edit by hand.',
    ' *',
    ' * The Szerkesztő\'s map of every generated page (AGENT.md 6.19): its Divi',
    ' * sections and its overridable modules, numbered straight from the',
    ' * mirror\'s class names, with the content each module shows today.',
    ' * Loaded lazily by the editor only - vite.config.ts keeps it out of the',
    ' * `data` chunk every public page loads.',
    ' */',
    "import type { PageInventory } from '../../shared/pnw/page-types.ts'",
    '',
    'export const pageInventory: Record<string, PageInventory> = {',
    ...lines,
    '}',
    '',
  ].join('\n'),
  'utf8',
)

console.log(
  `page-inventory: ${Object.keys(result).length} pages, ${moduleCount} modules (${lossyCount} read-only) -> src/data/page-inventory.ts`,
)
