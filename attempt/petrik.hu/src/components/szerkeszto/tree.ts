/**
 * Immutable list helpers and labels for the Szerkesztő's editors (AGENT.md
 * 6.19) - kept out of the component files for react-refresh's sake.
 */
import type { PageModule } from '../../../shared/pnw/page-types.ts'
import { blockText } from '../../../shared/pnw/richtext.ts'

/** Moves one item of a list by `step`, or returns the list unchanged at an edge. */
export function move<T>(list: T[], index: number, step: -1 | 1): T[] {
  const target = index + step
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function replace<T>(list: T[], index: number, item: T): T[] {
  return list.map((entry, i) => (i === index ? item : entry))
}

export function remove<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index)
}

/** One line to recognise a module by in the collapsed tree. */
export function moduleSummary(module: PageModule): string {
  switch (module.kind) {
    case 'text':
    case 'toggle':
    case 'blurb': {
      const lead = module.kind === 'text' ? '' : `${module.title ?? ''} - `
      const body = module.content.map(blockText).join(' ').trim()
      return `${lead}${body}`.slice(0, 90) || '(üres)'
    }
    case 'image':
      return module.src
    case 'button':
      return `${module.label} → ${module.to ?? module.href ?? ''}`
    case 'video':
      return module.url || '(nincs link)'
    case 'divider':
      return ''
  }
}
