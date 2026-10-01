import { isSafeColor } from '../../../../shared/pnw/richtext.ts'
import { DESIGN_NUMBER_LIMITS } from '../../../../shared/pnw/page-types.ts'
import type { Design, PageDocument, PageModule } from '../../../../shared/pnw/page-types.ts'

/**
 * The Szerkesztő's design settings as CSS (AGENT.md 6.20).
 *
 * The mirror's page stylesheets mark nearly everything `!important`
 * (`.page-nyolcadikos .et_pb_text_2.et_pb_text { color: #0c71c3 !important }`),
 * so an inline `style` could never win. A setting is therefore a rule of its
 * own, scoped to the page and to the node's Divi class, `!important`, and with
 * the scope class written twice so it also beats an equally specific rule that
 * sits earlier in the cascade:
 *
 *   .page-nyolcadikos.page-nyolcadikos .et_pb_text_12 { color: #c94300 !important }
 *
 * The string is built from validated values only - numbers clamped to their
 * range, colours through `isSafeColor`, enums from a fixed list - never from a
 * user string, and it is rendered as a React text child (never
 * `dangerouslySetInnerHTML`), so there is no CSS injection.
 */

const TEXT_ALIGNS = new Set(['left', 'center', 'right', 'justify'])

function px(value: number | undefined, key: keyof typeof DESIGN_NUMBER_LIMITS): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const [min, max] = DESIGN_NUMBER_LIMITS[key]
  return `${Math.round(Math.min(max, Math.max(min, value)))}px`
}

/** The declarations of a design, split by what they style: the node's box, or the text inside it. */
function declarations(design: Design): { box: string[]; text: string[]; border: string[] } {
  const box: string[] = []
  const text: string[] = []
  const border: string[] = []

  if (design.background && isSafeColor(design.background)) box.push(`background-color:${design.background}`)
  for (const [key, property] of [
    ['paddingTop', 'padding-top'],
    ['paddingBottom', 'padding-bottom'],
    ['marginTop', 'margin-top'],
    ['marginBottom', 'margin-bottom'],
  ] as const) {
    const value = px(design[key], key)
    if (value) box.push(`${property}:${value}`)
  }

  const width = px(design.borderWidth, 'borderWidth')
  if (width) {
    border.push(`border-width:${width}`, 'border-style:solid')
    if (design.borderColor && isSafeColor(design.borderColor)) border.push(`border-color:${design.borderColor}`)
  }

  if (design.color && isSafeColor(design.color)) text.push(`color:${design.color}`)
  const size = px(design.fontSize, 'fontSize')
  if (size) text.push(`font-size:${size}`)
  if (typeof design.fontWeight === 'number') {
    const [min, max] = DESIGN_NUMBER_LIMITS.fontWeight
    text.push(`font-weight:${Math.round(Math.min(max, Math.max(min, design.fontWeight)) / 100) * 100}`)
  }
  if (design.textAlign && TEXT_ALIGNS.has(design.textAlign)) text.push(`text-align:${design.textAlign}`)
  return { box, text, border }
}

const important = (list: string[]) => list.map((declaration) => `${declaration} !important`).join(';')

/** The rule for one node: `own` is its box class, `inner` the element(s) its text lives in. */
function rule(scope: string, own: string, design: Design | undefined, inner = own): string[] {
  if (!design) return []
  const { box, text, border } = declarations(design)
  const prefix = `.${scope}.${scope}`
  const out: string[] = []
  const boxLike = [...box, ...border]
  if (boxLike.length) out.push(`${prefix} ${own}{${important(boxLike)}}`)
  if (text.length) {
    const targets = [
      inner,
      `${inner} p`,
      `${inner} li`,
      `${inner} h1`,
      `${inner} h2`,
      `${inner} h3`,
      `${inner} h4`,
      `${inner} h5`,
      `${inner} h6`,
      `${inner} blockquote`,
      `${inner} .et_pb_module_header`,
    ]
    out.push(targets.map((target) => `${prefix} ${target}`).join(',') + `{${important(text)}}`)
  }
  return out
}

/** The Divi class a module of a kind wears, and where its text sits when that is not the same element. */
function moduleRules(scope: string, module: PageModule): string[] {
  if (module.index === undefined || !module.design) return []
  const n = module.index
  const own = (selector: string) => rule(scope, selector, module.design)
  switch (module.kind) {
    case 'text':
      return own(`.et_pb_text_${n}`)
    case 'image':
      return own(`.et_pb_image_${n}`)
    case 'button': {
      // The wrapper carries the spacing; the colours, size and border belong to the link itself.
      const wrapper: Design = {}
      const link: Design = {}
      for (const key of Object.keys(module.design) as (keyof Design)[]) {
        const value = module.design[key]
        if (key.startsWith('margin')) (wrapper as Record<string, unknown>)[key] = value
        else (link as Record<string, unknown>)[key] = value
      }
      return [
        ...rule(scope, `.et_pb_button_${n}_wrapper`, wrapper),
        ...rule(scope, `a.et_pb_button.et_pb_button_${n}`, link),
      ]
    }
    case 'blurb':
      return own(`.et_pb_blurb_${n}`)
    case 'divider':
      return own(`.et_pb_divider_${n}`)
    case 'video':
      return own(`.et_pb_video_${n}`)
    case 'toggle':
      return own(`.et_pb_toggle_${n}`)
    case 'post-feed':
      return own(`.et_pb_blog_${n}`)
    case 'team-member':
      return own(`.et_pb_team_member_${n}`)
    case 'social-follow':
      return own(`.et_pb_social_media_follow_${n}`)
    case 'number-counter':
      return own(`.et_pb_number_counter_${n}`)
    case 'testimonial':
      return own(`.et_pb_testimonial_${n}`)
    case 'pricing-tables':
      return own(`.et_pb_pricing_tables_${n}`)
    case 'hero-slider':
      return own(`.et_pb_fullwidth_slider_${n}`)
    case 'gallery':
      return own(`.et_pb_gallery_${n}`)
    case 'fullwidth-header':
      return own(`.et_pb_fullwidth_header_${n}`)
    case 'file-block':
      return []
  }
}

/** The page's whole design stylesheet, or '' when no node has a design - the normal case, which renders no element at all. */
export function designCss(document: PageDocument, scope: string): string {
  const rules: string[] = []
  for (const section of document.sections) {
    if (section.index !== undefined) rules.push(...rule(scope, `.et_pb_section_${section.index}`, section.design))
    for (const module of section.modules ?? []) rules.push(...moduleRules(scope, module))
    for (const row of section.rows) {
      if (row.index !== undefined) rules.push(...rule(scope, `.et_pb_row_${row.index}`, row.design))
      for (const column of row.columns) {
        if (column.index !== undefined) rules.push(...rule(scope, `.et_pb_column_${column.index}`, column.design))
        for (const module of column.modules) rules.push(...moduleRules(scope, module))
      }
    }
  }
  for (const module of document.body ?? []) rules.push(...moduleRules(scope, module))
  return rules.join('\n')
}
