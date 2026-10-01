/**
 * Turns a generated page component (the TSX walk.ts prints) into the
 * PageDocument the Szerkesztő edits (AGENT.md 6.20).
 *
 * walk.ts stays the one place that reads the mirror; this reads *its output*,
 * so the two can never disagree about a page. It parses the TSX with the
 * TypeScript compiler, evaluates the literal props (strings, numbers, objects,
 * arrays) and maps every Divi component onto a module kind. It is strict on
 * purpose: an element, prop or style it does not know is an error, not a
 * silent drop - the render gate (scripts/render-pages.ts) then proves the
 * documents still render what the components did.
 *
 * Used by scripts/generate.ts, and as a CLI to convert files by hand:
 *   node --experimental-strip-types scripts/tsx-to-document.ts <file.tsx>
 */
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { RICH_STYLE_KEYS } from '../../../shared/pnw/types.ts'
import type { RichStyle } from '../../../shared/pnw/types.ts'
import { el as richEl } from '../../../shared/pnw/rich-content.ts'
import type { RichNode, RichTag } from '../../../shared/pnw/rich-content.ts'
import type {
  PageColumn,
  PageDocument,
  PageModule,
  PageRow,
  PageSection,
  PageTemplate,
} from '../../../shared/pnw/page-types.ts'

/* -- JSX literals ----------------------------------------------------------- */

const NAMED_ENTITIES: Record<string, number> = {
  nbsp: 160,
  amp: 38,
  lt: 60,
  gt: 62,
  quot: 34,
  apos: 39,
  ndash: 8211,
  mdash: 8212,
  hellip: 8230,
  laquo: 171,
  raquo: 187,
  lsquo: 8216,
  rsquo: 8217,
  ldquo: 8220,
  rdquo: 8221,
  bdquo: 8222,
  copy: 169,
  euro: 8364,
  middot: 183,
  bull: 8226,
  deg: 176,
  times: 215,
}

/** JSX decodes HTML entities in text and in plain attribute strings. */
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return String.fromCodePoint(code)
    }
    const code = NAMED_ENTITIES[body]
    if (code === undefined) throw new Error(`unknown entity ${whole}`)
    return String.fromCodePoint(code)
  })
}

/** React's whitespace rule for JSX text: lines are trimmed, blank ones dropped, the rest joined with a space. */
function cleanJsxText(raw: string): string {
  const lines = raw.split(/\r\n|\n|\r/)
  let lastNonEmpty = 0
  lines.forEach((line, index) => {
    if (/[^ \t]/.test(line)) lastNonEmpty = index
  })
  let out = ''
  lines.forEach((line, index) => {
    let text = line.replace(/\t/g, ' ')
    if (index !== 0) text = text.replace(/^[ ]+/, '')
    if (index !== lines.length - 1) text = text.replace(/[ ]+$/, '')
    if (text) {
      if (index !== lastNonEmpty) text += ' '
      out += text
    }
  })
  return out
}

type Value = string | number | boolean | null | Value[] | { [key: string]: Value }

function evaluate(node: ts.Node): Value {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    return -(evaluate(node.operand) as number)
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isParenthesizedExpression(node)) return evaluate(node.expression)
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(evaluate)
  if (ts.isObjectLiteralExpression(node)) {
    const out: { [key: string]: Value } = {}
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) throw new Error(`unsupported property: ${property.getText()}`)
      const name = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : null
      if (name === null) throw new Error(`unsupported key: ${property.name.getText()}`)
      out[name] = evaluate(property.initializer)
    }
    return out
  }
  throw new Error(`cannot evaluate: ${node.getText()}`)
}

type Props = Record<string, Value>

function propsOf(node: ts.JsxOpeningLikeElement): Props {
  const props: Props = {}
  for (const attribute of node.attributes.properties) {
    if (!ts.isJsxAttribute(attribute)) throw new Error(`spread props: ${attribute.getText()}`)
    const name = attribute.name.getText()
    const initializer = attribute.initializer
    if (!initializer) props[name] = true
    else if (ts.isStringLiteral(initializer)) props[name] = decodeEntities(initializer.text)
    else if (ts.isJsxExpression(initializer) && initializer.expression) props[name] = evaluate(initializer.expression)
    else throw new Error(`unsupported prop ${name}: ${initializer.getText()}`)
  }
  return props
}

const tagOf = (node: ts.JsxElement | ts.JsxSelfClosingElement): string =>
  (ts.isJsxElement(node) ? node.openingElement : node).tagName.getText()

const openingOf = (node: ts.JsxElement | ts.JsxSelfClosingElement): ts.JsxOpeningLikeElement =>
  ts.isJsxElement(node) ? node.openingElement : node

const childrenOf = (node: ts.JsxElement | ts.JsxSelfClosingElement): ts.NodeArray<ts.JsxChild> | [] =>
  ts.isJsxElement(node) ? node.children : []

/* -- rich content ------------------------------------------------------------ */

const RICH_TAG_SET = new Set<string>([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'span', 'a', 'br',
])

/** Every style value the mirror's text carries, collected so the server's validators can be written against real data. */
export const seenStyles = new Map<string, Set<string>>()

function styleOf(value: Value | undefined): RichStyle | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('style must be an object')
  const style: RichStyle = {}
  for (const [key, raw] of Object.entries(value)) {
    if (!(RICH_STYLE_KEYS as readonly string[]).includes(key)) throw new Error(`style key not whitelisted: ${key}`)
    if (typeof raw !== 'string') throw new Error(`style value not a string: ${key}`)
    style[key as keyof RichStyle] = raw
    if (!seenStyles.has(key)) seenStyles.set(key, new Set())
    seenStyles.get(key)!.add(raw)
  }
  return style
}

/** The same rule the renderer applies when it builds an <a>: it must reproduce exactly what the TSX wrote. */
function checkAnchor(href: string, props: Props, link: boolean): void {
  const external = /^https?:\/\//i.test(href)
  const fileHref = href.startsWith('/media/') || href.startsWith('/uploads/') || href.startsWith('mailto:') || href.startsWith('tel:')
  if (link) {
    // react-router renders a Link to an absolute URL (tel:, mailto:) as a plain <a href> - the same as the renderer's file-link case.
    if (/^(mailto:|tel:)/i.test(href)) return
    if (external || fileHref || !href.startsWith('/')) throw new Error(`<Link to="${href}"> would render as an <a>`)
    return
  }
  if (external) {
    if (props.target !== '_blank' || props.rel !== 'noreferrer') throw new Error(`external <a> without target/rel: ${href}`)
  } else if (props.target !== undefined || props.rel !== undefined) {
    throw new Error(`internal <a> with target/rel: ${href}`)
  } else if (!fileHref) {
    throw new Error(`<a href="${href}"> would render as a router <Link>`)
  }
}

function richNode(node: ts.JsxElement | ts.JsxSelfClosingElement): RichNode {
  const tag = tagOf(node)
  const props = propsOf(openingOf(node))
  const children = richChildren(childrenOf(node))

  if (tag === 'Link') {
    const to = props.to
    if (typeof to !== 'string') throw new Error('<Link> without to')
    checkAnchor(to, props, true)
    return richEl('a', children, { href: to })
  }
  if (!RICH_TAG_SET.has(tag)) throw new Error(`unsupported element in text: <${tag}>`)

  const allowed = tag === 'a' ? new Set(['href', 'target', 'rel']) : new Set(['style'])
  for (const name of Object.keys(props)) {
    if (!allowed.has(name)) throw new Error(`unsupported prop ${name} on <${tag}>`)
  }
  if (tag === 'a') {
    const href = props.href
    if (typeof href !== 'string') throw new Error('<a> without href')
    checkAnchor(href, props, false)
    return richEl('a', children, { href })
  }
  return richEl(tag as RichTag, children, { style: styleOf(props.style) })
}

function richChildren(children: readonly ts.JsxChild[]): RichNode[] {
  const out: RichNode[] = []
  for (const child of children) {
    if (ts.isJsxText(child)) {
      const text = decodeEntities(cleanJsxText(child.text))
      if (text) out.push(text)
    } else if (ts.isJsxExpression(child)) {
      // `{' '}` is the whitespace the generator keeps; `{/* … */}` is a comment.
      if (!child.expression) continue
      if (!ts.isStringLiteral(child.expression)) throw new Error(`unsupported expression: ${child.getText()}`)
      out.push(child.expression.text)
    } else if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      out.push(richNode(child))
    } else {
      throw new Error(`unsupported child: ${child.getText()}`)
    }
  }
  return out
}

/* -- modules ------------------------------------------------------------------ */

class Ids {
  private count = { s: 0, r: 0, c: 0, m: 0 }
  next(prefix: 's' | 'r' | 'c' | 'm'): string {
    const id = `${prefix}${this.count[prefix]}`
    this.count[prefix] += 1
    return id
  }
}

function pick(props: Props, mapping: Record<string, string>, into: Record<string, unknown>, known: string[] = []): void {
  const allowed = new Set([...Object.keys(mapping), ...known])
  for (const name of Object.keys(props)) {
    if (!allowed.has(name)) throw new Error(`unknown prop "${name}"`)
  }
  for (const [from, to] of Object.entries(mapping)) {
    const value = props[from]
    if (value === undefined || value === false) continue
    into[to] = value
  }
}

const imageFields = ['src', 'alt', 'width', 'height', 'srcSet', 'sizes', 'loading']

function image(value: Value | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('image must be an object')
  const out: Record<string, unknown> = {}
  for (const name of Object.keys(value)) {
    if (!imageFields.includes(name)) throw new Error(`unknown image field "${name}"`)
    out[name] = value[name]
  }
  return out
}

function textOf(children: readonly ts.JsxChild[]): string {
  const nodes = richChildren(children)
  if (!nodes.every((node) => typeof node === 'string')) throw new Error('expected plain text')
  return (nodes as string[]).join('')
}

function convertModule(node: ts.JsxElement | ts.JsxSelfClosingElement, ids: Ids): PageModule | null {
  const tag = tagOf(node)
  const props = propsOf(openingOf(node))
  const children = childrenOf(node)
  const id = ids.next('m')
  const base: Record<string, unknown> = { id }
  const out: Record<string, unknown> = {}
  const common = { index: 'index', className: 'className' }

  const finish = (kind: string): PageModule => ({ kind, ...base, ...out }) as unknown as PageModule
  const content = () => {
    const nodes = richChildren(children)
    return nodes
  }

  switch (tag) {
    case 'Text':
      pick(props, { ...common, align: 'align', bgLayout: 'bgLayout' }, base)
      out.content = content()
      return finish('text')
    case 'Image':
      pick(props, { ...common, src: 'src', alt: 'alt', href: 'href', width: 'width', height: 'height', srcSet: 'srcSet', sizes: 'sizes', loading: 'loading' }, base)
      return finish('image')
    case 'Button':
      pick(props, { ...common, to: 'to', href: 'href', align: 'align', icon: 'icon' }, base)
      out.label = textOf(children)
      return finish('button')
    case 'Blurb': {
      pick(props, { ...common, title: 'title', titleHref: 'titleHref', icon: 'icon', position: 'position', align: 'align' }, base)
      const picture = image(props.image)
      if (picture) base.image = picture
      out.content = content()
      return finish('blurb')
    }
    case 'Divider':
      pick(props, common, base)
      return finish('divider')
    case 'VideoEmbed': {
      pick(props, { ...common }, base, ['videoId', 'title'])
      if (typeof props.videoId !== 'string') throw new Error('video without id')
      base.url = `https://www.youtube.com/watch?v=${props.videoId}`
      if (props.title !== undefined) base.title = props.title
      return finish('video')
    }
    case 'Toggle':
      pick(props, { ...common, title: 'title', defaultOpen: 'defaultOpen' }, base)
      out.content = content()
      return finish('toggle')
    case 'PostFeed':
      pick(props, { ...common, items: 'items', columns: 'columns', align: 'align', hasOlder: 'hasOlder', includeLive: 'includeLive' }, base)
      return finish('post-feed')
    case 'TeamMember': {
      pick(props, { ...common, name: 'name', position: 'position', headingLevel: 'headingLevel', align: 'align' }, base, ['image'])
      const picture = image(props.image)
      if (picture) base.image = picture
      const body = richChildren(children)
      if (body.length) out.content = body
      return finish('team-member')
    }
    case 'SocialFollow':
      pick(props, { ...common, networks: 'networks', align: 'align' }, base)
      return finish('social-follow')
    case 'NumberCounter':
      pick(props, { ...common, value: 'value', title: 'title', suffix: 'suffix' }, base)
      return finish('number-counter')
    case 'Testimonial':
      pick(props, { ...common, author: 'author', portrait: 'portrait', align: 'align' }, base)
      out.content = content()
      return finish('testimonial')
    case 'PricingTables':
      pick(props, { ...common, tables: 'tables' }, base)
      return finish('pricing-tables')
    case 'HeroSlider':
      pick(props, { ...common, slides: 'slides', intervalMs: 'intervalMs', headerOffset: 'headerOffset' }, base)
      return finish('hero-slider')
    case 'Gallery':
      pick(props, { ...common, items: 'items', perPage: 'perPage' }, base)
      return finish('gallery')
    case 'FullwidthHeader':
      pick(props, { ...common, heading: 'heading', text: 'text', buttons: 'buttons', align: 'align' }, base)
      return finish('fullwidth-header')
    case 'FileBlock':
      pick(props, { embed: 'embed', href: 'href', label: 'label', buttonLabel: 'buttonLabel', embedLabel: 'embedLabel' }, base)
      return finish('file-block')
    default:
      return null
  }
}

function jsxChildren(node: ts.JsxElement | ts.JsxSelfClosingElement): (ts.JsxElement | ts.JsxSelfClosingElement)[] {
  const out: (ts.JsxElement | ts.JsxSelfClosingElement)[] = []
  for (const child of childrenOf(node)) {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) out.push(child)
    else if (ts.isJsxText(child) && cleanJsxText(child.text).trim() === '') continue
    else if (ts.isJsxExpression(child) && !child.expression) continue
    else throw new Error(`unexpected child in layout: ${child.getText()}`)
  }
  return out
}

function convertColumn(node: ts.JsxElement | ts.JsxSelfClosingElement, ids: Ids): PageColumn {
  const props = propsOf(openingOf(node))
  const column: Record<string, unknown> = { id: ids.next('c') }
  pick(props, { span: 'span', index: 'index', className: 'className' }, column)
  // Explicit either way: "no et-last-child" is a fact about the mirror, not a default.
  column.last = props.last === true
  column.modules = jsxChildren(node).map((child) => {
    const module = convertModule(child, ids)
    if (!module) throw new Error(`unknown module <${tagOf(child)}>`)
    return module
  })
  return column as unknown as PageColumn
}

function convertRow(node: ts.JsxElement | ts.JsxSelfClosingElement, ids: Ids): PageRow {
  const props = propsOf(openingOf(node))
  const row: Record<string, unknown> = { id: ids.next('r') }
  pick(props, { index: 'index', gutters: 'gutters', className: 'className' }, row)
  row.columns = jsxChildren(node).map((child) => {
    if (tagOf(child) !== 'Column') throw new Error(`<${tagOf(child)}> directly in a Row`)
    return convertColumn(child, ids)
  })
  return row as unknown as PageRow
}

function convertSection(node: ts.JsxElement | ts.JsxSelfClosingElement, ids: Ids): PageSection {
  const props = propsOf(openingOf(node))
  const section: Record<string, unknown> = { id: ids.next('s') }
  pick(
    props,
    {
      index: 'index',
      first: 'first',
      dividerTop: 'dividerTop',
      dividerBottom: 'dividerBottom',
      withBackground: 'withBackground',
      fullwidth: 'fullwidth',
      className: 'className',
    },
    section,
  )
  const kids = jsxChildren(node)
  if (props.fullwidth) {
    section.rows = []
    section.modules = kids.map((child) => {
      const module = convertModule(child, ids)
      if (!module) throw new Error(`unknown module <${tagOf(child)}> in a fullwidth section`)
      return module
    })
  } else {
    section.rows = kids.map((child) => {
      if (tagOf(child) !== 'Row') throw new Error(`<${tagOf(child)}> directly in a Section`)
      return convertRow(child, ids)
    })
  }
  return section as unknown as PageSection
}

/* -- page frames -------------------------------------------------------------- */

function* descendants(node: ts.Node): Generator<ts.JsxElement | ts.JsxSelfClosingElement> {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) yield node
  const found: ts.Node[] = []
  ts.forEachChild(node, (child) => {
    found.push(child)
  })
  for (const child of found) yield* descendants(child)
}

function findBy(root: ts.Node, test: (node: ts.JsxElement | ts.JsxSelfClosingElement) => boolean) {
  for (const node of descendants(root)) if (test(node)) return node
  return undefined
}

const classOf = (node: ts.JsxElement | ts.JsxSelfClosingElement): string => {
  const value = propsOf(openingOf(node)).className
  return typeof value === 'string' ? value : ''
}

function str(value: Value | undefined, what: string): string {
  if (typeof value !== 'string') throw new Error(`missing ${what}`)
  return value
}

/** useBodyClass([...]) arguments, if the component calls it. */
function bodyClasses(file: ts.SourceFile): string[] | undefined {
  let found: string[] | undefined
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText() === 'useBodyClass') {
      found = evaluate(node.arguments[0]) as string[]
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return found
}

export function tsxToDocument(source: string): PageDocument {
  const file = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const ids = new Ids()

  // The component's returned element.
  let root: ts.JsxElement | ts.JsxSelfClosingElement | undefined
  const find = (node: ts.Node) => {
    if (!root && ts.isReturnStatement(node) && node.expression) {
      const expression = ts.isParenthesizedExpression(node.expression) ? node.expression.expression : node.expression
      if (ts.isJsxElement(expression) || ts.isJsxSelfClosingElement(expression)) root = expression
    }
    ts.forEachChild(node, find)
  }
  find(file)
  if (!root) throw new Error('no returned JSX element')

  const document: PageDocument = { sections: [] }
  const sectionsOf = (container: ts.JsxElement | ts.JsxSelfClosingElement) =>
    jsxChildren(container).map((child) => {
      if (tagOf(child) !== 'Section') throw new Error(`<${tagOf(child)}> directly in the page tree`)
      return convertSection(child, ids)
    })

  const docsLayout = findBy(root, (node) => tagOf(node) === 'DocsLayout')
  const postHeader = findBy(root, (node) => tagOf(node) === 'PostHeader')
  const classicTitle = findBy(root, (node) => tagOf(node) === 'h1' && classOf(node) === 'entry-title main_title')

  let template: PageTemplate
  if (docsLayout) {
    template = 'docs'
    const props = propsOf(openingOf(docsLayout))
    document.docsSlug = str(props.slug, 'DocsLayout slug')
    if (props.className) document.scope = str(props.className, 'DocsLayout className')
    const body: PageModule[] = []
    const sections: PageSection[] = []
    for (const child of jsxChildren(docsLayout)) {
      const tag = tagOf(child)
      if (tag === 'Section') sections.push(convertSection(child, ids))
      else if (tag === 'DocsProtectedNote') document.protected = true
      else {
        const module = convertModule(child, ids)
        if (!module) throw new Error(`unknown element <${tag}> in DocsLayout`)
        body.push(module)
      }
    }
    document.sections = sections
    if (body.length) document.body = body
  } else {
    const main = findBy(root, (node) => tagOf(node) === 'div' && propsOf(openingOf(node)).id === 'main-content')
    if (!main) throw new Error('no #main-content')
    const scope = classOf(main)
    if (scope) document.scope = scope

    if (postHeader) {
      template = 'post'
      const article = findBy(root, (node) => tagOf(node) === 'article')!
      const articleProps = propsOf(openingOf(article))
      const headerProps = propsOf(openingOf(postHeader))
      const inner = findBy(article, (node) => classOf(node) === 'et_builder_inner_content et_pb_gutters3')
      if (!inner) throw new Error('no Divi tree in the post')
      document.articleClass = str(articleProps.className, 'article className')
      document.post = {
        slug: str(headerProps.slug, 'PostHeader slug'),
        date: str(headerProps.date, 'PostHeader date'),
        articleId: str(articleProps.id, 'article id'),
        bodyClasses: bodyClasses(file) ?? [],
      }
      document.sections = sectionsOf(inner)
    } else if (classicTitle) {
      template = 'classic'
      const article = findBy(root, (node) => tagOf(node) === 'article')!
      const entry = findBy(article, (node) => tagOf(node) === 'div' && classOf(node) === 'entry-content')
      if (!entry) throw new Error('no .entry-content')
      document.articleClass = str(propsOf(openingOf(article)).className, 'article className')
      document.heading = textOf(childrenOf(classicTitle))
      document.content = richChildren(childrenOf(entry))
      const classes = bodyClasses(file) ?? []
      if (classes.join(' ') !== 'et_right_sidebar') throw new Error(`classic page with body classes ${classes.join(' ')}`)
    } else {
      template = 'builder'
      const article = findBy(main, (node) => tagOf(node) === 'article')
      const inner = findBy(main, (node) => classOf(node) === 'et_builder_inner_content et_pb_gutters3')
      if (!article || !inner) throw new Error('no Divi tree')
      document.articleClass = classOf(article)
      document.sections = sectionsOf(inner)
    }
  }

  document.template = template
  // A stable key order, for diffs: template and scope first.
  const { template: t, scope, articleClass, docsSlug, protected: isProtected, post, heading, content, sections, body } = document
  const ordered = { template: t } as PageDocument
  if (scope) ordered.scope = scope
  if (articleClass) ordered.articleClass = articleClass
  if (docsSlug) ordered.docsSlug = docsSlug
  if (isProtected) ordered.protected = true
  if (post) ordered.post = post
  if (heading !== undefined) ordered.heading = heading
  if (content) ordered.content = content
  ordered.sections = sections
  if (body) ordered.body = body
  return ordered
}

if (process.argv[1] && process.argv[1].endsWith('tsx-to-document.ts') && process.argv[2]) {
  console.log(JSON.stringify(tsxToDocument(readFileSync(process.argv[2], 'utf8')), null, 1))
}
