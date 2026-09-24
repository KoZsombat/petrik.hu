/**
 * Walks a Divi builder tree and prints it as a React page component.
 *
 * The output is a scaffold that gets reviewed before it lands in src/pages.
 * A module the walker does not recognise is reported on stderr rather than
 * skipped quietly, so nothing can disappear from a page unnoticed.
 *
 *   node --experimental-strip-types scripts/walk.ts <page-dir> [options]
 *
 *     --report        print an inventory instead of JSX
 *     --scope=<class> the page's scoped design-stylesheet class
 *     --kind=<kind>   builder | classic | docs | post; sniffed when omitted
 *     --up=<n>        how many levels the page sits below src/pages (default 1)
 *
 * `home` stands for the site root.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'
import { MIRROR_ROOT } from './mirror.ts'
import {
  blockJsx,
  blocksOf,
  classesOf,
  escapeText,
  hasClass,
  indexOf,
  resolveUrl,
  rewriteUrl,
} from './extract.ts'
import type { PageEntry } from './pages.ts'

const LAYOUT = new Set(['section', 'row', 'column', 'row_inner', 'column_inner'])

const q = (value: string) => JSON.stringify(value)

/**
 * A JSX prop carrying a string.
 *
 * A plain attribute takes its contents literally - JSX performs no escape
 * processing there - so a value holding a quote, a tab or a newline has to go
 * through a JS string in an expression container instead. The mirror really
 * does contain tabs inside headings, and writing one as a plain attribute
 * would render a backslash followed by a t.
 */
function attr(name: string, value: string): string {
  // If JSON.stringify changed anything beyond adding the outer quotes, the
  // value holds something a plain attribute cannot carry. Ampersands and
  // apostrophes join that test because JSX decodes HTML entities in attributes.
  const AMPERSAND = String.fromCharCode(38)
  const APOSTROPHE = String.fromCharCode(39)
  const plain =
    q(value) === `"${value}"` && !value.includes(AMPERSAND) && !value.includes(APOSTROPHE)
  return plain ? `${name}="${value}"` : `${name}={${q(value)}}`
}

/** Wraps children in an element, indenting them one level. */
function wrap(open: string, children: string[], close: string): string {
  if (!children.length) return `${open.replace(/>$/, '')} />`
  const body = children
    .map((child) => child.split('\n').map((line) => '  ' + line).join('\n'))
    .join('\n')
  return `${open}\n${body}\n${close}`
}

function alignOf(el: HTMLElement): string {
  for (const cls of classesOf(el)) {
    const match = /^et_pb_text_align_(left|right|center|justified)$/.exec(cls)
    if (match) return match[1]
  }
  return 'left'
}

/** Image attributes as JSX props, with URLs repointed at /media. */
function imageProps(img: HTMLElement | null, depth: number): string[] {
  if (!img) return []
  const props = [attr('src', rewriteUrl(img.getAttribute('src') ?? '', depth))]
  const alt = img.getAttribute('alt')
  if (alt) props.push(attr('alt', alt))
  const width = img.getAttribute('width')
  const height = img.getAttribute('height')
  if (width) props.push(`width={${Number(width)}}`)
  if (height) props.push(`height={${Number(height)}}`)
  const srcset = img.getAttribute('srcset')
  if (srcset) {
    const rewritten = srcset
      .split(',')
      .map((part) => {
        const [url, size] = part.trim().split(/\s+/)
        return `${rewriteUrl(url, depth)}${size ? ' ' + size : ''}`
      })
      .join(', ')
    props.push(attr('srcSet', rewritten))
  }
  const sizes = img.getAttribute('sizes')
  if (sizes) props.push(attr('sizes', sizes))
  /*
   * WordPress did not lazy-load every image, and the difference is not
   * cosmetic: an image with no width/height and `loading="lazy"` has nothing to
   * reserve space with, so it sits at a few pixels tall until it scrolls into
   * view. One image module on the home page is exactly that - no dimensions and
   * no lazy attribute in the mirror - and hard-coding the attribute in the
   * component collapsed it to 5px where the mirror had 198.
   */
  const loading = img.getAttribute('loading')
  if (loading) props.push(attr('loading', loading))
  return props
}

/**
 * The same attributes as a JSX object prop, e.g. image={{ src: "...", ... }}.
 * Note the doubled braces: one pair opens the JSX expression, the other is the
 * object literal itself.
 */
function imageObject(img: HTMLElement, depth: number): string {
  const fields = imageProps(img, depth).map((prop) =>
    prop.replace(/^([a-zA-Z]+)=\{(\d+)\}$/, '$1: $2').replace(/^([a-zA-Z]+)=/, '$1: '),
  )
  return `{{ ${fields.join(', ')} }}`
}

/**
 * A module's JSX, or null when the walker did not recognise it. An empty `jsx`
 * means the module was understood and deliberately renders nothing - which is
 * different from a gap, and is not reported as one.
 */
type Emit = { jsx: string; imports: string[] } | null

function emitModule(el: HTMLElement, depth: number, unknown: Set<string>): Emit {
  const classes = classesOf(el)
  // Most modules are named et_pb_<kind>_<n>; the button wrapper is the
  // exception, so it is matched on its own class.
  const kind = classes.includes('et_pb_button_module_wrapper')
    ? 'button'
    : classes
        .map((cls) => /^et_pb_([a-z_]+?)_\d+$/.exec(cls)?.[1])
        .find((name) => name && !LAYOUT.has(name))

  switch (kind) {
    case 'text': {
      const blocks = blocksOf(el.querySelector('.et_pb_text_inner'), depth)
      const textProps = [
        `index={${indexOf(el, 'et_pb_text')}}`,
        `align="${alignOf(el)}"`,
        // Divi decides the text colour from this; on a hero photo it is dark.
        ...(hasClass(el, 'et_pb_bg_layout_dark') ? ['bgLayout="dark"'] : []),
        ...borderProp(el),
      ]
      const open = `<Text ${textProps.join(' ')}>`
      return { jsx: wrap(open, blocks, '</Text>'), imports: ['Text'] }
    }

    case 'image': {
      const props = imageProps(el.querySelector('img'), depth)
      const href = el.querySelector('a')?.getAttribute('href')
      if (href) props.push(attr('href', rewriteUrl(href, depth)))
      props.push(`index={${indexOf(el, 'et_pb_image')}}`)
      return { jsx: `<Image ${props.join(' ')} />`, imports: ['Image'] }
    }

    case 'divider':
      return { jsx: `<Divider index={${indexOf(el, 'et_pb_divider')}} />`, imports: ['Divider'] }

    case 'video': {
      const iframe = el.querySelector('iframe')
      const id = /embed\/([A-Za-z0-9_-]+)/.exec(iframe?.getAttribute('src') ?? '')?.[1]
      if (!id) {
        unknown.add('video (no YouTube id)')
        return null
      }
      const title = iframe?.getAttribute('title') ?? 'Videó'
      return {
        jsx: `<VideoEmbed index={${indexOf(el, 'et_pb_video')}} ${attr('videoId', id)} ${attr('title', title)} />`,
        imports: ['VideoEmbed'],
      }
    }

    case 'blurb': {
      const header = el.querySelector('.et_pb_module_header')
      const img = el.querySelector('.et_pb_main_blurb_image img')
      const icon = el.querySelector('.et_pb_main_blurb_image .et-pb-icon')
      const position = classes.includes('et_pb_blurb_position_left')
        ? 'left'
        : classes.includes('et_pb_blurb_position_right')
          ? 'right'
          : 'top'
      const props = [
        `index={${indexOf(el, 'et_pb_blurb')}}`,
        `align="${alignOf(el)}"`,
        `position="${position}"`,
      ]
      if (header) {
        props.push(attr('title', header.text.trim()))
        const href = header.querySelector('a')?.getAttribute('href')
        if (href) props.push(attr('titleHref', rewriteUrl(href, depth)))
      }
      if (img) props.push(`image=${imageObject(img, depth)}`)
      else if (icon?.text.trim()) props.push(attr('icon', icon.text.trim()))

      // The heading sits inside the description block, so it has to be skipped
      // here or it would be emitted twice: once as the title, once as content.
      const blocks = blocksOf(el.querySelector('.et_pb_blurb_description'), depth, [header])
      return { jsx: wrap(`<Blurb ${props.join(' ')}>`, blocks, '</Blurb>'), imports: ['Blurb'] }
    }

    case 'team_member': {
      const header = el.querySelector('.et_pb_module_header')
      const name = header?.text.trim() ?? ''
      const role = el.querySelector('.et_pb_member_position')?.text.trim()
      const img = el.querySelector('.et_pb_team_member_image img')
      const props = [`index={${indexOf(el, 'et_pb_team_member')}}`, attr('name', name)]
      const level = /^h(\d)$/.exec(header?.rawTagName?.toLowerCase() ?? '')?.[1]
      if (level && level !== '6') props.push(`headingLevel={${Number(level)}}`)
      if (role) props.push(attr('position', role))
      if (img) props.push(`image=${imageObject(img, depth)}`)
      props.push(`align="${alignOf(el)}"`, ...borderProp(el))

      // Some members carry a paragraph or two under the job title.
      const description = el.querySelector('.et_pb_team_member_description')
      const body = blocksOf(description, depth, [
        header,
        description?.querySelector('.et_pb_member_position') ?? null,
      ])
      if (!body.length) return { jsx: `<TeamMember ${props.join(' ')} />`, imports: ['TeamMember'] }
      return {
        jsx: wrap(`<TeamMember ${props.join(' ')}>`, body, '</TeamMember>'),
        imports: ['TeamMember'],
      }
    }

    case 'toggle': {
      const title = el.querySelector('.et_pb_toggle_title')?.text.trim() ?? ''
      const blocks = blocksOf(el.querySelector('.et_pb_toggle_content'), depth)
      const props = [`index={${indexOf(el, 'et_pb_toggle')}}`, attr('title', title)]
      if (classes.includes('et_pb_toggle_open')) props.push('defaultOpen')
      return { jsx: wrap(`<Toggle ${props.join(' ')}>`, blocks, '</Toggle>'), imports: ['Toggle'] }
    }

    case 'button': {
      const anchor = el.querySelector('a.et_pb_button')
      if (!anchor) return null
      const href = rewriteUrl(anchor.getAttribute('href') ?? '', depth)
      const align =
        /et_pb_button_alignment_(left|right|center)/.exec(el.getAttribute('class') ?? '')?.[1] ?? 'left'
      const icon = anchor.getAttribute('data-icon')
      const props = [`index={${indexOf(anchor, 'et_pb_button')}}`]
      props.push(href.startsWith('http') ? attr('href', href) : attr('to', href))
      props.push(`align="${align}"`)
      if (icon) props.push(attr('icon', icon))
      return {
        jsx: `<Button ${props.join(' ')}>${escapeText(anchor.text.trim())}</Button>`,
        imports: ['Button'],
      }
    }

    case 'number_counter': {
      const props = [
        `index={${indexOf(el, 'et_pb_number_counter')}}`,
        `value={${Number(el.getAttribute('data-number-value') ?? '0')}}`,
        attr('title', el.querySelector('.title')?.text.trim() ?? ''),
      ]
      const sign = el.querySelector('.percent-sign')?.text.trim()
      if (sign) props.push(attr('suffix', sign))
      return { jsx: `<NumberCounter ${props.join(' ')} />`, imports: ['NumberCounter'] }
    }

    case 'testimonial': {
      const author = el.querySelector('.et_pb_testimonial_author')?.text.trim() ?? ''
      // getAttribute returns the style already decoded, so the quotes inside
      // url("...") are real quotes rather than &quot; entities.
      const style = el.querySelector('.et_pb_testimonial_portrait')?.getAttribute('style') ?? ''
      const portrait = /url\(\s*["']?([^"')]+)/.exec(style)?.[1]?.trim()
      const blocks = blocksOf(el.querySelector('.et_pb_testimonial_content'), depth)
      const props = [
        `index={${indexOf(el, 'et_pb_testimonial')}}`,
        attr('author', author),
        `align="${alignOf(el)}"`,
      ]
      if (portrait) props.push(attr('portrait', rewriteUrl(portrait, depth)))
      return {
        jsx: wrap(`<Testimonial ${props.join(' ')}>`, blocks, '</Testimonial>'),
        imports: ['Testimonial'],
      }
    }

    case 'blog': {
      // The cards themselves come from src/data/posts.ts; the feed contributes
      // only the order and the meta this particular module chose to render.
      //
      // In the mirror the articles already sit inside Salvattore's columns, so
      // document order is column-major (0, 3, 6, 1, 4, 7 ...). The original
      // position is in the et_pb_blog_item_<feed>_<n> class, and sorting by it
      // recovers the order the feed was written in - which is what gets dealt
      // into columns again at render time.
      const ordered = el.querySelectorAll('article.et_pb_post').slice().sort((a, b) => {
        const positionOf = (article: HTMLElement) =>
          Number(
            classesOf(article)
              .map((cls) => /^et_pb_blog_item_\d+_(\d+)$/.exec(cls)?.[1])
              .find(Boolean) ?? 0,
          )
        return positionOf(a) - positionOf(b)
      })

      const items = ordered.map((article) => {
        const link = article.querySelector('.entry-title a')
        const slug = rewriteUrl(link?.getAttribute('href') ?? '', depth).replace(/^\/|\/$/g, '')
        const meta = article.querySelector('.post-meta')
        const date = meta?.querySelector('.published')?.text.trim()
        const authorLink = meta?.querySelector('.author a')
        const fields = [`slug: ${q(slug)}`]
        if (date) fields.push(`date: ${q(date)}`)
        if (authorLink) {
          const to = rewriteUrl(authorLink.getAttribute('href') ?? '', depth)
          fields.push(`author: { name: ${q(authorLink.text.trim())}, to: ${q(to)} }`)
        }
        return `  { ${fields.join(', ')} },`
      })
      const columns = Number(
        el.querySelector('.et_pb_salvattore_content')?.getAttribute('data-columns') ?? '3',
      )
      const grid = el.querySelector('.et_pb_blog_grid')
      const props = [`index={${indexOf(el, 'et_pb_blog')}}`, `columns={${columns}}`]
      if (grid) props.push(`align="${alignOf(grid)}"`)
      if (classes.includes('et_pb_with_border')) props.push('className="et_pb_with_border"')
      // An "older posts" link means there were further pages, none of which the
      // snapshot contains; the feed renders the control as inert.
      if (el.querySelector('.pagination a')) props.push('hasOlder')
      // Intentional deviation from the mirror, homepage only (user request,
      // see AGENT.md 6.15): a post actually published through /hirkezelo/
      // shows up in these two feeds, newest first, ahead of the mirrored
      // items. `dir` is the top-level CLI arg (empty string for home) - see
      // the dispatch section at the bottom of this file.
      if (dir === '') props.push('includeLive')
      const feedProps = props.join('\n  ')
      return {
        jsx: ['<PostFeed', `  ${feedProps}`, '  items={[', ...items, '  ]}', '/>'].join('\n'),
        imports: ['PostFeed'],
      }
    }

    case 'pricing_tables': {
      const tables = el.querySelectorAll('.et_pb_pricing_table').map((table) => {
        const title = table.querySelector('.et_pb_pricing_title')?.text.trim() ?? ''
        const sum = table.querySelector('.et_pb_sum')?.text.trim()
        const items = table
          .querySelectorAll('.et_pb_pricing li')
          .map((li) => q(li.text.trim()))
        return `  {\n    title: ${q(title)},${sum ? `\n    sum: ${q(sum)},` : ''}\n    items: [${items.join(', ')}],\n  },`
      })
      return {
        jsx: `<PricingTables\n  index={${indexOf(el, 'et_pb_pricing_tables')}}\n  tables={[\n${tables.join('\n')}\n  ]}\n/>`,
        imports: ['PricingTables'],
      }
    }

    case 'gallery': {
      const items = el.querySelectorAll('.et_pb_gallery_item').map((item) => {
        const img = item.querySelector('img')
        const full = item.querySelector('a')?.getAttribute('href')
        const fields = imageProps(img, depth).map((prop) =>
          prop.replace(/^([a-zA-Z]+)=\{(\d+)\}$/, '$1: $2').replace(/^([a-zA-Z]+)=/, '$1: '),
        )
        if (full) fields.push(`full: ${q(rewriteUrl(full, depth))}`)
        return `  { ${fields.join(', ')} },`
      })
      // Divi's page size for the grid, which decides which items get
      // `first_in_row`. It is an attribute, not a class, so carry it over.
      const perPage = el.querySelector('.et_pb_gallery_items')?.getAttribute('data-per_page')
      const galleryProps = [`index={${indexOf(el, 'et_pb_gallery')}}`]
      if (perPage) galleryProps.push(`perPage={${Number(perPage)}}`)
      return {
        jsx: `<Gallery\n  ${galleryProps.join('\n  ')}\n  items={[\n${items.join('\n')}\n  ]}\n/>`,
        imports: ['Gallery'],
      }
    }

    case 'fullwidth_slider': {
      const slides = el.querySelectorAll('.et_pb_slide').map((slide) => {
        const style = slide.querySelector('.et_parallax_bg')?.getAttribute('style') ?? ''
        const image = /url\(([^)]+)\)/.exec(style)?.[1]?.replace(/["']/g, '') ?? ''
        const heading = slide.querySelector('.et_pb_slide_title')?.text.trim()
        const text = slide.querySelector('.et_pb_slide_content')?.text.trim()
        const fields = [`image: ${q(rewriteUrl(image, depth))}`]
        if (heading) fields.push(`heading: ${q(heading)}`)
        if (text) fields.push(`text: ${q(text)}`)
        return `  { ${fields.join(', ')} },`
      })
      // Divi encodes the autoplay delay in a class, e.g. et_slider_speed_7000.
      const speed = /et_slider_speed_(\d+)/.exec(el.getAttribute('class') ?? '')?.[1]
      const props = [`index={${indexOf(el, 'et_pb_fullwidth_slider')}}`]
      if (speed) props.push(`intervalMs={${Number(speed)}}`)
      // Divi's script decides here whether the page body clears the fixed
      // header or the photograph runs up behind it, and records the outcome as
      // an inline padding-top on every slide. Carry the measured value across
      // rather than recomputing the header's height.
      const fixed = el.querySelector('.et_pb_slide[data-fix-page-container="on"]')
      const offset = /padding-top:\s*([\d.]+px)/.exec(fixed?.getAttribute('style') ?? '')?.[1]
      if (offset) props.push(`headerOffset=${q(offset)}`)
      return {
        jsx: `<HeroSlider\n  ${props.join('\n  ')}\n  slides={[\n${slides.join('\n')}\n  ]}\n/>`,
        imports: ['HeroSlider'],
      }
    }

    case 'fullwidth_header': {
      const heading = el.querySelector('.et_pb_module_header')?.text.trim() ?? ''
      const text = el.querySelector('.et_pb_header_content_wrapper')?.text.trim()
      const buttons = el.querySelectorAll('a.et_pb_button').map((anchor) => {
        const href = rewriteUrl(anchor.getAttribute('href') ?? '', depth)
        const target = href.startsWith('http') ? `href: ${q(href)}` : `to: ${q(href)}`
        return `  { label: ${q(anchor.text.trim())}, ${target} },`
      })
      const props = [
        `index={${indexOf(el, 'et_pb_fullwidth_header')}}`,
        attr('heading', heading),
        `align="${alignOf(el)}"`,
      ]
      if (text) props.push(attr('text', text))
      const list = buttons.length ? `\n  buttons={[\n${buttons.join('\n')}\n  ]}` : ''
      return {
        jsx: `<FullwidthHeader\n  ${props.join('\n  ')}${list}\n/>`,
        imports: ['FullwidthHeader'],
      }
    }

    case 'social_media_follow': {
      const networks = el.querySelectorAll('li').map((item) => {
        const slug = classesOf(item)
          .map((cls) => /^et-social-(.+)$/.exec(cls)?.[1])
          .find(Boolean)
        const anchor = item.querySelector('a')
        const fields = [
          `network: ${q(slug ?? 'link')}`,
          `href: ${q(anchor?.getAttribute('href') ?? '#')}`,
          `title: ${q(anchor?.getAttribute('title') ?? '')}`,
          `label: ${q(anchor?.text.trim() ?? '')}`,
        ]
        return `  { ${fields.join(', ')} },`
      })
      // Several instances have no networks configured at all; an empty <ul>
      // would only add noise, so they render nothing.
      if (!networks.length) return { jsx: '', imports: [] }
      const props = [
        `index={${indexOf(el, 'et_pb_social_media_follow')}}`,
        `align="${alignOf(el)}"`,
      ]
      const socialProps = props.join('\n  ')
      return {
        jsx: ['<SocialFollow', `  ${socialProps}`, '  networks={[', ...networks, '  ]}', '/>'].join('\n'),
        imports: ['SocialFollow'],
      }
    }

    default:
      if (kind) unknown.add(kind)
      return null
  }
}

/**
 * Divi marks a module that has a border set on it, and its stylesheet keys the
 * border *style* off that class while the page's own stylesheet supplies only
 * the width. Dropping the class makes those per-page borders inert, so it
 * travels with every module that carries it.
 */
function borderProp(el: HTMLElement): string[] {
  return hasClass(el, 'et_pb_with_border') ? ['className="et_pb_with_border"'] : []
}

function emitColumn(col: HTMLElement, depth: number, unknown: Set<string>, imports: Set<string>): string {
  const spanClass = classesOf(col).find((cls) => /^et_pb_column_\d+_\d+$/.test(cls)) ?? ''
  const span = /^et_pb_column_(\d+_\d+)$/.exec(spanClass)?.[1] ?? '4_4'
  const parts: string[] = []
  for (const child of col.childNodes) {
    if (child.nodeType !== 1) continue
    const element = child as HTMLElement
    const emitted = emitModule(element, depth, unknown)
    if (emitted && !emitted.jsx) continue
    if (!emitted) {
      // A module that yields nothing is either deliberately dropped or a gap in
      // the walker; either way it must not vanish without a word.
      if (hasClass(element, 'et_password_protected_form')) {
        // Not an et_pb_module, so the check below would let it slip through.
        unknown.add('password-protected form')
      } else if (hasClass(element, 'et_pb_module')) {
        unknown.add(`unrendered: ${classesOf(element).filter((c) => c.startsWith('et_pb_')).join('.')}`)
      }
      continue
    }
    parts.push(emitted.jsx)
    emitted.imports.forEach((name) => imports.add(name))
  }
  const props = [`span="${span}"`, `index={${indexOf(col, 'et_pb_column')}}`]
  if (hasClass(col, 'et-last-child')) props.push('last')
  props.push(...borderProp(col))
  return wrap(`<Column ${props.join(' ')}>`, parts, '</Column>')
}

function emitRow(row: HTMLElement, depth: number, unknown: Set<string>, imports: Set<string>): string {
  const columns = row
    .querySelectorAll('.et_pb_column')
    .filter((col) => col.parentNode === row)
    .map((col) => emitColumn(col, depth, unknown, imports))
  const props = [`index={${indexOf(row, 'et_pb_row')}}`]
  if (hasClass(row, 'et_pb_gutters4')) props.push('gutters={4}')
  props.push(...borderProp(row))
  return wrap(`<Row ${props.join(' ')}>`, columns, '</Row>')
}

function emitSection(section: HTMLElement, depth: number, unknown: Set<string>, imports: Set<string>): string {
  const props = [`index={${indexOf(section, 'et_pb_section')}}`]
  if (hasClass(section, 'et_pb_section_first')) props.push('first')
  if (hasClass(section, 'et_pb_top_divider')) props.push('dividerTop')
  if (hasClass(section, 'et_pb_bottom_divider')) props.push('dividerBottom')
  if (hasClass(section, 'et_pb_with_background')) props.push('withBackground')
  if (hasClass(section, 'et_pb_with_border')) props.push('className="et_pb_with_border"')
  if (hasClass(section, 'et_pb_fullwidth_section')) {
    // A fullwidth section holds its modules directly, with no row or column
    // around them - the slider and the closing header on the home page.
    props.push('fullwidth')
    const modules: string[] = []
    for (const child of section.childNodes) {
      if (child.nodeType !== 1) continue
      const emitted = emitModule(child as HTMLElement, depth, unknown)
      if (!emitted) continue
      modules.push(emitted.jsx)
      emitted.imports.forEach((name) => imports.add(name))
    }
    return wrap(`<Section ${props.join(' ')}>`, modules, '</Section>')
  }

  const rows = section
    .querySelectorAll('.et_pb_row')
    .filter((row) => row.parentNode === section)
    .map((row) => emitRow(row, depth, unknown, imports))
  return wrap(`<Section ${props.join(' ')}>`, rows, '</Section>')
}

/* -- page shapes ----------------------------------------------------------- */

/**
 * Parts of the mirror that are deliberately not ported, listed so that the
 * "never skip anything silently" rule is satisfied by a decision on record
 * rather than by something quietly falling through a gap.
 */
const DROPPED: Record<string, string> = {
  et_duplicate_social_icons: 'a hidden copy of the header social icons',
}

type Kind = PageEntry['kind']

/** Import lines shared by every page shape. */
function importLines(
  imports: Set<string>,
  usesLink: boolean,
  up: number,
  extra: string[] = [],
): string[] {
  const prefix = '../'.repeat(up)
  return [
    ...(usesLink ? ["import { Link } from 'react-router-dom'"] : []),
    ...extra.map((line) => line.replace('@/', prefix)),
    ...[...imports]
      .sort()
      .map((name) => `import ${name} from '${prefix}components/divi/${name}.tsx'`),
  ]
}

/** Indents a block of already-rendered JSX to sit at the given column. */
const indent = (block: string, spaces: number): string =>
  block
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n')

/** The sections of a Divi tree, at one nesting level below `builder`. */
function sectionsOf(
  builder: HTMLElement,
  depth: number,
  unknown: Set<string>,
  imports: Set<string>,
): string[] {
  return builder
    .querySelectorAll('.et_pb_section')
    .filter((section) => section.parentNode === builder)
    .map((section) => emitSection(section, depth, unknown, imports))
}

/** A page the Divi builder laid out: the common case. */
function emitBuilderPage(
  root: HTMLElement,
  depth: number,
  scope: string,
  up: number,
  unknown: Set<string>,
  imports: Set<string>,
): { lines: string[]; count: number } {
  const builder = root.querySelector('.et_builder_inner_content')
  if (!builder) throw new Error('no Divi tree')
  const sections = sectionsOf(builder, depth, unknown, imports)
  const articleClass = root.querySelector('#main-content article')?.getAttribute('class') ?? ''

  return {
    count: sections.length,
    lines: [
      ...importLines(imports, sections.some((s) => s.includes('<Link ')), up, [
        "import Column from '@/components/divi/Column.tsx'",
        "import Row from '@/components/divi/Row.tsx'",
        "import Section from '@/components/divi/Section.tsx'",
      ]),
      '',
      'export default function Page() {',
      '  return (',
      `    <div id="main-content"${scope ? ` className="${scope}"` : ''}>`,
      `      <article ${attr('className', articleClass)}>`,
      '        <div className="entry-content">',
      '          <div className="et-l et-l--post">',
      '            <div className="et_builder_inner_content et_pb_gutters3">',
      ...sections.map((section) => indent(section, 14)),
      '            </div>',
      '          </div>',
      '        </div>',
      '      </article>',
      '    </div>',
      '  )',
      '}',
      '',
    ],
  }
}

/** A page written in the WordPress editor: prose in #left-area, theme sidebar. */
function emitClassicPage(
  root: HTMLElement,
  depth: number,
  scope: string,
  up: number,
): { lines: string[]; count: number } {
  const article = root.querySelector('#left-area article')
  if (!article) throw new Error('no classic article')

  const heading = article.querySelector('.entry-title')?.text.trim() ?? ''
  const blocks = blocksOf(article.querySelector('.entry-content'), depth)

  return {
    count: blocks.length,
    lines: [
      ...importLines(new Set(), blocks.some((b) => b.includes('<Link ')), up, [
        "import Sidebar from '@/components/Sidebar.tsx'",
        "import { useBodyClass } from '@/lib/useBodyClass.ts'",
      ]),
      '',
      'export default function Page() {',
      '  // The theme lays the two columns out off this class; see useBodyClass.',
      "  useBodyClass(['et_right_sidebar'])",
      '  return (',
      `    <div id="main-content"${scope ? ` className="${scope}"` : ''}>`,
      '      <div className="container">',
      '        <div id="content-area" className="clearfix">',
      '          <div id="left-area">',
      `            <article ${attr('className', article.getAttribute('class') ?? '')}>`,
      `              <h1 className="entry-title main_title">${escapeText(heading)}</h1>`,
      '              <div className="entry-content">',
      ...blocks.map((block) => indent(block, 16)),
      '              </div>',
      '            </article>',
      '          </div>',
      '          <Sidebar />',
      '        </div>',
      '      </div>',
      '    </div>',
      '  )',
      '}',
      '',
    ],
  }
}

/**
 * Gutenberg blocks, for the one document written in the WordPress editor.
 *
 * Only the block types that page actually uses are handled; anything else is
 * reported rather than dropped, so a second such page cannot slip through.
 */
function emitGutenberg(
  container: HTMLElement,
  dir: string,
  unknown: Set<string>,
  imports: Set<string>,
  depth: number,
): string[] {
  const out: string[] = []
  for (const child of container.childNodes) {
    if (child.nodeType !== 1) continue
    const el = child as HTMLElement

    if (hasClass(el, 'wp-block-file')) {
      const object = el.querySelector('object')
      const links = el.querySelectorAll('a')
      const button = links.find((link) => hasClass(link, 'wp-block-file__button'))
      const label = links.find((link) => link !== button)
      // The embed and the link point at different uploads on this page, so the
      // two URLs are kept apart rather than collapsed into one.
      const props = [
        attr('embed', resolveUrl(object?.getAttribute('data') ?? '', dir)),
        attr('href', resolveUrl(label?.getAttribute('href') ?? '', dir)),
        attr('label', label?.text.trim() ?? ''),
        attr('buttonLabel', button?.text.trim() ?? ''),
        attr('embedLabel', object?.getAttribute('aria-label') ?? ''),
      ]
      imports.add('FileBlock')
      out.push(['<FileBlock', ...props.map((prop) => '  ' + prop), '/>'].join('\n'))
      continue
    }

    const block = blockJsx(el, depth)
    if (block) {
      out.push(block)
      continue
    }
    const wpBlock = classesOf(el).find((cls) => cls.startsWith('wp-block-'))
    if (wpBlock) unknown.add(`gutenberg: ${wpBlock}`)
  }
  return out
}

/**
 * The body classes WordPress put on this page, minus the ones that are not
 * facts about the page.
 *
 * The theme keys real layout on them - `.et_pb_pagebuilder_layout.single-post
 * #main-content .et_pb_row { width: 100% }` is why a post's rows run the full
 * width of the column rather than Divi's usual 80% - so they have to travel
 * with the page rather than be guessed at.
 */
function bodyClasses(root: HTMLElement): string[] {
  const SITE_WIDE = ['et-db', 'et_divi_theme']
  // The crawler recorded the machine it ran on; that is not part of the page.
  const CRAWLER = ['linux', 'windows', 'mac', 'chrome', 'firefox', 'safari', 'ios', 'android']
  return classesOf(root.querySelector('body') ?? ({} as HTMLElement))
    .filter((name) => !SITE_WIDE.includes(name) && !CRAWLER.includes(name))
}

/** A BetterDocs document: plugin chrome, which DocsLayout holds, around a body. */
function emitDocsPage(
  root: HTMLElement,
  dir: string,
  depth: number,
  scope: string,
  up: number,
  unknown: Set<string>,
  imports: Set<string>,
): { lines: string[]; count: number } {
  const slug = dir.split('/').pop() ?? ''
  const content = root.querySelector('#betterdocs-single-content')
  if (!content) throw new Error('no #betterdocs-single-content')

  // Two documents are a WordPress password form rather than content. The frame
  // is still rendered so every link to them keeps working.
  if (root.querySelector('.et_password_protected_form')) {
    return {
      count: 0,
      lines: [
        `import DocsLayout from '${'../'.repeat(up)}components/docs/DocsLayout.tsx'`,
        `import DocsProtectedNote from '${'../'.repeat(up)}components/docs/DocsProtectedNote.tsx'`,
        '',
        'export default function Page() {',
        '  return (',
        `    <DocsLayout slug=${q(slug)}${scope ? ` className="${scope}"` : ''}>`,
        '      <DocsProtectedNote />',
        '    </DocsLayout>',
        '  )',
        '}',
        '',
      ],
    }
  }

  const builder = content.querySelector('.et_builder_inner_content')
  const body = builder
    ? sectionsOf(builder, depth, unknown, imports)
    : emitGutenberg(content, dir, unknown, imports, depth)

  const extra = ["import DocsLayout from '@/components/docs/DocsLayout.tsx'"]
  // An empty document (docs/tesztoldal) needs no layout components at all, and
  // importing them unused would fail the build under noUnusedLocals.
  if (builder && body.length) {
    extra.push(
      "import Column from '@/components/divi/Column.tsx'",
      "import Row from '@/components/divi/Row.tsx'",
      "import Section from '@/components/divi/Section.tsx'",
    )
  }
  // FileBlock lives beside DocsLayout, not among the Divi modules.
  const usesFileBlock = imports.delete('FileBlock')
  if (usesFileBlock) extra.push("import FileBlock from '@/components/docs/FileBlock.tsx'")

  return {
    count: body.length,
    lines: [
      ...importLines(imports, body.some((part) => part.includes('<Link ')), up, extra),
      '',
      'export default function Page() {',
      '  return (',
      `    <DocsLayout slug=${q(slug)}${scope ? ` className="${scope}"` : ''}>`,
      ...body.map((part) => indent(part, 6)),
      '    </DocsLayout>',
      '  )',
      '}',
      '',
    ],
  }
}

/** A single blog post: the theme's post template around a Divi tree. */
function emitPostPage(
  root: HTMLElement,
  dir: string,
  depth: number,
  scope: string,
  up: number,
  unknown: Set<string>,
  imports: Set<string>,
): { lines: string[]; count: number } {
  const article = root.querySelector('#left-area article')
  if (!article) throw new Error('no post article')
  const builder = article.querySelector('.et_builder_inner_content')
  if (!builder) throw new Error('no Divi tree in the post')

  const sections = sectionsOf(builder, depth, unknown, imports)
  // The date is the page's own formatting, not the index's: each blog module
  // chose its own, so it travels with the template rather than with the post.
  const date = article.querySelector('.post-meta .published')?.text.trim() ?? ''

  return {
    count: sections.length,
    lines: [
      ...importLines(imports, sections.some((s) => s.includes('<Link ')), up, [
        "import PostHeader from '@/components/PostHeader.tsx'",
        "import SharedCounts from '@/components/SharedCounts.tsx'",
        "import Sidebar from '@/components/Sidebar.tsx'",
        "import { useBodyClass } from '@/lib/useBodyClass.ts'",
        "import Column from '@/components/divi/Column.tsx'",
        "import Row from '@/components/divi/Row.tsx'",
        "import Section from '@/components/divi/Section.tsx'",
      ]),
      '',
      'export default function Page() {',
      '  // The theme keys layout on these; see useBodyClass.',
      `  useBodyClass([${bodyClasses(root).map(q).join(', ')}])`,
      '  return (',
      `    <div id="main-content"${scope ? ` className="${scope}"` : ''}>`,
      '      <div className="container">',
      '        <div id="content-area" className="clearfix">',
      '          <div id="left-area">',
      `            <article ${attr('id', article.getAttribute('id') ?? '')} ${attr('className', article.getAttribute('class') ?? '')}>`,
      `              <PostHeader slug=${q(dir)} date=${q(date)} />`,
      '              <div className="entry-content">',
      '                <div className="et-l et-l--post">',
      '                  <div className="et_builder_inner_content et_pb_gutters3">',
      ...sections.map((section) => indent(section, 20)),
      '                  </div>',
      '                </div>',
      '                <SharedCounts />',
      '              </div>',
      '              {/* The mirror emits a second, empty meta wrapper here. */}',
      '              <div className="et_post_meta_wrapper" />',
      '            </article>',
      '          </div>',
      '          <Sidebar />',
      '        </div>',
      '      </div>',
      '    </div>',
      '  )',
      '}',
      '',
    ],
  }
}

/* -- dispatch -------------------------------------------------------------- */

const pageArg = process.argv[2]
const flag = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)

if (!pageArg) {
  console.error('usage: walk.ts <page-dir> [--report] [--scope=] [--kind=] [--up=]')
  process.exit(1)
}

/** The scope class the page's design stylesheet is namespaced under. */
const scope = flag('scope') ?? ''
/** How far below src/pages the component sits, so imports resolve. */
const up = Number(flag('up') ?? 1)
const dir = pageArg === 'home' ? '' : pageArg
const depth = dir === '' ? 0 : dir.split('/').length

const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))

/**
 * Falls back on the markup when --kind is not given, which is what a hand run
 * with --report does. BetterDocs is probed first on purpose: 26 of the 27 docs
 * pages wrap their body in an .et_builder_inner_content of their own, so the
 * Divi test would claim them and print the plugin chrome away.
 */
function sniff(): Kind {
  if (root.querySelector('.betterdocs-single-wrapper')) return 'docs'
  if (root.querySelector('body.single-post')) return 'post'
  if (root.querySelector('.et_builder_inner_content')) return 'builder'
  if (root.querySelector('#left-area article')) return 'classic'
  throw new Error(`no recognised page shape in ${pageArg}`)
}

const kind = (flag('kind') as Kind | undefined) ?? sniff()
const unknown = new Set<string>()
const imports = new Set<string>()

const page =
  kind === 'docs'
    ? emitDocsPage(root, dir, depth, scope, up, unknown, imports)
    : kind === 'post'
      ? emitPostPage(root, dir, depth, scope, up, unknown, imports)
      : kind === 'classic'
        ? emitClassicPage(root, depth, scope, up)
        : emitBuilderPage(root, depth, scope, up, unknown, imports)

/**
 * What this page carries that the port knowingly leaves out. Naming them turns
 * "it silently disappeared" into "it was dropped, and here is why", which is
 * the point of the rule about never skipping anything quietly.
 */
const dropped = Object.entries(DROPPED)
  .filter(([token]) => root.querySelector(`.${token}`))
  .map(([token, why]) => `${token} (${why})`)

if (process.argv.includes('--report')) {
  const unit = kind === 'classic' ? 'blocks' : 'sections'
  console.log(
    `${pageArg.padEnd(38)} ${kind.padEnd(8)} ${String(page.count).padStart(2)} ${unit}` +
      `  ${[...imports].sort().join(', ')}`,
  )
  for (const item of dropped) console.log(`${' '.repeat(38)} dropped: ${item}`)
  if (unknown.size) console.log(`${' '.repeat(38)} UNHANDLED: ${[...unknown].sort().join(', ')}`)
  process.exit(0)
}

// stderr, so the warning survives stdout being captured into a .tsx file.
if (unknown.size) console.error(`UNHANDLED in ${pageArg}: ${[...unknown].sort().join(', ')}`)
process.stdout.write(page.lines.join('\n'))
