import { Link } from 'react-router-dom'
import type { Archive } from '../data/archives.ts'

type Props = { archive: Archive }

/**
 * The "older / newer posts" controls under an archive.
 *
 * The theme emits both halves on every archive, even when neither has a link,
 * and the empty divs still take part in the layout - so they are rendered here
 * unconditionally too.
 *
 * Some of the targets were never captured: the crawl stopped part-way through
 * several listings, so eleven of these links point at a page that does not
 * exist in the snapshot. Those render as plain text, on the same principle as
 * the unavailable post cards - better a control that plainly does nothing than
 * a link into a 404.
 */
export default function ArchivePagination({ archive }: Props) {
  const older = '« Régebbi bejegyzések'
  const newer = 'Újabb bejegyzések »'

  return (
    <div className="pagination clearfix">
      <div className="alignleft">
        {archive.older &&
          (archive.olderMissing ? (
            <span className="pagination-unavailable" title="Ez az oldal nem érhető el a mentésben.">
              {older}
            </span>
          ) : (
            <Link to={archive.older}>{older}</Link>
          ))}
      </div>
      <div className="alignright">
        {archive.newer &&
          (archive.newerMissing ? (
            <span className="pagination-unavailable" title="Ez az oldal nem érhető el a mentésben.">
              {newer}
            </span>
          ) : (
            <Link to={archive.newer}>{newer}</Link>
          ))}
      </div>
    </div>
  )
}
