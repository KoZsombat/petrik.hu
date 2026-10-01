import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { RichStyle, RichStyleKey, RichTextBlock, RichTextDocument, TextRun } from '../../../../../shared/pnw/types.ts'
import { emptyBlock, isSafeHref } from '../../../../../shared/pnw/richtext.ts'
import { blocksToRich, isValidStyleValue, richToBlocks } from '../../../../../shared/pnw/rich-content.ts'
import type { RichContent } from '../../../../../shared/pnw/rich-content.ts'
import { BLUE, TEAL } from './templates.ts'
import '../hirkezelo/RichTextEditor.css'

type Props = {
  id: string
  value: RichContent
  onChange: (next: RichContent) => void
}

/** The format picker's options: the block type, and for a heading its level. */
const FORMATS = [
  ['paragraph', 'Bekezdés'],
  ['h1', 'Címsor 1'],
  ['h2', 'Címsor 2'],
  ['h3', 'Címsor 3'],
  ['h4', 'Címsor 4'],
  ['h5', 'Címsor 5'],
  ['h6', 'Címsor 6'],
  ['div', 'Bekezdés margó nélkül (div)'],
  ['plain', 'Sima szöveg (keret nélkül)'],
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

/** The fonts the site loads (src/styles/fonts.css). */
const FONTS = [
  ['', 'Alapértelmezett'],
  ["'Open Sans', Arial, sans-serif", 'Open Sans'],
  ["'Montserrat', Arial, sans-serif", 'Montserrat'],
  ["'Poppins', Arial, sans-serif", 'Poppins'],
  ["'EB Garamond', Georgia, serif", 'EB Garamond'],
] as const

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px']

/**
 * The Szerkesztő's rich-text field (AGENT.md 6.20). The stored form is a
 * faithful HTML tree (shared/pnw/rich-content.ts); this edits a flattened view
 * of it - blocks of styled runs - and writes the tree back only when something
 * changed, so opening a module changes nothing about it. It wears the
 * Hírkezelő's styles (the `pnw-rte-*` classes) but is a sibling of that
 * editor rather than a wrapper: each run of a block is its own input, so a
 * paragraph with a link in the middle stays exactly that.
 *
 * The toolbar acts on the focused run (bold, italic, underline, link, colour,
 * size, font, case, letter spacing) or its block (format, heading level,
 * alignment, list depth) - "Hatókör" switches the style controls between the
 * two. "+ rész" splits off a new run; that is how part of a paragraph gets a
 * link or a colour. Enter inside a run is a line break (`<br />` on the page).
 */
export default function RichTextField({ id, value, onChange }: Props) {
  // The block ids must outlive a keystroke, or the textareas would remount and
  // lose focus - so the view is state, seeded once from the stored tree.
  const [blocks, setBlocks] = useState<RichTextDocument>(() => richToBlocks(value))
  const [active, setActive] = useState<{ blockId: string; run: number } | null>(() => {
    const first = blocks[0]
    return first ? { blockId: first.id, run: 0 } : null
  })
  const [scope, setScope] = useState<'run' | 'block'>('run')
  const history = useRef<RichTextDocument[]>([])
  const future = useRef<RichTextDocument[]>([])
  const editSnapshot = useRef<RichTextDocument | null>(null)

  const activeBlock = blocks.find((block) => block.id === active?.blockId)
  const activeRun = activeBlock?.runs[active?.run ?? 0]

  function apply(next: RichTextDocument): void {
    setBlocks(next)
    onChange(blocksToRich(next))
  }

  function commit(next: RichTextDocument): void {
    history.current = [...history.current, blocks]
    future.current = []
    apply(next)
  }

  function mapBlock(blockId: string, updater: (block: RichTextBlock) => RichTextBlock): RichTextDocument {
    return blocks.map((block) => (block.id === blockId ? updater(block) : block))
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
    else apply(next)
  }

  function setText(blockId: string, runIndex: number, text: string): void {
    apply(
      mapBlock(blockId, (block) => ({
        ...block,
        runs: block.runs.map((run, index) => (index === runIndex ? { ...run, text } : run)),
      })),
    )
  }

  function setFormat(format: Format): void {
    updateBlock((block) => {
      if (/^h[1-6]$/.test(format)) return { ...block, type: 'heading', level: Number(format.slice(1)) as 1 }
      const next: RichTextBlock = { ...block, type: format as RichTextBlock['type'] }
      delete next.level
      if (format !== 'bulleted-list' && format !== 'numbered-list') delete next.depth
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

  /** A style key on the focused run or - with "Hatókör: bekezdés" - on its whole block. */
  function setStyle(key: RichStyleKey, value: string | undefined): void {
    const patch = (style: RichStyle | undefined): RichStyle | undefined => {
      const next = { ...style }
      if (value) next[key] = value
      else delete next[key]
      return Object.keys(next).length ? next : undefined
    }
    if (scope === 'block') {
      updateBlock((block) => {
        const next = { ...block }
        const style = patch(block.style)
        if (style) next.style = style
        else delete next.style
        return next
      })
      return
    }
    updateRun((run) => {
      const next = { ...run }
      const style = patch(run.style)
      if (style) next.style = style
      else delete next.style
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
    const at = activeBlock ? blocks.indexOf(activeBlock) + 1 : blocks.length
    commit([...blocks.slice(0, at), block, ...blocks.slice(at)])
    setActive({ blockId: block.id, run: 0 })
  }

  function removeBlock(blockId: string): void {
    const index = blocks.findIndex((block) => block.id === blockId)
    commit(blocks.filter((block) => block.id !== blockId))
    const fallback = blocks[index - 1] ?? blocks[index + 1]
    setActive(fallback && fallback.id !== blockId ? { blockId: fallback.id, run: 0 } : null)
  }

  function clearFormatting(): void {
    updateBlock((block) => ({
      id: block.id,
      type: block.type,
      ...(block.type === 'heading' ? { level: block.level } : {}),
      ...(block.depth ? { depth: block.depth } : {}),
      runs: [{ text: block.runs.map((run) => run.text).join('') }],
    }))
    if (activeBlock) setActive({ blockId: activeBlock.id, run: 0 })
  }

  function indent(step: 1 | -1): void {
    updateBlock((block) => {
      const depth = Math.max(0, Math.min(6, (block.depth ?? 0) + step))
      const next = { ...block }
      if (depth) next.depth = depth
      else delete next.depth
      return next
    })
  }

  function undo(): void {
    const previous = history.current[history.current.length - 1]
    if (!previous) return
    history.current = history.current.slice(0, -1)
    future.current = [...future.current, blocks]
    apply(previous)
  }

  function redo(): void {
    const next = future.current[future.current.length - 1]
    if (!next) return
    future.current = future.current.slice(0, -1)
    history.current = [...history.current, blocks]
    apply(next)
  }

  function snapshot(): void {
    editSnapshot.current = blocks
  }

  function settle(): void {
    if (editSnapshot.current && editSnapshot.current !== blocks) {
      history.current = [...history.current, editSnapshot.current]
      future.current = []
    }
    editSnapshot.current = null
  }

  const isList = activeBlock?.type === 'bulleted-list' || activeBlock?.type === 'numbered-list'
  const hrefInvalid = !!activeRun?.href && !isSafeHref(activeRun.href)
  const align = activeBlock?.align
  const styled: RichStyle = (scope === 'block' ? activeBlock?.style : activeRun?.style) ?? {}

  /** A text style input: validated with the server's own patterns, so the editor never offers what would be refused. */
  function styleInput(key: RichStyleKey, label: string, placeholder: string, list?: string) {
    const current = styled[key] ?? ''
    const invalid = current !== '' && !isValidStyleValue(key, current)
    return (
      <label>
        {label}
        <input
          type="text"
          list={list}
          placeholder={placeholder}
          value={current}
          className={invalid ? 'szk-input-invalid' : undefined}
          onFocus={snapshot}
          onBlur={settle}
          onChange={(event) => setStyle(key, event.target.value.trim() || undefined)}
        />
      </label>
    )
  }

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
        <ToolbarButton label="Alapértelmezett igazítás" active={!align} onClick={() => updateBlock(withAlign())}>
          ⇤
        </ToolbarButton>
        <ToolbarButton label="Balra igazítás" active={align === 'left'} onClick={() => updateBlock(withAlign('left'))}>
          ⇠
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
        {isList && (
          <>
            <ToolbarButton label="Beljebb (alpont)" onClick={() => indent(1)}>
              →
            </ToolbarButton>
            <ToolbarButton label="Kijjebb" onClick={() => indent(-1)}>
              ←
            </ToolbarButton>
          </>
        )}
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
          <label>
            Hatókör
            <select value={scope} onChange={(event) => setScope(event.target.value as 'run' | 'block')}>
              <option value="run">kijelölt szövegrész</option>
              <option value="block">egész bekezdés</option>
            </select>
          </label>
          <span className="szk-rte-colors">
            Szín
            {SWATCHES.map(([color, name]) => (
              <button
                key={color}
                type="button"
                className={`szk-swatch${styled.color === color ? ' szk-swatch-active' : ''}`}
                style={{ background: color }}
                title={name}
                aria-label={name}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setStyle('color', color)}
              />
            ))}
            <input
              type="color"
              aria-label="Egyéni szín"
              value={styled.color && /^#[0-9a-f]{6}$/i.test(styled.color) ? styled.color : '#000000'}
              onChange={(event) => setStyle('color', event.target.value)}
            />
            <button
              type="button"
              className="pnw-rte-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setStyle('color', undefined)}
            >
              Nincs
            </button>
          </span>
          {styleInput('fontSize', 'Méret', 'pl. 18px', `${id}-sizes`)}
          <datalist id={`${id}-sizes`}>
            {SIZES.map((size) => (
              <option key={size} value={size} />
            ))}
          </datalist>
          <label>
            Betűtípus
            <select
              value={styled.fontFamily ?? ''}
              onChange={(event) => setStyle('fontFamily', event.target.value || undefined)}
            >
              {styled.fontFamily && !FONTS.some(([value]) => value === styled.fontFamily) && (
                <option value={styled.fontFamily}>{styled.fontFamily}</option>
              )}
              {FONTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {styleInput('letterSpacing', 'Betűköz', 'pl. 2px')}
          <label className="szk-check">
            <input
              type="checkbox"
              checked={styled.textTransform === 'uppercase'}
              onChange={(event) => setStyle('textTransform', event.target.checked ? 'uppercase' : undefined)}
            />
            NAGYBETŰS
          </label>
          {hrefInvalid && (
            <small className="szk-error">A link csak /-rel kezdődő útvonal, http(s)://, mailto: vagy tel: lehet.</small>
          )}
        </div>
      )}

      <div className="pnw-rte-body">
        {blocks.length === 0 && <p className="szk-muted">Üres szövegblokk - adj hozzá egy bekezdést.</p>}
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`pnw-rte-block pnw-rte-block-${block.type}${block.id === active?.blockId ? ' pnw-rte-block-active' : ''}`}
            style={block.depth ? { marginLeft: block.depth * 20 } : undefined}
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

function withAlign(align?: 'left' | 'center' | 'right' | 'justify') {
  return (block: RichTextBlock): RichTextBlock => {
    const next = { ...block }
    if (align) next.align = align
    else delete next.align
    return next
  }
}

const HEADING_SIZES = { 1: 26, 2: 22, 3: 19, 4: 17, 5: 16, 6: 15 } as const

function runStyle(block: RichTextBlock, run: TextRun): CSSProperties {
  const color = run.style?.color ?? block.style?.color
  return {
    fontWeight: run.bold || block.type === 'heading' ? 700 : undefined,
    fontStyle: run.italic ? 'italic' : undefined,
    textDecoration: run.underline || run.href ? 'underline' : undefined,
    // A white run would vanish on the editor's white background.
    color: color && isValidStyleValue('color', color) && color.toLowerCase() !== '#ffffff' ? color : undefined,
    textAlign: block.align === 'justify' ? 'justify' : block.align,
    fontSize: block.type === 'heading' ? HEADING_SIZES[block.level ?? 2] : undefined,
    textTransform: run.style?.textTransform === 'uppercase' || block.style?.textTransform === 'uppercase' ? 'uppercase' : undefined,
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
