/**
 * The Szerkesztő's document model (AGENT.md 6.19) - shared by the editor
 * (src/components/szerkeszto/), the public renderer (src/components/
 * pagebuilder/) and the backend's validation (server/lib/validation.ts).
 *
 * Two mechanisms, one model:
 * - a **builder page** (a page created in the Szerkesztő) is a whole
 *   `PageDocument`, rendered through the same Divi primitives a generated
 *   page uses, so its markup - and therefore its look - is the same shape;
 * - a **mirrored page** keeps its generated TSX untouched and gains a
 *   `PageOverrides` layer, keyed by the Divi `index` its modules already pass.
 */
import type { Align, RichTextDocument } from './types.ts'

/** Divi's column widths, named as fractions of the row. Lives here so shared/ never imports from src/. */
export type ColumnSpan = '4_4' | '3_4' | '2_3' | '3_5' | '2_5' | '1_2' | '1_3' | '1_4' | '1_5' | '1_6'

export const COLUMN_SPANS: ColumnSpan[] = ['4_4', '3_4', '2_3', '3_5', '2_5', '1_2', '1_3', '1_4', '1_5', '1_6']

/** Divi's text-module alignment (note `justified`, not CSS's `justify`). */
export type TextAlign = 'left' | 'center' | 'right' | 'justified'

export type PageModule =
  | { kind: 'text'; id: string; align?: TextAlign; bgLayout?: 'light' | 'dark'; content: RichTextDocument }
  | { kind: 'image'; id: string; src: string; alt?: string; href?: string; width?: number; height?: number }
  | { kind: 'button'; id: string; label: string; to?: string; href?: string; align?: Align }
  | {
      kind: 'blurb'
      id: string
      title?: string
      titleHref?: string
      image?: { src: string; alt?: string }
      icon?: string
      content: RichTextDocument
    }
  | { kind: 'divider'; id: string }
  | { kind: 'video'; id: string; url: string }
  | { kind: 'toggle'; id: string; title: string; content: RichTextDocument }

export type PageModuleKind = PageModule['kind']

export const MODULE_KINDS: PageModuleKind[] = ['text', 'image', 'button', 'blurb', 'divider', 'video', 'toggle']

export type PageColumn = {
  id: string
  span: ColumnSpan
  /** Divi's `et_pb_with_border` - the teal top border of /nyolcadikos/'s card columns (builder-page.css). */
  bordered?: boolean
  modules: PageModule[]
}
export type PageRow = { id: string; gutters?: 3 | 4; columns: PageColumn[] }
export type PageSection = {
  id: string
  /** The hero band: the first section of a page, Divi's `et_pb_section_first`. */
  first?: boolean
  background?: { color?: string; image?: string }
  dividerTop?: boolean
  dividerBottom?: boolean
  rows: PageRow[]
}
export type PageDocument = { sections: PageSection[] }

export type PageStatus = 'draft' | 'publish'

/** A page created in the Szerkesztő - one row of the `pages` table. */
export type BuilderPage = {
  id: string
  /** Served at `/<slug>/`. Stable after creation, like a post's slug. */
  slug: string
  title: string
  description: string
  document: PageDocument
  status: PageStatus
  authorId: string
  createdAt: string
  modifiedAt: string
}

/** What `/api/public/site` hands the public site: published pages only, no ids or authors. */
export type PublicPage = Pick<BuilderPage, 'slug' | 'title' | 'description' | 'document'>

/* --- the override layer for mirrored pages ------------------------------- */

export type TextOverride = { content: RichTextDocument }
export type ImageOverride = { src?: string; alt?: string; href?: string }
export type ButtonOverride = { label?: string; to?: string; href?: string }
export type BlurbOverride = { title?: string; content?: RichTextDocument }

export type ModuleOverrideMap = {
  text: TextOverride
  image: ImageOverride
  button: ButtonOverride
  blurb: BlurbOverride
}

/** The module types a mirrored page's content can be overridden on. */
export type OverrideKind = keyof ModuleOverrideMap

export const OVERRIDE_KINDS: OverrideKind[] = ['text', 'image', 'button', 'blurb']

export type ModuleOverride = ModuleOverrideMap[OverrideKind]

/** `'text:12'` - the module type and the Divi index the generated component passes. */
export type OverrideKey = `${OverrideKind}:${number}`

export function overrideKey(kind: OverrideKind, index: number): OverrideKey {
  return `${kind}:${index}`
}

/**
 * The override layer for a mirrored page. Keys are `<module-type>:<divi index>`
 * - which is why regenerating a page with a different module order would
 * silently move every override onto a different module (AGENT.md 6.19).
 */
export type PageOverrides = {
  route: string
  modules: Record<string, ModuleOverride>
  /** Section `index` props. */
  hiddenSections: number[]
  /** Section `index` props in display order; omitted unless the user reordered. */
  sectionOrder?: number[]
  /** Appended below the page, rendered by PageExtras.tsx. */
  extraSections: PageSection[]
  /** `<head>` overrides. */
  title?: string
  description?: string
  /** "Rejtés": the page is served as the 404 page (a mirrored page cannot really be deleted). */
  hidden?: boolean
}

export function emptyOverrides(route: string): PageOverrides {
  return { route, modules: {}, hiddenSections: [], extraSections: [] }
}

/* --- the editable-module inventory of the mirrored pages ------------------- */

/**
 * `content` is the module's mirror markup converted to rich text - the
 * editor's starting point. It is `null` when that conversion would lose
 * something (a table, an inline image, a styled <div>...): such a module is
 * listed read-only instead of being silently degraded, and `lossy` says why.
 */
export type InventoryModule =
  | { kind: 'text'; index: number; section: number; text: string; content: RichTextDocument | null; lossy?: string }
  | { kind: 'image'; index: number; section: number; src: string; alt: string; href?: string }
  | { kind: 'button'; index: number; section: number; label: string; to?: string; href?: string }
  | {
      kind: 'blurb'
      index: number
      section: number
      title: string
      text: string
      content: RichTextDocument | null
      lossy?: string
    }

/** A Divi section of a mirrored page, by the `index` its <Section> passes, with a snippet to recognise it by. */
export type InventorySection = { index: number; text: string }

export type PageInventory = {
  /** The component under src/pages - shown next to the route in the editor. */
  component: string
  kind: 'builder' | 'docs' | 'post'
  sections: InventorySection[]
  modules: InventoryModule[]
}

/* --- the menu ------------------------------------------------------------ */

/** Structurally the same as src/data/site.ts's MenuItem, which shared/ cannot import. */
export type MenuNode = {
  label: string
  to?: string
  href?: string
  children?: MenuNode[]
}

/** Both menus of the site: the main navigation and the green top bar's links. */
export type SiteMenu = {
  primary: MenuNode[]
  secondary: MenuNode[]
}

/** Everything the public site reads from the Szerkesztő, in one fetch (SiteContentProvider.tsx). */
export type PublicSiteContent = {
  pages: PublicPage[]
  overrides: Record<string, PageOverrides>
  menu: SiteMenu | null
}

/* --- ids ------------------------------------------------------------------ */

let counter = 0

/** Unique within a document; the editor mints these for every new section/row/column/module. */
export function nodeId(prefix: string): string {
  counter += 1
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}`
}

/**
 * The slugs a builder page may never take: every top-level route the app
 * already serves (so a builder page can never shadow one), plus the prefixes
 * of the route families. The server checks new slugs against this.
 */
export const RESERVED_SLUGS = new Set([
  'about-us',
  'adatvedelem',
  'allas',
  'bemutatkozas',
  'ebed',
  'egeszsegugy',
  'elerhetoseg',
  'erettsegi-vizsga',
  'in-memoriam',
  'informatika_es_tavkozles_agazat',
  'kollegiumi-lehetosegek',
  'kornyezetvedelem_es_vizugy_agazat',
  'kozoktatas',
  'kozossegi-szolgalat',
  'languagecert-vizsgak',
  'nyari-gyakorlatok',
  'nyolcadikos',
  'orokos-okoiskola',
  'projekt',
  'szakmai-vizsga',
  'tanari-kar',
  'technikusi-kepzesek',
  'vegyipar_agazat',
  'adatkezelesi-tajekoztato',
  'kereses',
  'hirkezelo',
  'bejelentkezes',
  'szerkeszto',
  'hirek',
  'dokumentumtar',
  'dokumentum-kategoria',
  'dokumentum-cimke',
  'docs',
  'kutatok-ejszakaja-a-petrikben',
  'kategoria',
  'author',
  'api',
  'uploads',
  'media',
  'fonts',
])
