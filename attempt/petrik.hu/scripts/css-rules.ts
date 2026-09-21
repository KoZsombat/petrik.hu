/**
 * Pulls the rules that mention given selectors out of the mirror's stylesheets.
 *
 * AGENT.md's rule is not to invent CSS: when a ported component needs styling,
 * the rule the original used has to be found rather than guessed. The plugin
 * sheets are minified and up to 180 KB, so grep is no help. This walks them
 * properly, keeps the @media context of every match, and prints the result
 * formatted, ready to curate into a component stylesheet.
 *
 *   node --experimental-strip-types scripts/css-rules.ts <css-file> <token> [token ...]
 *
 * A token is matched as plain text against the selector, so `.betterdocs-body`
 * finds `.betterdocs-body` and `.category-grid .betterdocs-body:hover` alike.
 * Prefix a token with `=` to require the whole selector part to equal it.
 */
import { readFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { MIRROR_ROOT } from './mirror.ts'

const [fileArg, ...tokens] = process.argv.slice(2)
if (!fileArg || !tokens.length) {
  console.error('usage: css-rules.ts <css-file> <token> [token ...]')
  process.exit(1)
}

const path = isAbsolute(fileArg) ? fileArg : join(MIRROR_ROOT, fileArg)
const css = readFileSync(path, 'utf8')

type Rule = { at: string[]; selector: string; body: string }

/**
 * Splits a stylesheet into rules, remembering the at-rule preludes each one is
 * nested under. Brace counting is enough here: these sheets have no strings
 * containing braces, and url(...) values never do either.
 */
function rulesOf(source: string): Rule[] {
  const out: Rule[] = []
  const at: string[] = []
  let prelude = ''
  let depth = 0
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === '{') {
      const head = prelude.trim()
      prelude = ''
      if (head.startsWith('@')) {
        at.push(head)
        depth += 1
        continue
      }
      // A plain rule: consume to its matching close brace.
      let end = i + 1
      let nested = 1
      while (end < source.length && nested > 0) {
        if (source[end] === '{') nested += 1
        if (source[end] === '}') nested -= 1
        end += 1
      }
      out.push({ at: [...at], selector: head, body: source.slice(i + 1, end - 1).trim() })
      i = end - 1
      continue
    }
    if (ch === '}') {
      if (depth > 0) {
        at.pop()
        depth -= 1
      }
      prelude = ''
      continue
    }
    prelude += ch
  }
  return out
}

const matches = (selector: string): boolean =>
  selector.split(',').some((part) =>
    tokens.some((token) =>
      token.startsWith('=') ? part.trim() === token.slice(1) : part.includes(token),
    ),
  )

/** Keeps only the selector parts that matched, so unrelated pages do not leak in. */
function narrow(selector: string): string {
  const kept = selector.split(',').filter((part) =>
    tokens.some((token) =>
      token.startsWith('=') ? part.trim() === token.slice(1) : part.includes(token),
    ),
  )
  return kept.map((part) => part.trim()).join(',\n')
}

const found = rulesOf(css).filter((rule) => matches(rule.selector))

let context = ''
for (const rule of found) {
  const key = rule.at.join(' | ')
  if (key !== context) {
    if (context) console.log('} /* end */\n')
    context = key
    if (key) console.log(`${rule.at.join(' {\n')} {`)
  }
  const indent = rule.at.length ? '  ' : ''
  console.log(`${indent}${narrow(rule.selector).split('\n').join('\n' + indent)} {`)
  for (const decl of rule.body.split(';')) {
    if (decl.trim()) console.log(`${indent}  ${decl.trim()};`)
  }
  console.log(`${indent}}`)
}
if (context) console.log('} /* end */')

console.error(`${found.length} rules matched in ${fileArg}`)
