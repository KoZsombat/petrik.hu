import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { RichTextBlock, RichTextDocument, TextRun } from '../../../../../shared/pnw/types.ts'
import { isSafeHref } from '../../../../../shared/pnw/richtext.ts'

/**
 * Read-only rendering of a RichTextDocument. Always real JSX (<p>, <h1>-<h4>,
 * <ul>/<li>, <blockquote>, <strong>/<em>/<u>, <a>, coloured <span>) - this
 * repo never uses dangerouslySetInnerHTML, so there is no raw-HTML path at
 * all, unlike the plugin this replaces (see AGENT.md 6.15). The link/colour/
 * underline marks and heading levels are the Szerkesztő's (AGENT.md 6.19); a
 * Hírkezelő post never carries them, so its output is unchanged.
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

/** A `\n` inside a run is a line break (the mirror's `<br />`). */
function withBreaks(text: string): ReactNode {
  if (!text.includes('\n')) return text
  return text.split('\n').map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ))
}

/** What generated pages link with a plain <a> as well (scripts/extract.ts, the `/media/` case). */
function isFileLink(href: string): boolean {
  return href.startsWith('/media/') || href.startsWith('/uploads/') || href.startsWith('mailto:') || href.startsWith('tel:')
}

function renderRuns(runs: TextRun[]) {
  return runs.map((run, index) => {
    let node: ReactNode = withBreaks(run.text)
    if (run.color) node = <span style={{ color: run.color }}>{node}</span>
    if (run.underline) node = <u>{node}</u>
    if (run.italic) node = <em>{node}</em>
    if (run.bold) node = <strong>{node}</strong>
    if (run.href && isSafeHref(run.href)) {
      node = isFileLink(run.href) ? (
        // A PDF or picture under public/ - a real file, not a route.
        <a href={run.href}>{node}</a>
      ) : run.href.startsWith('/') ? (
        <Link to={run.href}>{node}</Link>
      ) : (
        <a href={run.href} target="_blank" rel="noreferrer">
          {node}
        </a>
      )
    }
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
    const Heading = `h${block.level ?? 2}` as 'h1' | 'h2' | 'h3' | 'h4'
    return (
      <Heading key={block.id} style={style}>
        {renderRuns(block.runs)}
      </Heading>
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
