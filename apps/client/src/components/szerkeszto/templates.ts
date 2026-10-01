/**
 * Starter documents for "Új oldal" and the factories of the tree editor's
 * "+" buttons (AGENT.md 6.20). Each template copies the section/row/column
 * structure of a real mirrored page - the teal-titled hero with a lead
 * paragraph, the three-column text block, the bordered four-column card row,
 * the image-over-text columns with their buttons - so a new page already looks
 * like the rest of the site. The styling comes from builder-page.css, which
 * copies those pages' own rules.
 */
import { normalizeDocument } from '../../../../../shared/pnw/page-doc.ts'
import type { IndexKey } from '../../../../../shared/pnw/page-doc.ts'
import { nodeId, COLUMN_MODULE_KINDS } from '../../../../../shared/pnw/page-types.ts'
import type {
  ColumnSpan,
  PageColumn,
  PageDocument,
  PageModule,
  PageModuleKind,
  PageRow,
  PageSection,
} from '../../../../../shared/pnw/page-types.ts'
import { el } from '../../../../../shared/pnw/rich-content.ts'
import type { RichContent, RichElement, RichNode } from '../../../../../shared/pnw/rich-content.ts'
import type { RichStyle } from '../../../../../shared/pnw/types.ts'

/** The site's two accent colours, as the mirror's pages use them. */
export const TEAL = '#72c3b6'
export const BLUE = '#0c71c3'

/* --- content ------------------------------------------------------------------ */

export const paragraph = (text: string, style?: RichStyle, marks: { bold?: boolean; color?: string } = {}): RichElement => {
  let inner: RichNode[] = [text]
  if (marks.color) inner = [el('span', inner, { style: { color: marks.color } })]
  if (marks.bold) inner = [el('strong', inner)]
  return el('p', inner, { style })
}

export const heading = (text: string, level: 1 | 2 | 3 | 4, color?: string): RichElement =>
  el(`h${level}` as 'h1', color ? [el('span', [text], { style: { color } })] : [text])

export const bullets = (items: string[]): RichElement => el('ul', items.map((item) => el('li', [item])))

/** Blocks as content: a single space between them, like the mirror's own markup. */
export function blocks(...nodes: RichElement[]): RichContent {
  return nodes.flatMap((node, at) => (at === 0 ? [node] : [' ', node]))
}

/* --- factories ---------------------------------------------------------------- */

type Alloc = (key: IndexKey) => number

export function text(alloc: Alloc, content: RichContent, extra: Partial<Extract<PageModule, { kind: 'text' }>> = {}): PageModule {
  return { kind: 'text', id: nodeId('m'), index: alloc('text'), align: 'left', content, ...extra }
}

export function column(alloc: Alloc, span: ColumnSpan, modules: PageModule[], className?: string): PageColumn {
  return { id: nodeId('c'), index: alloc('column'), span, modules, ...(className ? { className } : {}) }
}

export function row(alloc: Alloc, columns: PageColumn[]): PageRow {
  return {
    id: nodeId('r'),
    index: alloc('row'),
    columns: columns.map((entry, at) => ({ ...entry, last: at === columns.length - 1 })),
  }
}

export function section(alloc: Alloc, rows: PageRow[], extra: Partial<PageSection> = {}): PageSection {
  return { id: nodeId('s'), index: alloc('section'), ...extra, rows }
}

/** /nyolcadikos/ and /kozoktatas/ open the same way: a photo, a teal <h1>, one line under it. */
function hero(alloc: Alloc, title: string, lead: string, image: string): PageSection {
  return section(
    alloc,
    [
      row(alloc, [
        column(alloc, '4_4', [
          text(alloc, [heading(title, 1, TEAL)], { bgLayout: 'dark' }),
          text(alloc, [paragraph(lead)], { bgLayout: 'dark' }),
        ]),
      ]),
    ],
    { first: true, withBackground: true, background: { image } },
  )
}

export type Template = {
  id: string
  name: string
  description: string
  build: (title: string) => PageDocument
}

const LOREM =
  'Írd ide a bekezdés szövegét. A szerkesztőben minden szöveg, kép és gomb átírható, a szakaszok átrendezhetők.'

const BORDER = 'et_pb_with_border'

function make(sections: (alloc: Alloc) => PageSection[]): PageDocument {
  // One allocator for the whole document: every node gets its own Divi number.
  const counters = new Map<IndexKey, number>()
  const alloc: Alloc = (key) => {
    const value = counters.get(key) ?? 0
    counters.set(key, value + 1)
    return value
  }
  return normalizeDocument({ template: 'builder', sections: sections(alloc) })
}

export const TEMPLATES: Template[] = [
  {
    id: 'info',
    name: 'Tájékoztató oldal',
    description: 'A „Nyolcadikosoknak” oldal felépítése: fejléckép, bevezető, három hasáb szöveg, négy keretes kártya, gomb.',
    build: (title) =>
      make((a) => [
        hero(a, title, 'Egy mondat az oldal témájáról', '/media/wp-content/uploads/2020/09/nyolcadikosoknak-scaled.jpg'),
        section(a, [
          row(a, [
            column(a, '4_4', [
              text(a, [heading('Bevezetés', 2, BLUE)]),
              text(a, [paragraph(LOREM, { textAlign: 'justify' })]),
            ]),
          ]),
          row(
            a,
            ['Első téma', 'Második téma', 'Harmadik téma'].map((name) =>
              column(a, '1_3', [
                text(a, [paragraph(name, undefined, { bold: true, color: BLUE })]),
                text(a, [paragraph(LOREM, { textAlign: 'justify' })]),
              ]),
            ),
          ),
          row(
            a,
            ['Első', 'Második', 'Harmadik', 'Negyedik'].map((name) =>
              column(
                a,
                '1_4',
                [
                  text(a, [paragraph(`${name} kártya`, undefined, { bold: true, color: BLUE })], { align: 'center' }),
                  text(a, [paragraph('Rövid alcím', undefined, { bold: true, color: TEAL })], { align: 'center' }),
                  text(a, [bullets(['első pont', 'második pont', 'harmadik pont'])]),
                ],
                BORDER,
              ),
            ),
          ),
          row(a, [
            column(a, '4_4', [
              { kind: 'button', id: nodeId('m'), index: a('button'), label: 'Tovább a kezdőlapra', to: '/', align: 'center' },
            ]),
          ]),
        ]),
      ]),
  },
  {
    id: 'showcase',
    name: 'Képes bemutató',
    description: 'A „Közoktatás” oldal felépítése: fejléckép, hullámos kiemelt sáv, három kép szöveggel és gombbal.',
    build: (title) =>
      make((a) => [
        hero(a, title, 'Egy mondat az oldal témájáról', '/media/wp-content/uploads/2020/09/tanari-kar.jpg'),
        section(
          a,
          [
            row(a, [
              column(a, '4_4', [text(a, [heading('Kiemelt üzenet', 2, BLUE)]), text(a, [paragraph(LOREM)])]),
            ]),
          ],
          { dividerTop: true, dividerBottom: true },
        ),
        section(a, [
          row(a, [column(a, '4_4', [text(a, [heading('Kínálatunk', 2, BLUE)])])]),
          row(
            a,
            [
              ['Vegyipar', '/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg', '/vegyipar_agazat/'],
              [
                'Környezetvédelem és vízügy',
                '/media/wp-content/uploads/2020/08/kornyezetvedelem-agazat.jpg',
                '/kornyezetvedelem_es_vizugy_agazat/',
              ],
              [
                'Informatika és távközlés',
                '/media/wp-content/uploads/2020/08/informatika-agazat.jpg',
                '/informatika_es_tavkozles_agazat/',
              ],
            ].map(([name, image, to]) =>
              column(a, '1_3', [
                { kind: 'image', id: nodeId('m'), index: a('image'), src: image, alt: name },
                text(a, blocks(heading(name, 3, BLUE), paragraph('Rövid alcím', undefined, { color: TEAL, bold: true }), paragraph(LOREM))),
                { kind: 'button', id: nodeId('m'), index: a('button'), label: 'Tudj meg róla többet', to, align: 'right' },
              ]),
            ),
          ),
        ]),
      ]),
  },
  {
    id: 'blank',
    name: 'Egyszerű oldal',
    description: 'Fejléckép a címmel és egy szövegblokk - innen építheted fel a saját szakaszaidat.',
    build: (title) =>
      make((a) => [
        hero(a, title, 'Egy mondat az oldal témájáról', '/media/wp-content/uploads/2020/09/tanari-kar.jpg'),
        section(a, [row(a, [column(a, '4_4', [text(a, [paragraph(LOREM)])])])]),
      ]),
  },
]

/** A new, empty section for "Új szakasz hozzáadása" - one full-width text block. */
export function newSection(alloc: Alloc): PageSection {
  return section(alloc, [row(alloc, [column(alloc, '4_4', [text(alloc, [paragraph('Új szakasz szövege')])])])])
}

export function newRow(alloc: Alloc): PageRow {
  return row(alloc, [column(alloc, '4_4', [])])
}

/** A fresh module of a kind, for the "+ modul" picker. Its Divi number is one above the highest of its kind. */
export function newModule(kind: PageModuleKind, alloc: Alloc): PageModule {
  const id = nodeId('m')
  const index = alloc(kind)
  switch (kind) {
    case 'text':
      return { kind, id, index, align: 'left', content: [paragraph('Új szöveg')] }
    case 'image':
      return { kind, id, index, src: '/media/wp-content/uploads/2020/09/tanari-kar.jpg', alt: '' }
    case 'button':
      return { kind, id, index, label: 'Új gomb', to: '/', align: 'left' }
    case 'blurb':
      return { kind, id, index, title: 'Új kiemelés', content: [paragraph('Rövid leírás')] }
    case 'divider':
      return { kind, id, index }
    case 'video':
      return { kind, id, index, url: '' }
    case 'toggle':
      return { kind, id, index, title: 'Új lenyíló', content: [paragraph('A lenyíló tartalma')] }
    case 'post-feed':
      return { kind, id, index, items: [], columns: 3, align: 'left' }
    case 'team-member':
      return { kind, id, index, name: 'Név', position: 'Beosztás', align: 'center' }
    case 'social-follow':
      return { kind, id, index, networks: [], align: 'left' }
    case 'number-counter':
      return { kind, id, index, value: 100, title: 'Felirat', suffix: '' }
    case 'testimonial':
      return { kind, id, index, author: 'Név', align: 'left', content: [paragraph('Idézet')] }
    case 'pricing-tables':
      return { kind, id, index, tables: [{ title: 'Cím', sum: '', items: ['Első sor'] }] }
    case 'hero-slider':
      return {
        kind,
        id,
        index,
        slides: [{ image: '/media/wp-content/uploads/2020/09/tanari-kar.jpg' }],
        intervalMs: 7000,
      }
    case 'gallery':
      return { kind, id, index, items: [], perPage: 4 }
    case 'fullwidth-header':
      return { kind, id, index, heading: 'Fejléc', text: '', buttons: [], align: 'center' }
    case 'file-block':
      return { kind, id, index, embed: '', href: '', label: 'Fájl', buttonLabel: 'Letöltés', embedLabel: 'Fájl beágyazása' }
  }
}

export const MODULE_LABEL: Record<PageModuleKind, string> = {
  text: 'Szöveg',
  image: 'Kép',
  button: 'Gomb',
  blurb: 'Kiemelés',
  divider: 'Elválasztó',
  video: 'Videó',
  toggle: 'Lenyíló',
  'post-feed': 'Hírlista',
  'team-member': 'Személy',
  'social-follow': 'Közösségi linkek',
  'number-counter': 'Számláló',
  testimonial: 'Idézet',
  'pricing-tables': 'Táblázatok',
  'hero-slider': 'Diavetítő',
  gallery: 'Képgaléria',
  'fullwidth-header': 'Teljes szélességű fejléc',
  'file-block': 'Fájl (PDF)',
}

/** The kinds the "+ Modul" picker offers in a column. */
export const PICKER_KINDS = COLUMN_MODULE_KINDS

/** The row layouts the editor offers as one-click presets, as Divi names them. Any column's width can still be set on its own. */
export const ROW_LAYOUTS: { label: string; spans: ColumnSpan[] }[] = [
  { label: '1', spans: ['4_4'] },
  { label: '1/2 + 1/2', spans: ['1_2', '1_2'] },
  { label: '1/3 ×3', spans: ['1_3', '1_3', '1_3'] },
  { label: '1/4 ×4', spans: ['1_4', '1_4', '1_4', '1_4'] },
  { label: '2/3 + 1/3', spans: ['2_3', '1_3'] },
  { label: '1/3 + 2/3', spans: ['1_3', '2_3'] },
  { label: '3/4 + 1/4', spans: ['3_4', '1_4'] },
  { label: '1/4 + 3/4', spans: ['1_4', '3_4'] },
]

export const SPAN_LABEL: Record<ColumnSpan, string> = {
  '4_4': 'teljes',
  '3_4': '3/4',
  '2_3': '2/3',
  '3_5': '3/5',
  '2_5': '2/5',
  '1_2': '1/2',
  '1_3': '1/3',
  '1_4': '1/4',
  '1_5': '1/5',
  '1_6': '1/6',
}
