/**
 * Extracts a page's Divi "module design" stylesheet from the mirror and writes
 * it as a readable CSS file next to the page component.
 *
 * Divi generates one of these per page — it holds the per-module overrides
 * (.et_pb_text_0 { font-size: 80px }, section divider shapes, and so on) that
 * make each page look the way it does. Keeping it scoped to the page is what
 * stops one page's tweaks leaking into another.
 *
 *   node --experimental-strip-types scripts/page-css.ts <page-dir> <out.css>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { MIRROR_ROOT, PROJECT_ROOT } from './mirror.ts'

/** Splits on `;` and `{`/`}`, but never inside url(...) — data URIs contain both. */
function format(css: string): string {
  let out = ''
  let depth = 0
  let inUrl = 0
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i]
    if (css.startsWith('url(', i)) inUrl += 1
    if (inUrl && ch === ')') inUrl -= 1

    if (inUrl) {
      out += ch
      continue
    }
    if (ch === '{') {
      depth += 1
      out += ' {\n' + '  '.repeat(depth)
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1)
      out = out.replace(/\s+$/, '')
      out += '\n' + '  '.repeat(depth) + '}\n' + '  '.repeat(depth)
    } else if (ch === ';') {
      out += ';\n' + '  '.repeat(depth)
    } else if (ch === ',' && depth === 0) {
      out += ',\n'
    } else {
      out += ch
    }
  }
  return out
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
}

/**
 * Prefixes every selector with the page's scope class.
 *
 * Divi numbered its modules per page - .et_pb_text_1 exists on nearly all of
 * them - and got away with it because each page loaded only its own stylesheet.
 * Here every page stylesheet ends up in one bundle, so without a scope the last
 * page's design would win everywhere. The scope class restores that isolation.
 *
 * This runs on the minified source, before formatting, so that a rule's whole
 * selector list is still on one line: prefixing a list that has already been
 * broken across lines would scope only its last entry.
 */
/**
 * Ancestors of the page component rather than parts of it.
 *
 * Divi writes selectors from the document root down, so many of its rules start
 * outside the page: `body #page-container .et_pb_section …`, or on the docs
 * pages `.et-db #et-boc …`. Prefixing those with the scope class asks for a
 * <body> inside the page component, which cannot exist - the rule then matches
 * nothing at all and the override is silently lost. The scope has to go after
 * them instead.
 *
 * This is how the home page's buttons lost their colour, border and icon: all
 * 54 of those rules began with `body`, and all 54 were dead.
 */
const OUTER = [
  'html',
  'body',
  '.et-db',
  '.et_divi_theme',
  // WordPress put these on <body> too; useBodyClass restores them.
  '.et_right_sidebar',
  '.et_left_sidebar',
  '.et_no_sidebar',
  '#page-container',
  '#et-main-area',
]

/** Puts the scope class at the first token that is inside the page component. */
function scopePart(part: string, scope: string): string {
  const tokens = part.split(/\s+/)
  let at = 0
  while (at < tokens.length && OUTER.some((outer) => tokens[at].startsWith(outer))) at += 1
  // A selector made only of ancestors has nothing page-specific to scope.
  if (at === tokens.length) return part
  return [...tokens.slice(0, at), scope, ...tokens.slice(at)].join(' ')
}

function scopeSelectors(css: string, scope: string): string {
  let out = ''
  let rest = css

  while (rest.length) {
    const brace = rest.indexOf('{')
    if (brace === -1) {
      out += rest
      break
    }

    const prelude = rest.slice(0, brace)
    const boundary = Math.max(prelude.lastIndexOf('}'), prelude.lastIndexOf('{'))
    const before = prelude.slice(0, boundary + 1)
    const selector = prelude.slice(boundary + 1)

    // An at-rule keeps its prelude; the rules nested inside it are reached on
    // the next turns of this loop.
    const scoped = selector.trim().startsWith('@')
      ? selector
      : selector
          .split(',')
          .map((part) => (part.trim() ? scopePart(part.trim(), scope) : part))
          .join(',')

    out += before + scoped + '{'
    rest = rest.slice(brace + 1)
  }

  return out
}

const [pageDir, outPath, scopeArg] = process.argv.slice(2)
if (!pageDir || !outPath) {
  console.error('usage: page-css.ts <page-dir> <out.css> [scope-class]')
  process.exit(1)
}

const html = readFileSync(join(MIRROR_ROOT, pageDir, 'index.html'), 'utf8')
const match = /<style id="et-builder-module-design-[^"]*"[^>]*>([^]*?)<\/style>/.exec(html)

/**
 * Divi only emits this block when a page has module overrides to make, and a
 * few pages - an empty document, the password-protected ones - have none. That
 * is a fact about the page, not a failure, so the file is still written: the
 * generated component imports it unconditionally, and stopping here would halt
 * the whole run over a page that simply has nothing to style.
 */
if (!match) {
  const target = resolve(PROJECT_ROOT, outPath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(
    target,
    [
      '/*',
      ` * ${pageDir} - generated by scripts/page-css.ts, do not edit by hand.`,
      ' *',
      ' * Divi emitted no module design stylesheet for this page, because it has',
      ' * no per-module overrides. This file exists so the import resolves.',
      ' */',
      '',
    ].join('\n'),
    'utf8',
  )
  console.log(`${pageDir} -> ${outPath} (no design stylesheet)`)
  process.exit(0)
}

/**
 * Repoints the uploads the stylesheet refers to - section background images,
 * mostly - at the copies under public/media. Data URIs are left alone.
 */
function rewriteUrls(css: string): string {
  return css.replace(/url\(([^)]+)\)/g, (whole, raw: string) => {
    const url = raw.trim().replace(/^["']|["']$/g, '')
    if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('/')) return whole
    const cleaned = url.replace(/^(\.\.\/)+/, '')
    return cleaned.startsWith('wp-content/') ? `url(/media/${cleaned})` : whole
  })
}

const scope = scopeArg ?? ''
const scoped = scope ? scopeSelectors(match[1], scope) : match[1]
const body = rewriteUrls(format(scoped))

const target = resolve(PROJECT_ROOT, outPath)
mkdirSync(dirname(target), { recursive: true })
writeFileSync(
  target,
  [
    `/* Divi module design stylesheet for /${pageDir}/, lifted from the mirror.`,
    ' * Generated by scripts/page-css.ts - per-module overrides only; the shared',
    ' * theme rules live in src/styles and the component stylesheets.',
    ...(scope
      ? [
          ` *`,
          ` * Every rule is scoped to ${scope}, because Divi numbers its modules per`,
          ` * page and those names would otherwise collide across the bundle.`,
        ]
      : []),
    ' */',
    '',
    body,
    '',
  ].join('\n'),
  'utf8',
)
console.log(`${pageDir} -> ${outPath} (${body.split('\n').length} lines, scope ${scope || 'none'})`)
