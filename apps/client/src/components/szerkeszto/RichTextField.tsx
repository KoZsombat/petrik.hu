import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { RichTextBlock, RichTextDocument, TextRun } from '../../../../../shared/pnw/types.ts'
import { emptyBlock, isSafeColor, isSafeHref } from '../../../../../shared/pnw/richtext.ts'
import { BLUE, TEAL } from './templates.ts'
import '../hirkezelo/RichTextEditor.css'

type Props = {
  id: string
  value: RichTextDocument
  onChange: (next: RichTextDocument) => void
}

/** The format picker's options: the block type, and for a heading its level. */
const FORMATS = [
  ['paragraph', 'Bekezdés'],
  ['h1', 'Címsor 1'],
  ['h2', 'Címsor 2'],
  ['h3', 'Címsor 3'],
  ['h4', 'Címsor 4'],
  ['bulleted-list', 'Felsorolás'],
  ['numbered-list', 'Számozott lista'],
  ['blockquote', 'Idézet'],
] as const

type Format = (typeof FORMATS)[number][0]

function formatOf(block: RichTextBlock): Format {
  return block.type === 'heading' ? (`h${block.level ?? 2}` as Format) : (block.type as Format)
}

const SWATCHES = [
  [TEAL, 'Türkiz'],
  [BLUE, 'Kék'],
  ['#000000', 'Fekete'],
  ['#ffffff', 'Fehér'],
] as const

/**
 * The Szerkesztő's rich-text field (AGENT.md 6.19). It speaks the same
 * RichTextDocument as the Hírkezelő's RichTextEditor and wears its styles
 * (the `pnw-rte-*` classes), but it is a sibling rather than a wrapper: that
 * editor keeps one run per block and rewrites a block to its first run on
 * every keystroke, which would strip the bold word or the coloured span out
 * of every paragraph imported from the mirror. Here each run of a block is
 * its own input, so a paragraph with a link in the middle stays exactly that.
 *
 * The toolbar acts on the focused run (bold, italic, underline, colour, link)
 * or its block (format, heading level, alignment). "+ rész" splits off a new
 * run - that is how part of a paragraph gets a link or a colour. Enter inside
 * a run is a line break (`<br />` on the page).
 */
export default function RichTextField({ id, value, onChange }: Props) {
  const [active, setActive] = useState<{ blockId: string; run: number } | null>(
    value[0] ? { blockId: value[0].id, run: 0 } : null,
  )
  const history = useRef<RichTextDocument[]>([])
  const future = useRef<RichTextDocument[]>([])
  const editSnapshot = useRef<RichTextDocument | null>(null)

  const activeBlock = value.find((block) => block.id === active?.blockId)
  const activeRun = activeBlock?.runs[active?.run ?? 0]

  function commit(next: RichTextDocument): void {
    history.current = [...history.current, value]
    future.current = []
    onChange(next)
  }

  function mapBlock(blockId: string, updater: (block: RichTextBlock) => RichTextBlock): RichTextDocument {
    return value.map((block) => (block.id === blockId ? updater(block) : block))
  }

  function updateBlock(updater: (block: RichTextBlock) => RichTextBlock): void {
    if (activeBlock) commit(mapBlock(activeBlock.id, updater))
  }

  function updateRun(updater: (run: TextRun) => TextRun, record = true): void {
    if (!activeBlock || !active) return
    const next = mapBlock(activeBlock.id, (block) => ({
      ...block,
      runs: block.runs.map((run, index) => (index === active.run ? updater(run) : run)),
    }))
    if (record) commit(next)
    else onChange(next)
  }

  function setText(blockId: string, runIndex: number, text: string): void {
    onChange(
      mapBlock(blockId, (block) => ({
        ...block,
        runs: block.runs.map((run, index) => (index === runIndex ? { ...run, text } : run)),
      })),
    )
  }

  function setFormat(format: Format): void {
    updateBlock((block) => {
      if (format.startsWith('h')) {
        return { ...block, type: 'heading', level: Number(format.slice(1)) as 1 | 2 | 3 | 4 }
      }
      const next: RichTextBlock = { ...block, type: format as RichTextBlock['type'] }
      delete next.level
      return next
    })
  }

  function toggleMark(key: 'bold' | 'italic' | 'underline'): void {
    updateRun((run) => {
      const next = { ...run }
      if (run[key]) delete next[key]
      else next[key] = true
      return next
    })
  }

  function setColor(color: string | undefined): void {
    updateRun((run) => {
      const next = { ...run }
      if (color) next.color = color
      else delete next.color
      return next
    })
  }

  function setHref(href: string): void {
    updateRun((run) => {
      const next = { ...run }
      if (href) next.href = href
      else delete next.href
      return next
    }, false)
  }

  function addRun(): void {
    if (!activeBlock || !active) return
    const at = active.run + 1
    commit(
      mapBlock(activeBlock.id, (block) => ({
        ...block,
        runs: [...block.runs.slice(0, at), { text: '' }, ...block.runs.slice(at)],
      })),
    )
    setActive({ blockId: activeBlock.id, run: at })
  }

  function removeRun(): void {
    if (!activeBlock || !active || activeBlock.runs.length <= 1) return
    commit(mapBlock(activeBlock.id, (block) => ({ ...block, runs: block.runs.filter((_, i) => i !== active.run) })))
    setActive({ blockId: activeBlock.id, run: Math.max(0, active.run - 1) })
  }

  function addBlock(): void {
    const block = emptyBlock()
    const at = activeBlock ? value.indexOf(activeBlock) + 1 : value.length
    commit([...value.slice(0, at), block, ...value.slice(at)])
    setActive({ blockId: block.id, run: 0 })
  }

  function removeBlock(blockId: string): void {
    const index = value.findIndex((block) => block.id === blockId)
    commit(value.filter((block) => block.id !== blockId))
    const fallback = value[index - 1] ?? value[index + 1]
    setActive(fallback && fallback.id !== blockId ? { blockId: fallback.id, run: 0 } : null)
  }

  function clearFormatting(): void {
    updateBlock((block) => ({
      id: block.id,
      type: block.type,
      ...(block.type === 'heading' ? { level: block.level } : {}),
      runs: [{ text: block.runs.map((run) => run.text).join('') }],
    }))
    if (activeBlock) setActive({ blockId: activeBlock.id, run: 0 })
  }

  function undo(): void {
    const previous = history.current[history.current.length - 1]
    if (!previous) return
    history.current = history.current.slice(0, -1)
    future.current = [...future.current, value]
    onChange(previous)
  }

  function redo(): void {
    const next = future.current[future.current.length - 1]
    if (!next) return
    future.current = future.current.slice(0, -1)
    history.current = [...history.current, value]
    onChange(next)
  }

  function snapshot(): void {
    editSnapshot.current = value
  }

  function settle(): void {
    if (editSnapshot.current && editSnapshot.current !== value) {
      history.current = [...history.current, editSnapshot.current]
      future.current = []
    }
    editSnapshot.current = null
  }

  const hrefInvalid = !!activeRun?.href && !isSafeHref(activeRun.href)
  const align = activeBlock?.align ?? 'left'

  return (
    <div className="pnw-rte szk-rte" id={id}>
      <div className="pnw-rte-toolbar" role="toolbar" aria-label="Formázás">
        <select
          className="pnw-rte-format"
          aria-label="Bekezdés stílusa"
          value={activeBlock ? formatOf(activeBlock) : 'paragraph'}
          disabled={!activeBlock}
          onChange={(event) => setFormat(event.target.value as Format)}
        >
          {FORMATS.map(([format, label]) => (
            <option key={format} value={format}>
              {label}
            </option>
          ))}
        </select>
        <ToolbarButton label="Félkövér" active={!!activeRun?.bold} onClick={() => toggleMark('bold')}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton label="Dőlt" active={!!activeRun?.italic} onClick={() => toggleMark('italic')}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton label="Aláhúzott" active={!!activeRun?.underline} onClick={() => toggleMark('underline')}>
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton label="Balra igazítás" active={align === 'left'} onClick={() => updateBlock(withAlign())}>
          ⇤
        </ToolbarButton>
        <ToolbarButton label="Középre igazítás" active={align === 'center'} onClick={() => updateBlock(withAlign('center'))}>
          ⇔
        </ToolbarButton>
        <ToolbarButton label="Jobbra igazítás" active={align === 'right'} onClick={() => updateBlock(withAlign('right'))}>
          ⇥
        </ToolbarButton>
        <ToolbarButton label="Sorkizárt" active={align === 'justify'} onClick={() => updateBlock(withAlign('justify'))}>
          ≣
        </ToolbarButton>
        <ToolbarButton label="Új szövegrész a kijelölt után (linkhez, színhez)" onClick={addRun}>
          + rész
        </ToolbarButton>
        <ToolbarButton label="A kijelölt szövegrész törlése" onClick={removeRun}>
          − rész
        </ToolbarButton>
        <ToolbarButton label="Visszavonás" onClick={undo}>
          ↶
        </ToolbarButton>
        <ToolbarButton label="Ismétlés" onClick={redo}>
          ↷
        </ToolbarButton>
        <ToolbarButton label="Formázás törlése (a bekezdés egy sima szöveggé válik)" onClick={clearFormatting}>
          Tx
        </ToolbarButton>
      </div>

      {activeRun && (
        <div className="szk-rte-runbar">
          <label>
            Link
            <input
              type="text"
              placeholder="/oldal/ vagy https://…"
              value={activeRun.href ?? ''}
              onFocus={snapshot}
              onBlur={settle}
              onChange={(event) => setHref(event.target.value.trim())}
            />
          </label>
          <span className="szk-rte-colors">
            Szín
            {SWATCHES.map(([color, name]) => (
              <button
                key={color}
                type="button"
                className={`szk-swatch${activeRun.color === color ? ' szk-swatch-active' : ''}`}
                style={{ background: color }}
                title={name}
                aria-label={name}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setColor(color)}
              />
            ))}
            <input
              type="color"
              aria-label="Egyéni szín"
              value={activeRun.color && /^#[0-9a-f]{6}$/i.test(activeRun.color) ? activeRun.color : '#000000'}
              onChange={(event) => setColor(event.target.value)}
            />
            <button
              type="button"
              className="pnw-rte-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setColor(undefined)}
            >
              Nincs
            </button>
          </span>
          {hrefInvalid && (
            <small className="szk-error">A link csak /-rel kezdődő útvonal, http(s)://, mailto: vagy tel: lehet.</small>
          )}
        </div>
      )}

      <div className="pnw-rte-body">
        {value.length === 0 && <p className="szk-muted">Üres szövegblokk - adj hozzá egy bekezdést.</p>}
        {value.map((block) => (
          <div
            key={block.id}
            className={`pnw-rte-block pnw-rte-block-${block.type}${block.id === active?.blockId ? ' pnw-rte-block-active' : ''}`}
          >
            {(block.type === 'bulleted-list' || block.type === 'numbered-list') && (
              <span className="pnw-rte-list-marker">{block.type === 'bulleted-list' ? '•' : '#'}</span>
            )}
            <div className={`szk-runs${block.runs.length > 1 ? ' szk-runs-multi' : ''}`}>
              {block.runs.map((run, index) => (
                <textarea
                  key={index}
                  className={`pnw-rte-input szk-run${
                    block.id === active?.blockId && index === active.run ? ' szk-run-active' : ''
                  }`}
                  value={run.text}
                  rows={Math.max(1, run.text.split('\n').length)}
                  placeholder={block.type === 'heading' ? 'Cím' : 'Szöveg'}
                  style={runStyle(block, run)}
                  title={run.href ? `Link: ${run.href}` : undefined}
                  onFocus={() => {
                    setActive({ blockId: block.id, run: index })
                    snapshot()
                  }}
                  onBlur={settle}
                  onChange={(event) => setText(block.id, index, event.target.value)}
                />
              ))}
            </div>
            <button
              type="button"
              className="pnw-rte-remove"
              aria-label="Bekezdés törlése"
              onClick={() => removeBlock(block.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="pnw-rte-add" onClick={addBlock}>
        + Új bekezdés
      </button>
    </div>
  )
}

function withAlign(align?: 'center' | 'right' | 'justify') {
  return (block: RichTextBlock): RichTextBlock => {
    const next = { ...block }
    if (align) next.align = align
    else delete next.align
    return next
  }
}

const HEADING_SIZES = { 1: 26, 2: 22, 3: 19, 4: 17 } as const

function runStyle(block: RichTextBlock, run: TextRun): CSSProperties {
  return {
    fontWeight: run.bold || block.type === 'heading' ? 700 : undefined,
    fontStyle: run.italic ? 'italic' : undefined,
    textDecoration: run.underline || run.href ? 'underline' : undefined,
    // A white run would vanish on the editor's white background.
    color: run.color && isSafeColor(run.color) && run.color.toLowerCase() !== '#ffffff' ? run.color : undefined,
    textAlign: block.align,
    fontSize: block.type === 'heading' ? HEADING_SIZES[block.level ?? 2] : undefined,
  }
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={`pnw-rte-btn${active ? ' pnw-rte-btn-active' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={active ?? false}
      // Keeps focus on the run's own textarea, as RichTextEditor does.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
