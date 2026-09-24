import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { RichTextBlock, RichTextDocument, TextRun } from '../../../shared/pnw/types.ts'

/**
 * Read-only rendering of a RichTextDocument. Always real JSX (<p>, <ul>/<li>,
 * <blockquote>, <strong>/<em>) - this repo never uses dangerouslySetInnerHTML,
 * so there is no raw-HTML path at all, unlike the plugin this replaces (see
 * AGENT.md 6.15).
 */
export default function RichText({ document }: { document: RichTextDocument }) {
  return <>{groupBlocks(document).map((group) => renderGroup(group))}</>
}

type Group = { list: 'bulleted-list' | 'numbered-list'; blocks: RichTextBlock[] } | { list: null; block: RichTextBlock }

function groupBlocks(document: RichTextDocument): Group[] {
  const groups: Group[] = []
  for (const block of document) {
    if (block.type === 'bulleted-list' || block.type === 'numbered-list') {
      const last = groups[groups.length - 1]
      if (last && last.list === block.type) {
        last.blocks.push(block)
        continue
      }
      groups.push({ list: block.type, blocks: [block] })
      continue
    }
    groups.push({ list: null, block })
  }
  return groups
}

function renderRuns(runs: TextRun[]) {
  return runs.map((run, index) => {
    let node: ReactNode = run.text
    if (run.italic) node = <em>{node}</em>
    if (run.bold) node = <strong>{node}</strong>
    return <Fragment key={index}>{node}</Fragment>
  })
}

function renderGroup(group: Group) {
  if (group.list) {
    const Tag = group.list === 'bulleted-list' ? 'ul' : 'ol'
    return (
      <Tag key={group.blocks[0].id}>
        {group.blocks.map((block) => (
          <li key={block.id}>{renderRuns(block.runs)}</li>
        ))}
      </Tag>
    )
  }

  const { block } = group
  const style = block.align && block.align !== 'left' ? { textAlign: block.align } : undefined

  if (block.type === 'heading') {
    return (
      <h2 key={block.id} style={style}>
        {renderRuns(block.runs)}
      </h2>
    )
  }
  if (block.type === 'blockquote') {
    return (
      <blockquote key={block.id} style={style}>
        {renderRuns(block.runs)}
      </blockquote>
    )
  }
  return (
    <p key={block.id} style={style}>
      {renderRuns(block.runs)}
    </p>
  )
}
