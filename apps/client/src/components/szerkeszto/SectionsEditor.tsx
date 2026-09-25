import { useState } from 'react'
import { MODULE_KINDS, nodeId } from '../../../../../shared/pnw/page-types.ts'
import type { PageColumn, PageModule, PageRow, PageSection } from '../../../../../shared/pnw/page-types.ts'
import MediaPicker from './MediaPicker.tsx'
import ModuleEditor from './ModuleEditor.tsx'
import { MODULE_LABEL, ROW_LAYOUTS, newModule, newSection, column as newColumn } from './templates.ts'
import { move, moduleSummary, remove, replace } from './tree.ts'

/**
 * The section → row → column → module tree of a PageDocument (AGENT.md
 * 6.19): add, remove and reorder at every level, the four Divi row layouts,
 * and each module's own fields inline. Used for a whole builder page
 * (BuilderEditor.tsx) and for the sections appended below a mirrored page
 * (OverrideEditor.tsx).
 */
export default function SectionsEditor({
  sections,
  onChange,
  allowHero = true,
}: {
  sections: PageSection[]
  onChange: (next: PageSection[]) => void
  /** Appended sections sit below a finished page - a second hero makes no sense there. */
  allowHero?: boolean
}) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="szk-tree">
      {sections.length === 0 && <p className="szk-muted">Még nincs szakasz.</p>}
      {sections.map((section, sectionIndex) => (
        <SectionNode
          key={section.id}
          section={section}
          number={sectionIndex + 1}
          allowHero={allowHero}
          open={open}
          setOpen={setOpen}
          onChange={(next) => onChange(replace(sections, sectionIndex, next))}
          onMove={(step) => onChange(move(sections, sectionIndex, step))}
          onRemove={() => {
            if (window.confirm('Biztosan törlöd ezt a szakaszt a teljes tartalmával?')) onChange(remove(sections, sectionIndex))
          }}
        />
      ))}
      <button type="button" className="pnw-button pnw-button-secondary" onClick={() => onChange([...sections, newSection()])}>
        + Új szakasz
      </button>
    </div>
  )
}

function NodeTools({ onMove, onRemove, label }: { onMove: (step: -1 | 1) => void; onRemove: () => void; label: string }) {
  return (
    <span className="szk-tools">
      <button type="button" title={`${label} feljebb`} aria-label={`${label} feljebb`} onClick={() => onMove(-1)}>
        ↑
      </button>
      <button type="button" title={`${label} lejjebb`} aria-label={`${label} lejjebb`} onClick={() => onMove(1)}>
        ↓
      </button>
      <button type="button" className="szk-danger" title={`${label} törlése`} aria-label={`${label} törlése`} onClick={onRemove}>
        ✕
      </button>
    </span>
  )
}

function SectionNode({
  section,
  number,
  allowHero,
  open,
  setOpen,
  onChange,
  onMove,
  onRemove,
}: {
  section: PageSection
  number: number
  allowHero: boolean
  open: string | null
  setOpen: (id: string | null) => void
  onChange: (next: PageSection) => void
  onMove: (step: -1 | 1) => void
  onRemove: () => void
}) {
  const id = `szk-${section.id}`
  const settingsOpen = open === section.id

  function setBackground(background: PageSection['background']): void {
    const next = { ...section }
    if (background && (background.color || background.image)) next.background = background
    else delete next.background
    onChange(next)
  }

  function toggle(key: 'first' | 'dividerTop' | 'dividerBottom', on: boolean): void {
    const next = { ...section }
    if (on) next[key] = true
    else delete next[key]
    onChange(next)
  }

  return (
    <section className="szk-node szk-section">
      <header className="szk-node-head">
        <strong>
          {number}. szakasz{section.first ? ' · fejléc' : ''}
          {section.dividerTop || section.dividerBottom ? ' · kiemelt sáv' : ''}
        </strong>
        <button type="button" className="szk-link" onClick={() => setOpen(settingsOpen ? null : section.id)}>
          {settingsOpen ? 'Beállítások bezárása' : 'Beállítások'}
        </button>
        <NodeTools label="Szakasz" onMove={onMove} onRemove={onRemove} />
      </header>

      {settingsOpen && (
        <div className="szk-settings">
          {allowHero && (
            <label className="szk-check">
              <input type="checkbox" checked={!!section.first} onChange={(event) => toggle('first', event.target.checked)} />
              Fejléc-szakasz (az oldal teteje: nagy margó, sötétített háttérkép)
            </label>
          )}
          <label className="szk-check">
            <input
              type="checkbox"
              checked={!!section.dividerTop}
              onChange={(event) => toggle('dividerTop', event.target.checked)}
            />
            Türkiz sáv felső ívvel
          </label>
          <label className="szk-check">
            <input
              type="checkbox"
              checked={!!section.dividerBottom}
              onChange={(event) => toggle('dividerBottom', event.target.checked)}
            />
            Türkiz sáv alsó ívvel
          </label>
          <div className="pnw-field szk-field">
            <label htmlFor={`${id}-bgimage`}>Háttérkép</label>
            <MediaPicker
              id={`${id}-bgimage`}
              value={section.background?.image ?? ''}
              onChange={(image) => setBackground({ ...section.background, image: image || undefined })}
            />
          </div>
          <div className="pnw-field szk-field">
            <label htmlFor={`${id}-bgcolor`}>Háttérszín</label>
            <span className="szk-target">
              <input
                id={`${id}-bgcolor`}
                type="color"
                value={section.background?.color ?? '#ffffff'}
                onChange={(event) => setBackground({ ...section.background, color: event.target.value })}
              />
              <button
                type="button"
                className="pnw-button pnw-button-secondary pnw-button-small"
                onClick={() => setBackground({ ...section.background, color: undefined })}
              >
                Nincs
              </button>
            </span>
          </div>
        </div>
      )}

      {section.rows.map((row, rowIndex) => (
        <RowNode
          key={row.id}
          row={row}
          open={open}
          setOpen={setOpen}
          onChange={(next) => onChange({ ...section, rows: replace(section.rows, rowIndex, next) })}
          onMove={(step) => onChange({ ...section, rows: move(section.rows, rowIndex, step) })}
          onRemove={() => onChange({ ...section, rows: remove(section.rows, rowIndex) })}
        />
      ))}
      <button
        type="button"
        className="szk-add"
        onClick={() => onChange({ ...section, rows: [...section.rows, { id: nodeId('r'), columns: [newColumn('4_4', [])] }] })}
      >
        + Sor
      </button>
    </section>
  )
}

/**
 * Switching layout keeps every module: surplus columns are folded into the
 * last remaining one, missing ones are added empty.
 */
function relayout(row: PageRow, spans: PageColumn['span'][]): PageRow {
  const columns = spans.map((span, index) => {
    const existing = row.columns[index]
    return existing ? { ...existing, span } : newColumn(span, [])
  })
  const surplus = row.columns.slice(spans.length).flatMap((column) => column.modules)
  if (surplus.length) {
    const last = columns[columns.length - 1]
    columns[columns.length - 1] = { ...last, modules: [...last.modules, ...surplus] }
  }
  return { ...row, columns }
}

function RowNode({
  row,
  open,
  setOpen,
  onChange,
  onMove,
  onRemove,
}: {
  row: PageRow
  open: string | null
  setOpen: (id: string | null) => void
  onChange: (next: PageRow) => void
  onMove: (step: -1 | 1) => void
  onRemove: () => void
}) {
  const layout = row.columns.map((column) => column.span).join('+')

  return (
    <div className="szk-node szk-row">
      <header className="szk-node-head">
        <span className="szk-layouts" role="group" aria-label="Hasábok">
          {ROW_LAYOUTS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={option.spans.join('+') === layout ? 'szk-layout-active' : undefined}
              onClick={() => onChange(relayout(row, option.spans))}
            >
              {option.label}
            </button>
          ))}
        </span>
        <label className="szk-check">
          <input
            type="checkbox"
            checked={row.gutters === 4}
            onChange={(event) => {
              const next = { ...row }
              if (event.target.checked) next.gutters = 4
              else delete next.gutters
              onChange(next)
            }}
          />
          Széles hasábköz
        </label>
        <NodeTools label="Sor" onMove={onMove} onRemove={onRemove} />
      </header>
      <div className="szk-columns">
        {row.columns.map((column, columnIndex) => (
          <ColumnNode
            key={column.id}
            column={column}
            open={open}
            setOpen={setOpen}
            onChange={(next) => onChange({ ...row, columns: replace(row.columns, columnIndex, next) })}
          />
        ))}
      </div>
    </div>
  )
}

function ColumnNode({
  column,
  open,
  setOpen,
  onChange,
}: {
  column: PageColumn
  open: string | null
  setOpen: (id: string | null) => void
  onChange: (next: PageColumn) => void
}) {
  return (
    <div className="szk-node szk-column">
      <label className="szk-check">
        <input
          type="checkbox"
          checked={!!column.bordered}
          onChange={(event) => {
            const next = { ...column }
            if (event.target.checked) next.bordered = true
            else delete next.bordered
            onChange(next)
          }}
        />
        Kártya (türkiz felső keret)
      </label>

      {column.modules.map((module, moduleIndex) => (
        <div key={module.id} className={`szk-module${open === module.id ? ' szk-module-open' : ''}`}>
          <header className="szk-node-head">
            <button type="button" className="szk-module-title" onClick={() => setOpen(open === module.id ? null : module.id)}>
              <span className="pnw-badge">{MODULE_LABEL[module.kind]}</span>
              <span className="szk-summary">{moduleSummary(module)}</span>
            </button>
            <NodeTools
              label="Modul"
              onMove={(step) => onChange({ ...column, modules: move(column.modules, moduleIndex, step) })}
              onRemove={() => onChange({ ...column, modules: remove(column.modules, moduleIndex) })}
            />
          </header>
          {open === module.id && (
            <div className="szk-module-body">
              <ModuleEditor
                module={module}
                onChange={(next) => onChange({ ...column, modules: replace(column.modules, moduleIndex, next) })}
              />
            </div>
          )}
        </div>
      ))}

      <select
        className="szk-add-module"
        aria-label="Új modul"
        value=""
        onChange={(event) => {
          const kind = event.target.value as PageModule['kind']
          if (!kind) return
          const module = newModule(kind)
          onChange({ ...column, modules: [...column.modules, module] })
          setOpen(module.id)
        }}
      >
        <option value="">+ Modul…</option>
        {MODULE_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {MODULE_LABEL[kind]}
          </option>
        ))}
      </select>
    </div>
  )
}
