import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LibraryDoc } from '../../../../../shared/pnw/page-types.ts'

type Props = {
  doc: LibraryDoc
  className?: string
  onClick?: () => void
  children: ReactNode
}

/** A link to a library document: its uploaded file in a new tab, or its mirrored /docs/ page. */
export default function DocLink({ doc, className, onClick, children }: Props) {
  if (doc.file) {
    return (
      <a href={doc.file} className={className} target="_blank" rel="noreferrer" onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={`/docs/${doc.slug}/`} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
