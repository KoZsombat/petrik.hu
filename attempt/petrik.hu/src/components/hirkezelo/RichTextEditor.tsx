import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Align, BlockType, RichTextBlock, RichTextDocument } from '../../../shared/pnw/types.ts'
import { blockText, emptyBlock } from '../../../shared/pnw/richtext.ts'
import './RichTextEditor.css'

type Props = {
  id: string
  value: RichTextDocument
  onChange: (next: RichTextDocument) => void
}

/**
 * A real, working structured rich-text editor - not TinyMCE, and not a plain
 * textarea. See AGENT.md 6.15 for why: this repo never renders raw HTML
 * (no dangerouslySetInnerHTML), so the plugin's WordPress editor can't be
 * reproduced as-is. Every block carries one run (one text, with its own
 * bold/italic/align), edited as a plain <textarea> styled live with that
 * run's own bold/italic/align - genuinely WYSIWYG-ish without ever touching
 * innerHTML. Toolbar undo/redo works at the block-structure level (add/
 * remove/format/type changes); in-block character edits use the textarea's
 * own native undo.
 */
export default function RichTextEditor({ id, value, onChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(value[0]?.id ?? null)
  const history = useRef<RichTextDocument[]>([])
  const future = useRef<RichTextDocument[]>([])
  const editSnapshot = useRef<RichTextDocument | null>(null)

  const active = value.find((block) => block.id === activeId)

  function commit(next: RichTextDocument, snapshot: RichTextDocument = value): void {
    history.current = [...history.current, snapshot]
    future.current = []
    onChange(next)
  }

  function updateActive(updater: (block: RichTextBlock) => RichTextBlock): void {
    if (!active) return
    commit(value.map((block) => (block.id === active.id ? updater(block) : block)))
  }

  function setText(blockId: string, text: string): void {
    onChange(
      value.map((block) => (block.id === blockId ? { ...block, runs: [{ ...block.runs[0], text }] } : block)),
    )
  }

  function addBlock(): void {
    const block = emptyBlock()
    commit([...value, block])
    setActiveId(block.id)
  }

  function removeBlock(blockId: string): void {
    if (value.length <= 1) return
    const index = value.findIndex((block) => block.id === blockId)
    commit(value.filter((block) => block.id !== blockId))
    const fallback = value[index - 1] ?? value[index + 1]
    setActiveId(fallback ? fallback.id : null)
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

  return (
    <div className="pnw-rte" id={id}>
      <div className="pnw-rte-toolbar" role="toolbar" aria-label="Formázás">
        <select
          className="pnw-rte-format"
          aria-label="Bekezdés stílusa"
          value={active?.type === 'heading' ? 'heading' : 'paragraph'}
          onChange={(event) => updateActive((block) => ({ ...block, type: event.target.value as BlockType }))}
        >
          <option value="paragraph">Bekezdés</option>
          <option value="heading">Cím</option>
        </select>

        <ToolbarButton label="Félkövér" active={!!active?.runs[0]?.bold} onClick={() => toggleRun('bold')}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton label="Dőlt" active={!!active?.runs[0]?.italic} onClick={() => toggleRun('italic')}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Felsorolás"
          active={active?.type === 'bulleted-list'}
          onClick={() => toggleListType('bulleted-list')}
        >
          •≡
        </ToolbarButton>
        <ToolbarButton
          label="Számozott lista"
          active={active?.type === 'numbered-list'}
          onClick={() => toggleListType('numbered-list')}
        >
          1≡
        </ToolbarButton>
        <ToolbarButton
          label="Idézet"
          active={active?.type === 'blockquote'}
          onClick={() =>
            updateActive((block) => ({ ...block, type: block.type === 'blockquote' ? 'paragraph' : 'blockquote' }))
          }
        >
          “”
        </ToolbarButton>
        <ToolbarButton label="Balra igazítás" active={(active?.align ?? 'left') === 'left'} onClick={() => setAlign('left')}>
          ⇤
        </ToolbarButton>
        <ToolbarButton label="Középre igazítás" active={active?.align === 'center'} onClick={() => setAlign('center')}>
          ⇔
        </ToolbarButton>
        <ToolbarButton label="Jobbra igazítás" active={active?.align === 'right'} onClick={() => setAlign('right')}>
          ⇥
        </ToolbarButton>
        <ToolbarButton label="Visszavonás" onClick={undo}>
          ↶
        </ToolbarButton>
        <ToolbarButton label="Ismétlés" onClick={redo}>
          ↷
        </ToolbarButton>
        <ToolbarButton label="Formázás törlése" onClick={clearFormatting}>
          Tx
        </ToolbarButton>
      </div>

      <div className="pnw-rte-body">
        {value.map((block) => (
          <BlockRow
            key={block.id}
            block={block}
            active={block.id === activeId}
            removable={value.length > 1}
            onFocus={() => {
              setActiveId(block.id)
              editSnapshot.current = value
            }}
            onBlur={() => {
              if (editSnapshot.current && editSnapshot.current !== value) {
                history.current = [...history.current, editSnapshot.current]
                future.current = []
              }
              editSnapshot.current = null
            }}
            onChangeText={(text) => setText(block.id, text)}
            onRemove={() => removeBlock(block.id)}
          />
        ))}
      </div>

      <button type="button" className="pnw-rte-add" onClick={addBlock}>
        + Új bekezdés
      </button>
    </div>
  )

  function toggleRun(key: 'bold' | 'italic'): void {
    updateActive((block) => ({
      ...block,
      runs: [{ ...block.runs[0], [key]: !block.runs[0]?.[key] }],
    }))
  }

  function setAlign(align: Align): void {
    updateActive((block) => ({ ...block, align }))
  }

  function toggleListType(type: 'bulleted-list' | 'numbered-list'): void {
    updateActive((block) => ({ ...block, type: block.type === type ? 'paragraph' : type }))
  }

  function clearFormatting(): void {
    updateActive((block) => ({ ...block, align: undefined, runs: [{ text: blockText(block) }] }))
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
      // Keeps focus (and the undo snapshot) on the block's own textarea -
      // otherwise clicking a button would blur it first.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function BlockRow({
  block,
  active,
  removable,
  onFocus,
  onBlur,
  onChangeText,
  onRemove,
}: {
  block: RichTextBlock
  active: boolean
  removable: boolean
  onFocus: () => void
  onBlur: () => void
  onChangeText: (text: string) => void
  onRemove: () => void
}) {
  const isList = block.type === 'bulleted-list' || block.type === 'numbered-list'
  const style: CSSProperties = {
    fontWeight: block.runs[0]?.bold ? 700 : undefined,
    fontStyle: block.runs[0]?.italic ? 'italic' : undefined,
    textAlign: block.align,
  }

  return (
    <div className={`pnw-rte-block pnw-rte-block-${block.type}${active ? ' pnw-rte-block-active' : ''}`}>
      {isList && <span className="pnw-rte-list-marker">{block.type === 'bulleted-list' ? '•' : '#'}</span>}
      <textarea
        className="pnw-rte-input"
        value={blockText(block)}
        rows={block.type === 'heading' ? 1 : 2}
        placeholder={block.type === 'heading' ? 'Cím' : 'Szöveg'}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onChangeText(event.target.value)}
      />
      {removable && (
        <button type="button" className="pnw-rte-remove" aria-label="Bekezdés törlése" onClick={onRemove}>
          ×
        </button>
      )}
    </div>
  )
}
