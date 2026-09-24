import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { RichTextDocument } from '../../../shared/pnw/types.ts'
import { isBlank } from '../../../shared/pnw/richtext.ts'
import { categories } from '../../../shared/pnw/categories.ts'
import { useBodyClass } from '../../lib/useBodyClass.ts'
import RichText from './RichText.tsx'
import Sidebar from '../Sidebar.tsx'

const CATEGORY_NAME = new Map(categories.map((category) => [category.id, category.name]))

/**
 * The real theme puts the two-column float layout and the post title/meta
 * sizing behind body classes (`et_right_sidebar`, `single`) - see
 * src/styles/sidebar-layout.css. A real post route gets these from
 * useBodyClass on mount; this preview needs the same two while it's open, or
 * the frame renders as an unstyled single column.
 */
const PREVIEW_BODY_CLASSES = ['single', 'et_right_sidebar']

function formatPostDate(iso: string): string {
  // Matches the mirror's own "2026. szept 15." style (Intl gives an extra
  // period after the month abbreviation that the theme's own dates don't have).
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })
    .format(new Date(iso))
    .replace(/\.(\s+\d)/, '$1')
}

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

  const categoryLinks = categoryIds
    .map((id) => ({ id, name: CATEGORY_NAME.get(id) }))
    .filter((category): category is { id: string; name: string } => !!category.name)

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
                  {categoryLinks.length > 0 && ' | '}
                  {categoryLinks.map((category, at) => (
                    <Fragment key={category.id}>
                      {at > 0 && ', '}
                      <Link to={category.id} rel="category tag">
                        {category.name}
                      </Link>
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
