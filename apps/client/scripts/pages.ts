/**
 * The page map: which mirror directory becomes which route and component.
 *
 * Shared by the generation scripts and used to keep the route table honest -
 * every entry here must have a component wired up in src/App.tsx.
 */
import { archives } from '../src/data/archives.ts'
import { docCategories, docs, docTags } from '../src/data/docs.ts'

/** The scope class a page's design stylesheet is namespaced under. */
export function scopeClass(entry: { route: string }): string {
  const slug = entry.route.replace(/^\/|\/$/g, '') || 'home'
  return `page-${slug.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
}

export type PageEntry = {
  /** Directory in the mirror; '' is the site root. */
  dir: string
  /** Route in the ported site. */
  route: string
  /** Component name and file stem under src/pages. */
  component: string
  /** Path under src/pages without the extension, when it is not `component`. */
  out?: string
  /**
   * What kind of page the mirror holds, which decides how walk.ts renders it:
   *
   * - 'builder' - laid out with the Divi page builder
   * - 'classic' - plain WordPress content, no builder tree
   * - 'docs'    - a BetterDocs document: plugin chrome around a Divi tree
   * - 'post'    - a single blog post: the theme's post template
   *
   * This is authoritative. walk.ts can sniff the shape as a fallback, but 26 of
   * the 27 docs pages contain an .et_builder_inner_content of their own, so a
   * sniff alone would send them down the plain builder path.
   */
  kind: 'builder' | 'classic' | 'docs' | 'post'
}

/** "uv-mini-1240-2" -> "DocUvMini12402". Slugs can start with a digit. */
function docComponent(slug: string): string {
  const parts = slug.split(/[^a-z0-9]+/i).filter(Boolean)
  return 'Doc' + parts.map((part) => part[0].toUpperCase() + part.slice(1)).join('')
}

/**
 * The documents, derived from the index scripts/docs.ts collected rather than
 * listed again here. They are uniform - same chrome, same route shape - so a
 * second hand-written list could only drift out of step with the first.
 */
const DOC_PAGES: PageEntry[] = Object.keys(docs).map((slug) => ({
  dir: `docs/${slug}`,
  route: `/docs/${slug}/`,
  component: docComponent(slug),
  out: `docs/${docComponent(slug)}`,
  kind: 'docs',
}))

export const PAGES: PageEntry[] = [
  { dir: '', route: '/', component: 'HomePage', kind: 'builder' },
  { dir: 'about-us', route: '/about-us/', component: 'AboutUs', kind: 'builder' },
  { dir: 'adatvedelem', route: '/adatvedelem/', component: 'Adatvedelem', kind: 'builder' },
  { dir: 'allas', route: '/allas/', component: 'Allas', kind: 'builder' },
  { dir: 'bemutatkozas', route: '/bemutatkozas/', component: 'Bemutatkozas', kind: 'builder' },
  { dir: 'ebed', route: '/ebed/', component: 'Ebed', kind: 'builder' },
  { dir: 'egeszsegugy', route: '/egeszsegugy/', component: 'Egeszsegugy', kind: 'builder' },
  { dir: 'elerhetoseg', route: '/elerhetoseg/', component: 'Elerhetoseg', kind: 'builder' },
  { dir: 'erettsegi-vizsga', route: '/erettsegi-vizsga/', component: 'ErettsegiVizsga', kind: 'builder' },
  { dir: 'in-memoriam', route: '/in-memoriam/', component: 'InMemoriam', kind: 'builder' },
  {
    dir: 'informatika_es_tavkozles_agazat',
    route: '/informatika_es_tavkozles_agazat/',
    component: 'InformatikaAgazat',
    kind: 'builder',
  },
  {
    dir: 'kollegiumi-lehetosegek',
    route: '/kollegiumi-lehetosegek/',
    component: 'KollegiumiLehetosegek',
    kind: 'builder',
  },
  {
    dir: 'kornyezetvedelem_es_vizugy_agazat',
    route: '/kornyezetvedelem_es_vizugy_agazat/',
    component: 'KornyezetvedelemAgazat',
    kind: 'builder',
  },
  { dir: 'kozoktatas', route: '/kozoktatas/', component: 'Kozoktatas', kind: 'builder' },
  {
    dir: 'kozossegi-szolgalat',
    route: '/kozossegi-szolgalat/',
    component: 'KozossegiSzolgalat',
    kind: 'builder',
  },
  {
    dir: 'languagecert-vizsgak',
    route: '/languagecert-vizsgak/',
    component: 'LanguagecertVizsgak',
    kind: 'builder',
  },
  { dir: 'nyari-gyakorlatok', route: '/nyari-gyakorlatok/', component: 'NyariGyakorlatok', kind: 'builder' },
  { dir: 'nyolcadikos', route: '/nyolcadikos/', component: 'Nyolcadikos', kind: 'builder' },
  { dir: 'orokos-okoiskola', route: '/orokos-okoiskola/', component: 'OrokosOkoiskola', kind: 'builder' },
  { dir: 'projekt', route: '/projekt/', component: 'Projekt', kind: 'builder' },
  { dir: 'szakmai-vizsga', route: '/szakmai-vizsga/', component: 'SzakmaiVizsga', kind: 'builder' },
  { dir: 'tanari-kar', route: '/tanari-kar/', component: 'TanariKar', kind: 'builder' },
  { dir: 'technikusi-kepzesek', route: '/technikusi-kepzesek/', component: 'TechnikusiKepzesek', kind: 'builder' },
  { dir: 'vegyipar_agazat', route: '/vegyipar_agazat/', component: 'VegyiparAgazat', kind: 'builder' },
  {
    dir: 'adatkezelesi-tajekoztato',
    route: '/adatkezelesi-tajekoztato/',
    component: 'AdatkezelesiTajekoztato',
    kind: 'classic',
  },
  // No 'post' page any more: the one sample post that used to be one is a
  // Hírkezelő post now, like every other news post of the mirror (AGENT.md 6.24).
  ...DOC_PAGES,
]

/**
 * Every route the mirror has a page for, including the ones that are not in
 * PAGES because several routes share one hand-written component: the document
 * library's own listings and the 64 archives.
 *
 * `dir` is the mirror directory, and for the archives it is the route with the
 * slashes trimmed - the crawler stored `/kategoria/hirek/page/2/` at exactly
 * `kategoria/hirek/page/2/index.html`, so no mapping is needed.
 *
 * This list exists so that the checks and the title generator work from one
 * enumeration instead of each keeping its own and drifting apart.
 */
export type MirroredPage = { dir: string; route: string; kind: string }

export const MIRRORED: MirroredPage[] = [
  ...PAGES.map((page) => ({ dir: page.dir, route: page.route, kind: page.kind as string })),
  ...Object.values(archives).map((archive) => ({
    dir: archive.route.replace(/^\/|\/$/g, ''),
    route: archive.route,
    kind: 'archive',
  })),
  { dir: 'dokumentumtar', route: '/dokumentumtar/', kind: 'taxonomy' },
  ...docCategories.map((category) => ({
    dir: `dokumentum-kategoria/${category.slug}`,
    route: `/dokumentum-kategoria/${category.slug}/`,
    kind: 'taxonomy',
  })),
  ...docTags.map((tag) => ({
    dir: `dokumentum-cimke/${tag.slug}`,
    route: `/dokumentum-cimke/${tag.slug}/`,
    kind: 'taxonomy',
  })),
]
