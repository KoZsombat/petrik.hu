import { createContext, useContext, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { COLUMN_SPANS } from '../../../../../shared/pnw/page-types.ts'
import type { ColumnSpan, PageColumn, PageDocument, PageModule, PageRow, PageSection } from '../../../../../shared/pnw/page-types.ts'
import DesignPanel from './DesignPanel.tsx'
import MediaPicker from './MediaPicker.tsx'
import Modal from './Modal.tsx'
import ModuleEditor from './ModuleEditor.tsx'
import { MODULE_LABEL, PICKER_KINDS, ROW_LAYOUTS, SPAN_LABEL, newModule, newRow, newSection } from './templates.ts'
import { BODY, addModule, addRow, allocator, cloneModule, cloneRow, cloneSection, insert, moduleSummary, moveModule, moveRow, moveSection, remove, removeModule, removeRow, replaceColumn, replaceModule, replaceRow, replaceSection, withLast } from './tree.ts'
import { column as makeColumn } from './templates.ts'

/**
 * The section → row → column → module tree of a PageDocument (AGENT.md 6.20):
 * add, remove and reorder at every level - by drag and drop (the ⠿ handle) or
 * the arrow buttons - move a module into any other column, change a row's
 * columns, and edit each node's own fields and design settings inline. Used
 * for every page: a created one, an edited mirrored one, a docs page's
 * sections.
 *
 * Every node keeps its Divi `index` wherever it goes (so a moved module keeps
 * its look); a node created here gets one above the highest of its kind.
 */

type Drag = { kind: 'section' | 'row' | 'module'; id: string }

const DragContext = createContext<{ drag: Drag | null; setDrag: (drag: Drag | null) => void }>({ drag: null, setDrag: () => {} })

type Ctx = {
  document: PageDocument
  update: (next: PageDocument) => void
  open: string | null
  setOpen: (id: string | null) => void
}

const TreeContext = createContext<Ctx | null>(null)

function useTree(): Ctx {
  const ctx = useContext(TreeContext)
  if (!ctx) throw new Error('outside the tree editor')
  return ctx
}

export default function SectionsEditor({ document, onChange }: { document: PageDocument; onChange: (next: PageDocument) => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const sections = document.sections

  return (
    <DragContext.Provider value={{ drag, setDrag }}>
      <TreeContext.Provider value={{ document, update: onChange, open, setOpen }}>
        <div className="szk-tree">
          {sections.length === 0 && <p className="szk-muted">Még nincs szakasz.</p>}
          <DropZone accept="section" label="Ide kerül a szakasz" onDrop={(drag) => onChange(moveSection(document, drag.id, 0))} />
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              <SectionNode section={section} number={sectionIndex + 1} count={sections.length} />
              <DropZone
                accept="section"
                label="Ide kerül a szakasz"
                onDrop={(drag) => onChange(moveSection(document, drag.id, sectionIndex + 1))}
              />
            </div>
          ))}
          <button
            type="button"
            className="pnw-button pnw-button-secondary"
            onClick={() => onChange({ ...document, sections: [...sections, newSection(allocator(document))] })}
          >
            + Új szakasz
          </button>

          {document.template === 'docs' && !document.protected && (
            <div className="szk-node">
              <header className="szk-node-head">
                <strong>Az oldal törzse (szakaszon kívüli elemek, pl. PDF)</strong>
              </header>
              <ModuleList containerId={BODY} modules={document.body ?? []} kinds={['file-block']} />
            </div>
          )}
        </div>
      </TreeContext.Provider>
    </DragContext.Provider>
  )
}

/* --- drag and drop --------------------------------------------------------------- */

/** A slot the dragged node can be dropped into - rendered only while a node of its kind is being dragged. */
function DropZone({ accept, label, onDrop }: { accept: Drag['kind']; label: string; onDrop: (drag: Drag) => void }) {
  const { drag, setDrag } = useContext(DragContext)
  const [over, setOver] = useState(false)
  if (!drag || drag.kind !== accept) return null

  return (
    <div
      className={`szk-dropzone${over ? ' szk-dropzone-over' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        onDrop(drag)
        setDrag(null)
      }}
    >
      {label}
    </div>
  )
}

/** The ⠿ handle: dragging it drags the whole node it belongs to. */
function Grip({ drag, nodeRef, label }: { drag: Drag; nodeRef: RefObject<HTMLElement | null>; label: string }) {
  const { setDrag } = useContext(DragContext)
  return (
    <button
      type="button"
      className="szk-grip"
      draggable
      title={`${label} áthelyezése (húzd)`}
      aria-label={`${label} áthelyezése húzással`}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', drag.id)
        if (nodeRef.current) event.dataTransfer.setDragImage(nodeRef.current, 12, 12)
        // After the drag image is taken: the zones appear and shift the layout.
        window.setTimeout(() => setDrag(drag), 0)
      }}
      onDragEnd={() => setDrag(null)}
    >
      ⠿
    </button>
  )
}

function NodeTools({
  onMove,
  onRemove,
  onDuplicate,
  label,
}: {
  onMove: (step: -1 | 1) => void
  onRemove: () => void
  onDuplicate?: () => void
  label: string
}) {
  return (
    <span className="szk-tools">
      {onDuplicate && (
        <button type="button" title={`${label} megkettőzése`} aria-label={`${label} megkettőzése`} onClick={onDuplicate}>
          ⧉
        </button>
      )}
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

/* --- section ----------------------------------------------------------------------- */

function SectionNode({ section, number, count }: { section: PageSection; number: number; count: number }) {
  const { document, update, open, setOpen } = useTree()
  const ref = useRef<HTMLElement>(null)
  const id = `szk-${section.id}`
  const settingsOpen = open === section.id
  const patch = (fn: (current: PageSection) => PageSection) => update(replaceSection(document, section.id, fn))
  const at = document.sections.findIndex((entry) => entry.id === section.id)

  function setBackground(background: PageSection['background']): void {
    patch((current) => {
      const next = { ...current }
      if (background && (background.color || background.image)) next.background = background
      else delete next.background
      return next
    })
  }

  function toggle(key: 'first' | 'dividerTop' | 'dividerBottom', on: boolean): void {
    patch((current) => {
      const next = { ...current }
      if (on) next[key] = true
      else delete next[key]
      return next
    })
  }

  return (
    <section className="szk-node szk-section" ref={ref}>
      <header className="szk-node-head">
        <Grip drag={{ kind: 'section', id: section.id }} nodeRef={ref} label="Szakasz" />
        <span className="szk-level szk-level-section">{number}. szakasz</span>
        <span className="szk-node-title">
          {[section.first && 'fejléc', section.fullwidth && 'teljes szélességű', (section.dividerTop || section.dividerBottom) && 'kiemelt sáv']
            .filter(Boolean)
            .join(' · ')}
        </span>
        <button type="button" className="szk-settings-btn" onClick={() => setOpen(settingsOpen ? null : section.id)}>
          ⚙ Szakasz beállításai
        </button>
        <NodeTools
          label="Szakasz"
          onDuplicate={() =>
            update({ ...document, sections: insert(document.sections, at + 1, cloneSection(section, allocator(document))) })
          }
          onMove={(step) => {
            const target = at + step
            if (target >= 0 && target < count) update(moveSection(document, section.id, step === 1 ? target + 1 : target))
          }}
          onRemove={() => {
            if (window.confirm('Biztosan törlöd ezt a szakaszt a teljes tartalmával?')) {
              update({ ...document, sections: remove(document.sections, at) })
            }
          }}
        />
      </header>

      {settingsOpen && (
        <Modal title={`${number}. szakasz beállításai`} kicker="Szakasz" onClose={() => setOpen(null)}>
          <label className="szk-check">
            <input type="checkbox" checked={!!section.first} onChange={(event) => toggle('first', event.target.checked)} />
            Fejléc-szakasz (az oldal teteje: nagy margó, sötétített háttérkép)
          </label>
          <label className="szk-check">
            <input type="checkbox" checked={!!section.dividerTop} onChange={(event) => toggle('dividerTop', event.target.checked)} />
            Türkiz sáv felső ívvel
          </label>
          <label className="szk-check">
            <input type="checkbox" checked={!!section.dividerBottom} onChange={(event) => toggle('dividerBottom', event.target.checked)} />
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
            <label htmlFor={`${id}-bgcolor`}>Háttérszín (kép nélkül)</label>
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
          <DesignPanel id={`${id}-design`} design={section.design} onChange={(design) => patch((current) => ({ ...current, design }))} />
        </Modal>
      )}

      {section.fullwidth ? (
        <ModuleList containerId={section.id} modules={section.modules ?? []} kinds={PICKER_KINDS} />
      ) : (
        <>
          <DropZone accept="row" label="Ide kerül a sor" onDrop={(drag) => update(moveRow(document, drag.id, section.id, 0))} />
          {section.rows.map((row, rowIndex) => (
            <div key={row.id}>
              <RowNode row={row} section={section} position={rowIndex} />
              <DropZone
                accept="row"
                label="Ide kerül a sor"
                onDrop={(drag) => update(moveRow(document, drag.id, section.id, rowIndex + 1))}
              />
            </div>
          ))}
          <button type="button" className="szk-add szk-add-wide" onClick={() => update(addRow(document, section.id, newRow(allocator(document))))}>
            + Sor hozzáadása a(z) {number}. szakaszhoz
          </button>
        </>
      )}
    </section>
  )
}

/* --- row ----------------------------------------------------------------------------- */

/**
 * Switching layout keeps every module: surplus columns are folded into the
 * last remaining one, missing ones are added empty (with a fresh Divi number).
 */
function relayout(row: PageRow, spans: ColumnSpan[], document: PageDocument): PageRow {
  const alloc = allocator(document)
  const columns = spans.map((span, index) => {
    const existing = row.columns[index]
    return existing ? { ...existing, span } : makeColumn(alloc, span, [])
  })
  const surplus = row.columns.slice(spans.length).flatMap((column) => column.modules)
  if (surplus.length) {
    const last = columns[columns.length - 1]
    columns[columns.length - 1] = { ...last, modules: [...last.modules, ...surplus] }
  }
  return withLast({ ...row, columns })
}

function RowNode({ row, section, position }: { row: PageRow; section: PageSection; position: number }) {
  const { document, update, open, setOpen } = useTree()
  const ref = useRef<HTMLDivElement>(null)
  const layout = row.columns.map((column) => column.span).join('+')
  const settingsOpen = open === row.id
  const patch = (fn: (current: PageRow) => PageRow) => update(replaceRow(document, row.id, fn))

  return (
    <div className="szk-node szk-row" ref={ref}>
      <header className="szk-node-head">
        <Grip drag={{ kind: 'row', id: row.id }} nodeRef={ref} label="Sor" />
        <span className="szk-level szk-level-row">{position + 1}. sor</span>
        <span className="szk-node-title">{row.columns.length} hasáb</span>
        <button type="button" className="szk-settings-btn" onClick={() => setOpen(settingsOpen ? null : row.id)}>
          ⚙ Sor beállításai
        </button>
        <NodeTools
          label="Sor"
          onDuplicate={() => update(addRow(document, section.id, cloneRow(row, allocator(document)), position + 1))}
          onMove={(step) => {
            const target = position + step
            if (target >= 0 && target < section.rows.length) update(moveRow(document, row.id, section.id, step === 1 ? target + 1 : target))
          }}
          onRemove={() => update(removeRow(document, row.id))}
        />
      </header>

      <div className="szk-layout-bar">
        <span className="szk-layout-label">Elrendezés</span>
        <span className="szk-layouts" role="group" aria-label="Hasábok">
          {ROW_LAYOUTS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={option.spans.join('+') === layout ? 'szk-layout-active' : undefined}
              onClick={() => patch((current) => relayout(current, option.spans, document))}
            >
              {option.label}
            </button>
          ))}
        </span>
        <button
          type="button"
          className="szk-link"
          onClick={() =>
            patch((current) =>
              withLast({ ...current, columns: [...current.columns, makeColumn(allocator(document), '1_4', [])] }),
            )
          }
        >
          + hasáb hozzáadása
        </button>
      </div>

      {settingsOpen && (
        <Modal title="Sor beállításai" kicker="Sor" onClose={() => setOpen(null)}>
          <label className="szk-check">
            <input
              type="checkbox"
              checked={row.gutters === 4}
              onChange={(event) =>
                patch((current) => {
                  const next = { ...current }
                  if (event.target.checked) next.gutters = 4
                  else delete next.gutters
                  return next
                })
              }
            />
            Széles hasábköz
          </label>
          <DesignPanel
            id={`szk-${row.id}-design`}
            design={row.design}
            onChange={(design) => patch((current) => ({ ...current, design }))}
          />
        </Modal>
      )}

      <div className="szk-columns">
        {row.columns.map((column, columnIndex) => (
          <ColumnNode key={column.id} column={column} row={row} number={columnIndex + 1} />
        ))}
      </div>
    </div>
  )
}

/* --- column ------------------------------------------------------------------------- */

const BORDER = 'et_pb_with_border'

function hasClass(className: string | undefined, token: string): boolean {
  return (className ?? '').split(/\s+/).includes(token)
}

function ColumnNode({ column, row, number }: { column: PageColumn; row: PageRow; number: number }) {
  const { document, update, open, setOpen } = useTree()
  const settingsOpen = open === column.id
  const patch = (fn: (current: PageColumn) => PageColumn) => update(replaceColumn(document, column.id, fn))

  function setBordered(on: boolean): void {
    patch((current) => {
      const tokens = (current.className ?? '').split(/\s+/).filter((token) => token && token !== BORDER)
      if (on) tokens.push(BORDER)
      const next = { ...current }
      if (tokens.length) next.className = tokens.join(' ')
      else delete next.className
      return next
    })
  }

  return (
    <div className="szk-node szk-column">
      <div className="szk-column-head">
        <span className="szk-level szk-level-column">{number}. hasáb</span>
        <select
          className="szk-select"
          aria-label="Hasáb szélessége"
          value={column.span}
          onChange={(event) => patch((current) => ({ ...current, span: event.target.value as ColumnSpan }))}
        >
          {COLUMN_SPANS.map((span) => (
            <option key={span} value={span}>
              {SPAN_LABEL[span]}
            </option>
          ))}
        </select>
        <button type="button" className="szk-settings-btn" onClick={() => setOpen(settingsOpen ? null : column.id)}>
          ⚙ Beállítások
        </button>
        {row.columns.length > 1 && (
          <button
            type="button"
            className="szk-danger szk-column-remove"
            title="Hasáb törlése (a tartalma a szomszédos hasábba kerül)"
            aria-label="Hasáb törlése"
            onClick={() =>
              update(
                replaceRow(document, row.id, (current) => {
                  const at = current.columns.findIndex((entry) => entry.id === column.id)
                  const heir = current.columns[at === 0 ? 1 : at - 1]
                  const columns = current.columns
                    .filter((entry) => entry.id !== column.id)
                    .map((entry) => (entry.id === heir.id ? { ...entry, modules: at === 0 ? [...column.modules, ...entry.modules] : [...entry.modules, ...column.modules] } : entry))
                  return withLast({ ...current, columns })
                }),
              )
            }
          >
            ✕
          </button>
        )}
      </div>

      {settingsOpen && (
        <Modal title="Hasáb beállításai" kicker="Hasáb" onClose={() => setOpen(null)}>
          <label className="szk-check">
            <input type="checkbox" checked={hasClass(column.className, BORDER)} onChange={(event) => setBordered(event.target.checked)} />
            Kártya (türkiz felső keret)
          </label>
          <DesignPanel id={`szk-${column.id}-design`} design={column.design} onChange={(design) => patch((current) => ({ ...current, design }))} />
        </Modal>
      )}

      <ModuleList containerId={column.id} modules={column.modules} kinds={PICKER_KINDS} />
    </div>
  )
}

/* --- modules ------------------------------------------------------------------------- */

function ModuleList({ containerId, modules, kinds }: { containerId: string; modules: PageModule[]; kinds: readonly PageModule['kind'][] }) {
  const { document, update, setOpen } = useTree()

  return (
    <>
      <DropZone accept="module" label="Ide kerül az elem" onDrop={(drag) => update(moveModule(document, drag.id, containerId, 0))} />
      {modules.map((module, moduleIndex) => (
        <div key={module.id}>
          <ModuleNode module={module} containerId={containerId} position={moduleIndex} count={modules.length} />
          <DropZone
            accept="module"
            label="Ide kerül az elem"
            onDrop={(drag) => update(moveModule(document, drag.id, containerId, moduleIndex + 1))}
          />
        </div>
      ))}
      <select
        className="szk-add-module"
        aria-label="Új modul"
        value=""
        onChange={(event) => {
          const kind = event.target.value as PageModule['kind']
          if (!kind) return
          const module = newModule(kind, allocator(document))
          update(addModule(document, containerId, module))
          setOpen(module.id)
        }}
      >
        <option value="">+ Modul hozzáadása…</option>
        {kinds.map((kind) => (
          <option key={kind} value={kind}>
            {MODULE_LABEL[kind]}
          </option>
        ))}
      </select>
    </>
  )
}

function ModuleNode({ module, containerId, position, count }: { module: PageModule; containerId: string; position: number; count: number }): ReactNode {
  const { document, update, open, setOpen } = useTree()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className={`szk-module${open === module.id ? ' szk-module-open' : ''}`}>
      <header className="szk-node-head">
        <Grip drag={{ kind: 'module', id: module.id }} nodeRef={ref} label="Modul" />
        <button type="button" className="szk-module-title" onClick={() => setOpen(open === module.id ? null : module.id)}>
          <span className="pnw-badge">{MODULE_LABEL[module.kind]}</span>
          <span className="szk-summary">{moduleSummary(module)}</span>
        </button>
        <NodeTools
          label="Modul"
          onDuplicate={() => update(addModule(document, containerId, cloneModule(module, allocator(document)), position + 1))}
          onMove={(step) => {
            const target = position + step
            if (target >= 0 && target < count) update(moveModule(document, module.id, containerId, step === 1 ? target + 1 : target))
          }}
          onRemove={() => update(removeModule(document, module.id))}
        />
      </header>
      {open === module.id && (
        <Modal title={MODULE_LABEL[module.kind]} kicker="Modul szerkesztése" onClose={() => setOpen(null)}>
          <ModuleEditor module={module} onChange={(next) => update(replaceModule(document, next))} />
        </Modal>
      )}
    </div>
  )
}
