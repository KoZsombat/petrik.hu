/**
 * Immutable operations on a PageDocument for the Szerkesztő's tree editor
 * (AGENT.md 6.20), kept out of the component files for react-refresh's sake.
 *
 * Every node is addressed by its `id`, which is unique across a document.
 * A module "container" is a column's id, a fullwidth section's id, or
 * `BODY` (the docs frame's own module list).
 */
import { nextIndex } from '../../../../../shared/pnw/page-doc.ts'
import type { IndexKey } from '../../../../../shared/pnw/page-doc.ts'
import { richPlainText } from '../../../../../shared/pnw/rich-content.ts'
import { nodeId } from '../../../../../shared/pnw/page-types.ts'
import type { PageColumn, PageDocument, PageModule, PageRow, PageSection } from '../../../../../shared/pnw/page-types.ts'

export const BODY = 'body'

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

/** Inserts at `at`, clamped to the list. */
export function insert<T>(list: T[], at: number, item: T): T[] {
  const index = Math.max(0, Math.min(at, list.length))
  return [...list.slice(0, index), item, ...list.slice(index)]
}

/* --- numbering ---------------------------------------------------------------- */

/**
 * Hands out Divi numbers for new nodes: one above the highest of the kind in
 * the document, then one above that for the next, so several nodes created in
 * one step never collide - and never collide with a stylesheet rule meant for
 * another node (page-types.ts, `index`).
 */
export function allocator(document: PageDocument): (key: IndexKey) => number {
  const next = new Map<IndexKey, number>()
  return (key) => {
    const value = next.get(key) ?? nextIndex(document, key)
    next.set(key, value + 1)
    return value
  }
}

/** Divi's `et-last-child`: set on exactly the last column of a row. */
export function withLast(row: PageRow): PageRow {
  return { ...row, columns: row.columns.map((column, at) => ({ ...column, last: at === row.columns.length - 1 })) }
}

/* --- lookups -------------------------------------------------------------------- */

type Container = { id: string; modules: PageModule[] }

function eachContainer(document: PageDocument): Container[] {
  const out: Container[] = []
  for (const section of document.sections) {
    if (section.modules) out.push({ id: section.id, modules: section.modules })
    for (const row of section.rows) for (const column of row.columns) out.push({ id: column.id, modules: column.modules })
  }
  if (document.body) out.push({ id: BODY, modules: document.body })
  return out
}

export function findModule(document: PageDocument, id: string): PageModule | undefined {
  for (const container of eachContainer(document)) {
    const found = container.modules.find((module) => module.id === id)
    if (found) return found
  }
  return undefined
}

/* --- edits ---------------------------------------------------------------------- */

/** Applies `fn` to the module list of one container (a column, a fullwidth section, or the docs body). */
function mapContainer(document: PageDocument, containerId: string, fn: (modules: PageModule[]) => PageModule[]): PageDocument {
  if (containerId === BODY) return { ...document, body: fn(document.body ?? []) }
  return {
    ...document,
    sections: document.sections.map((section) => {
      if (section.id === containerId) return { ...section, modules: fn(section.modules ?? []) }
      let changed = false
      const rows = section.rows.map((row) => {
        let rowChanged = false
        const columns = row.columns.map((column) => {
          if (column.id !== containerId) return column
          rowChanged = true
          return { ...column, modules: fn(column.modules) }
        })
        if (!rowChanged) return row
        changed = true
        return { ...row, columns }
      })
      return changed ? { ...section, rows } : section
    }),
  }
}

export function replaceModule(document: PageDocument, next: PageModule): PageDocument {
  const apply = (modules: PageModule[]) => modules.map((module) => (module.id === next.id ? next : module))
  return {
    ...document,
    body: document.body ? apply(document.body) : document.body,
    sections: document.sections.map((section) => ({
      ...section,
      modules: section.modules ? apply(section.modules) : section.modules,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({ ...column, modules: apply(column.modules) })),
      })),
    })),
  }
}

export function addModule(document: PageDocument, containerId: string, module: PageModule, at?: number): PageDocument {
  return mapContainer(document, containerId, (modules) => insert(modules, at ?? modules.length, module))
}

export function removeModule(document: PageDocument, moduleId: string): PageDocument {
  return {
    ...document,
    body: document.body?.filter((module) => module.id !== moduleId),
    sections: document.sections.map((section) => ({
      ...section,
      modules: section.modules?.filter((module) => module.id !== moduleId),
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({ ...column, modules: column.modules.filter((module) => module.id !== moduleId) })),
      })),
    })),
  }
}

/** Moves a module to position `at` of a container - the same one (reordering) or another column. */
export function moveModule(document: PageDocument, moduleId: string, containerId: string, at: number): PageDocument {
  const module = findModule(document, moduleId)
  if (!module) return document
  let target = at
  // Removing an earlier item of the same list shifts the slot down by one.
  const own = eachContainer(document).find((container) => container.id === containerId)
  const from = own?.modules.findIndex((item) => item.id === moduleId) ?? -1
  if (from !== -1 && from < at) target -= 1
  return addModule(removeModule(document, moduleId), containerId, module, target)
}

export function replaceColumn(document: PageDocument, columnId: string, fn: (column: PageColumn) => PageColumn): PageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => (column.id === columnId ? fn(column) : column)),
      })),
    })),
  }
}

export function replaceRow(document: PageDocument, rowId: string, fn: (row: PageRow) => PageRow): PageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => (row.id === rowId ? fn(row) : row)),
    })),
  }
}

export function replaceSection(document: PageDocument, sectionId: string, fn: (section: PageSection) => PageSection): PageDocument {
  return { ...document, sections: document.sections.map((section) => (section.id === sectionId ? fn(section) : section)) }
}

export function removeRow(document: PageDocument, rowId: string): PageDocument {
  return { ...document, sections: document.sections.map((section) => ({ ...section, rows: section.rows.filter((row) => row.id !== rowId) })) }
}

export function addRow(document: PageDocument, sectionId: string, row: PageRow, at?: number): PageDocument {
  return replaceSection(document, sectionId, (section) => ({ ...section, rows: insert(section.rows, at ?? section.rows.length, row) }))
}

/** Moves a row to position `at` of a section - the same one or another. */
export function moveRow(document: PageDocument, rowId: string, sectionId: string, at: number): PageDocument {
  let row: PageRow | undefined
  let from = -1
  for (const section of document.sections) {
    const found = section.rows.findIndex((item) => item.id === rowId)
    if (found !== -1) {
      row = section.rows[found]
      if (section.id === sectionId) from = found
    }
  }
  if (!row) return document
  const target = from !== -1 && from < at ? at - 1 : at
  return addRow(removeRow(document, rowId), sectionId, row, target)
}

export function moveSection(document: PageDocument, sectionId: string, at: number): PageDocument {
  const from = document.sections.findIndex((section) => section.id === sectionId)
  if (from === -1) return document
  const target = from < at ? at - 1 : at
  const section = document.sections[from]
  return { ...document, sections: insert(remove(document.sections, from), target, section) }
}

/* --- duplicating ----------------------------------------------------------------- */

/** A copy with a new id and the next free Divi number of its kind - so it can never collide with a rule meant for the original. */
export function cloneModule(module: PageModule, alloc: (key: IndexKey) => number): PageModule {
  return { ...structuredClone(module), id: nodeId('m'), index: alloc(module.kind) }
}

export function cloneRow(row: PageRow, alloc: (key: IndexKey) => number): PageRow {
  const copy = structuredClone(row)
  return {
    ...copy,
    id: nodeId('r'),
    index: alloc('row'),
    columns: copy.columns.map((column) => ({
      ...column,
      id: nodeId('c'),
      index: alloc('column'),
      modules: column.modules.map((module) => cloneModule(module, alloc)),
    })),
  }
}

export function cloneSection(section: PageSection, alloc: (key: IndexKey) => number): PageSection {
  const copy = structuredClone(section)
  return {
    ...copy,
    id: nodeId('s'),
    index: alloc('section'),
    modules: copy.modules?.map((module) => cloneModule(module, alloc)),
    rows: copy.rows.map((row) => cloneRow(row, alloc)),
  }
}

/* --- labels ------------------------------------------------------------------------ */

/** One line to recognise a module by in the collapsed tree. */
export function moduleSummary(module: PageModule): string {
  const clip = (text: string) => text.slice(0, 90)
  switch (module.kind) {
    case 'text':
      return clip(richPlainText(module.content)) || '(üres)'
    case 'toggle':
      return clip(`${module.title} - ${richPlainText(module.content)}`)
    case 'blurb':
      return clip(`${module.title ?? ''} - ${richPlainText(module.content)}`) || '(üres)'
    case 'image':
      return module.src
    case 'button':
      return `${module.label} → ${module.to ?? module.href ?? ''}`
    case 'video':
      return module.url || '(nincs link)'
    case 'divider':
      return ''
    case 'post-feed':
      return `${module.items.length} hír, ${module.columns ?? 3} hasáb`
    case 'team-member':
      return clip(`${module.name}${module.position ? ` - ${module.position}` : ''}`)
    case 'social-follow':
      return module.networks.map((network) => network.network).join(', ') || '(nincs hálózat)'
    case 'number-counter':
      return `${module.value}${module.suffix ?? ''} ${module.title}`
    case 'testimonial':
      return clip(`${module.author} - ${richPlainText(module.content)}`)
    case 'pricing-tables':
      return module.tables.map((table) => table.title).join(' · ')
    case 'hero-slider':
      return `${module.slides.length} dia`
    case 'gallery':
      return `${module.items.length} kép`
    case 'fullwidth-header':
      return clip(module.heading)
    case 'file-block':
      return module.label
  }
}
