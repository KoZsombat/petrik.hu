/**
 * Starter documents for "Új oldal" (AGENT.md 6.19). Each copies the
 * section/row/column structure of a real mirrored page - the teal-titled hero
 * with a lead paragraph, the three-column text block, the bordered
 * four-column card row, the image-over-text columns with their buttons - so a
 * new page already looks like the rest of the site. The styling comes from
 * builder-page.css, which copies those pages' own rules.
 */
import { nodeId } from '../../../../../shared/pnw/page-types.ts'
import type { ColumnSpan, PageColumn, PageDocument, PageModule, PageRow, PageSection } from '../../../../../shared/pnw/page-types.ts'
import type { RichTextBlock, TextRun } from '../../../../../shared/pnw/types.ts'

/** The site's two accent colours, as the mirror's pages use them. */
export const TEAL = '#72c3b6'
export const BLUE = '#0c71c3'

export function block(type: RichTextBlock['type'], runs: TextRun[], extra: Partial<RichTextBlock> = {}): RichTextBlock {
  return { id: nodeId('b'), type, ...extra, runs }
}

export const paragraph = (text: string, extra: Partial<RichTextBlock> = {}, marks: Omit<TextRun, 'text'> = {}) =>
  block('paragraph', [{ text, ...marks }], extra)

export const heading = (text: string, level: 1 | 2 | 3 | 4, color?: string) =>
  block('heading', [{ text, ...(color ? { color } : {}) }], { level })

export function text(content: RichTextBlock[], extra: Partial<Extract<PageModule, { kind: 'text' }>> = {}): PageModule {
  return { kind: 'text', id: nodeId('m'), content, ...extra }
}

export function column(span: ColumnSpan, modules: PageModule[], bordered = false): PageColumn {
  return { id: nodeId('c'), span, modules, ...(bordered ? { bordered } : {}) }
}

export function row(columns: PageColumn[]): PageRow {
  return { id: nodeId('r'), columns }
}

export function section(rows: PageRow[], extra: Partial<PageSection> = {}): PageSection {
  return { id: nodeId('s'), ...extra, rows }
}

/** /nyolcadikos/ and /kozoktatas/ open the same way: a photo, a teal <h1>, one line under it. */
export function hero(title: string, lead: string, image: string): PageSection {
  return section(
    [
      row([
        column('4_4', [
          text([heading(title, 1, TEAL)], { bgLayout: 'dark' }),
          text([paragraph(lead)], { bgLayout: 'dark' }),
        ]),
      ]),
    ],
    { first: true, background: { image } },
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

export const TEMPLATES: Template[] = [
  {
    id: 'info',
    name: 'Tájékoztató oldal',
    description: 'A „Nyolcadikosoknak” oldal felépítése: fejléckép, bevezető, három hasáb szöveg, négy keretes kártya, gomb.',
    build: (title) => ({
      sections: [
        hero(title, 'Egy mondat az oldal témájáról', '/media/wp-content/uploads/2020/09/nyolcadikosoknak-scaled.jpg'),
        section([
          row([
            column('4_4', [
              text([heading('Bevezetés', 2, BLUE)]),
              text([paragraph(LOREM, { align: 'justify' })]),
            ]),
          ]),
          row(
            ['Első téma', 'Második téma', 'Harmadik téma'].map((name) =>
              column('1_3', [
                text([paragraph(name, {}, { bold: true, color: BLUE })]),
                text([paragraph(LOREM, { align: 'justify' })]),
              ]),
            ),
          ),
          row(
            ['Első', 'Második', 'Harmadik', 'Negyedik'].map((name) =>
              column(
                '1_4',
                [
                  text([paragraph(`${name} kártya`, {}, { bold: true, color: BLUE })], { align: 'center' }),
                  text([paragraph('Rövid alcím', {}, { bold: true, color: TEAL })], { align: 'center' }),
                  text([
                    block('bulleted-list', [{ text: 'első pont' }]),
                    block('bulleted-list', [{ text: 'második pont' }]),
                    block('bulleted-list', [{ text: 'harmadik pont' }]),
                  ]),
                ],
                true,
              ),
            ),
          ),
          row([
            column('4_4', [
              { kind: 'button', id: nodeId('m'), label: 'Tovább a kezdőlapra', to: '/', align: 'center' },
            ]),
          ]),
        ]),
      ],
    }),
  },
  {
    id: 'showcase',
    name: 'Képes bemutató',
    description: 'A „Közoktatás” oldal felépítése: fejléckép, hullámos kiemelt sáv, három kép szöveggel és gombbal.',
    build: (title) => ({
      sections: [
        hero(title, 'Egy mondat az oldal témájáról', '/media/wp-content/uploads/2020/09/tanari-kar.jpg'),
        section(
          [
            row([
              column('4_4', [
                text([heading('Kiemelt üzenet', 2, BLUE)]),
                text([paragraph(LOREM)]),
              ]),
            ]),
          ],
          { dividerTop: true, dividerBottom: true },
        ),
        section([
          row([column('4_4', [text([heading('Kínálatunk', 2, BLUE)])])]),
          row(
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
              column('1_3', [
                { kind: 'image', id: nodeId('m'), src: image, alt: name },
                text([heading(name, 3, BLUE), paragraph('Rövid alcím', {}, { color: TEAL, bold: true }), paragraph(LOREM)]),
                { kind: 'button', id: nodeId('m'), label: 'Tudj meg róla többet', to, align: 'right' },
              ]),
            ),
          ),
        ]),
      ],
    }),
  },
  {
    id: 'blank',
    name: 'Egyszerű oldal',
    description: 'Fejléckép a címmel és egy szövegblokk - innen építheted fel a saját szakaszaidat.',
    build: (title) => ({
      sections: [
        hero(title, 'Egy mondat az oldal témájáról', '/media/wp-content/uploads/2020/09/tanari-kar.jpg'),
        section([row([column('4_4', [text([paragraph(LOREM)])])])]),
      ],
    }),
  },
]

/** A new, empty section for "Új szakasz hozzáadása" - one full-width text block. */
export function newSection(): PageSection {
  return section([row([column('4_4', [text([paragraph('Új szakasz szövege')])])])])
}

/** A fresh module of a kind, for the "+ modul" picker. */
export function newModule(kind: PageModule['kind']): PageModule {
  const id = nodeId('m')
  switch (kind) {
    case 'text':
      return { kind, id, content: [paragraph('Új szöveg')] }
    case 'image':
      return { kind, id, src: '/media/wp-content/uploads/2020/09/tanari-kar.jpg', alt: '' }
    case 'button':
      return { kind, id, label: 'Új gomb', to: '/' }
    case 'blurb':
      return { kind, id, title: 'Új kiemelés', content: [paragraph('Rövid leírás')] }
    case 'divider':
      return { kind, id }
    case 'video':
      return { kind, id, url: '' }
    case 'toggle':
      return { kind, id, title: 'Új lenyíló', content: [paragraph('A lenyíló tartalma')] }
  }
}

export const MODULE_LABEL: Record<PageModule['kind'], string> = {
  text: 'Szöveg',
  image: 'Kép',
  button: 'Gomb',
  blurb: 'Kiemelés',
  divider: 'Elválasztó',
  video: 'Videó',
  toggle: 'Lenyíló',
}

/** The four row layouts the editor offers, as Divi names them. */
export const ROW_LAYOUTS: { label: string; spans: ColumnSpan[] }[] = [
  { label: '1 hasáb', spans: ['4_4'] },
  { label: '2 hasáb', spans: ['1_2', '1_2'] },
  { label: '3 hasáb', spans: ['1_3', '1_3', '1_3'] },
  { label: '4 hasáb', spans: ['1_4', '1_4', '1_4', '1_4'] },
]
