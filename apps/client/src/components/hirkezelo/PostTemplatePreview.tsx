import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { RichTextDocument } from '../../../../../shared/pnw/types.ts'
import { isBlank } from '../../../../../shared/pnw/richtext.ts'
import { termMap, useTerms } from '../../lib/terms.ts'
import { formatPostDate } from '../../lib/postDate.ts'
import { useBodyClass } from '../../lib/useBodyClass.ts'
import RichText from './RichText.tsx'
import Sidebar from '../Sidebar.tsx'

/**
 * The real theme puts the two-column float layout and the post title/meta
 * sizing behind body classes (`et_right_sidebar`, `single`) - see
 * src/styles/sidebar-layout.css. A real post route gets these from
 * useBodyClass on mount; this preview needs the same two while it's open, or
 * the frame renders as an unstyled single column.
 */
const PREVIEW_BODY_CLASSES = ['single', 'et_right_sidebar']

type Props = {
  title: string
  content: RichTextDocument
  categoryIds: string[]
  image?: string
  date?: string
}

/**
 * Renders a draft exactly the way the real site's single-post template would
 * - the same #left-area/#sidebar frame (sidebar-layout.css) and the same
 * .et_post_meta_wrapper/.entry-content/.et_pb_text markup a real post uses
 * (see src/pages/KutatokEjszakaja.tsx, the one sample post bound to this
 * frame), rather than an invented preview card. Requested explicitly: the
 * bound sample post is "the template" for how a news post should preview.
 */
export default function PostTemplatePreview({ title, content, categoryIds, image, date }: Props) {
  useBodyClass(PREVIEW_BODY_CLASSES)

  // Only a category seeded from the mirror has an archive page to link to
  // (Term.route); one created inside the Hírkezelő has none, so it prints as
  // plain text rather than as a link into a 404 (AGENT.md 6.16).
  const terms = useTerms()
  const byId = termMap(terms)
  const postCategories = categoryIds
    .map((id) => byId.get(id))
    .filter((term): term is NonNullable<typeof term> => !!term)

  return (
    <div id="main-content">
      <div className="container">
        <div id="content-area" className="clearfix">
          <div id="left-area">
            <article className="et_pb_post hentry">
              <div className="et_post_meta_wrapper">
                <h1 className="entry-title">{title || 'Hír címe'}</h1>
                <p className="post-meta">
                  <span className="published">{formatPostDate(date ?? new Date().toISOString())}</span>
                  {postCategories.length > 0 && ' | '}
                  {postCategories.map((category, at) => (
                    <Fragment key={category.id}>
                      {at > 0 && ', '}
                      {category.route ? (
                        <Link to={category.route} rel="category tag">
                          {category.name}
                        </Link>
                      ) : (
                        <span className="pnw-unlinked-category">{category.name}</span>
                      )}
                    </Fragment>
                  ))}
                </p>
              </div>
              <div className="entry-content">
                {image && <img src={image} alt="" />}
                <div className="et_pb_text">
                  {isBlank(content) ? <p>Még nincs tartalom.</p> : <RichText document={content} />}
                </div>
              </div>
            </article>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  )
}
