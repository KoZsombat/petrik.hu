import { Link } from 'react-router-dom'
import type { DocEntry } from '../../data/docs.ts'
import { docs } from '../../data/docs.ts'
import { ArrowLeft, ArrowRight } from './DocsIcons.tsx'

type Props = { doc: DocEntry }

/**
 * The previous/next document links under a doc.
 *
 * BetterDocs wrapped around inside the category, so a document that is alone in
 * its own category links to itself in both directions - the mirror does exactly
 * that, and it is reproduced rather than tidied away.
 *
 * The whitespace around the arrows is deliberate: the original put a space
 * between the icon and the label, and the layout depends on it.
 */
export default function DocsNav({ doc }: Props) {
  const prev = docs[doc.prev]
  const next = docs[doc.next]

  return (
    <div className="docs-navigation">
      {prev && (
        <Link to={`/docs/${prev.slug}/`} rel="prev">
          <ArrowLeft /> {prev.title}
        </Link>
      )}
      {next && (
        <Link to={`/docs/${next.slug}/`} rel="next">
          {next.title} <ArrowRight />
        </Link>
      )}
    </div>
  )
}
