import { Link } from 'react-router-dom'
import { docTags } from '../../data/docs.ts'

type Props = {
  /** Tag slugs this document carries; the footer lists them above the faces. */
  tags?: string[]
}

/**
 * The footer BetterDocs printed under every document: the document's tags,
 * then the "What are your Feelings" rating.
 *
 * It is a plugin analytics widget: the three faces posted a rating to a
 * WordPress REST endpoint. There is no endpoint here, so the faces do nothing -
 * they are anchors without an href, which is not a link and not focusable.
 *
 * It is rendered rather than dropped because it is 213px tall, and leaving it
 * out moved everything below it up the page on all 27 docs pages. A widget that
 * plainly does nothing is closer to the original than a hole where it stood.
 */
export default function DocsReactions({ tags }: Props) {
  const listed = (tags ?? [])
    .map((slug) => docTags.find((tag) => tag.slug === slug))
    .filter((tag) => tag !== undefined)

  return (
    <div className="betterdocs-entry-footer">
      {listed.length > 0 && (
        <div className="betterdocs-tags">
          {listed.map((tag) => (
            <Link key={tag.slug} to={`/dokumentum-cimke/${tag.slug}/`}>
              {tag.title}
            </Link>
          ))}
        </div>
      )}
      <div className="layout-1 betterdocs-shortcode betterdocs-article-reactions">
        <div className="betterdocs-article-reactions-heading">
          <h5 className="betterdocs-reactions-title-tag">What are your Feelings</h5>
        </div>
        <ul className="betterdocs-article-reaction-links layout-1">
          <li>
            <a className="betterdocs-feelings" data-feelings="happy" aria-hidden="true">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 20 20"
                xmlSpace="preserve"
              >
                <path
                  className="st0"
                  d="M10,0.1c-5.4,0-9.9,4.4-9.9,9.8c0,5.4,4.4,9.9,9.8,9.9c5.4,0,9.9-4.4,9.9-9.8C19.9,4.5,15.4,0.1,10,0.1z M13.3,6.4c0.8,0,1.5,0.7,1.5,1.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5C11.8,7.1,12.5,6.4,13.3,6.4z M6.7,6.4 c0.8,0,1.5,0.7,1.5,1.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5C5.2,7.1,5.9,6.4,6.7,6.4z M10,16.1c-2.6,0-4.9-1.6-5.8-4 l1.2-0.4c0.7,1.9,2.5,3.2,4.6,3.2s3.9-1.3,4.6-3.2l1.2,0.4C14.9,14.5,12.6,16.1,10,16.1z"
                />
                {/* The plugin's sprite carries a second copy far outside the
                    viewBox; it is invisible, and kept so the file matches. */}
                <path
                  className="st1"
                  d="M-6.6-119.7c-7.1,0-12.9,5.8-12.9,12.9s5.8,12.9,12.9,12.9s12.9-5.8,12.9-12.9S0.6-119.7-6.6-119.7z M-2.3-111.4c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2c-1.1,0-2-0.9-2-2C-4.3-110.5-3.4-111.4-2.3-111.4z M-10.9-111.4c1.1,0,2,0.9,2,2 c0,1.1-0.9,2-2,2c-1.1,0-2-0.9-2-2C-12.9-110.5-12-111.4-10.9-111.4z M-6.6-98.7c-3.4,0-6.4-2.1-7.6-5.3l1.6-0.6 c0.9,2.5,3.3,4.2,6,4.2s5.1-1.7,6-4.2L1-104C-0.1-100.8-3.2-98.7-6.6-98.7z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a className="betterdocs-feelings" data-feelings="normal" aria-hidden="true">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 20 20"
                xmlSpace="preserve"
              >
                <path
                  className="st0"
                  d="M10,0.2c-5.4,0-9.8,4.4-9.8,9.8s4.4,9.8,9.8,9.8s9.8-4.4,9.8-9.8S15.4,0.2,10,0.2z M6.7,6.5 c0.8,0,1.5,0.7,1.5,1.5c0,0.8-0.7,1.5-1.5,1.5C5.9,9.5,5.2,8.9,5.2,8C5.2,7.2,5.9,6.5,6.7,6.5z M14.2,14.3H5.9 c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6h8.3c0.3,0,0.6,0.3,0.6,0.6C14.8,14,14.5,14.3,14.2,14.3z M13.3,9.5 c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5C14.8,8.9,14.1,9.5,13.3,9.5z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a className="betterdocs-feelings" data-feelings="sad" aria-hidden="true">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 20 20"
                xmlSpace="preserve"
              >
                <circle className="st0" cx="27.5" cy="0.6" r="1.9" />
                <circle className="st0" cx="36" cy="0.6" r="1.9" />
                <path
                  className="st1"
                  d="M10,0.3c-5.4,0-9.8,4.4-9.8,9.8s4.4,9.8,9.8,9.8s9.8-4.4,9.8-9.8S15.4,0.3,10,0.3z M13.3,6.6 c0.8,0,1.5,0.7,1.5,1.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5C11.8,7.3,12.4,6.6,13.3,6.6z M6.7,6.6c0.8,0,1.5,0.7,1.5,1.5 c0,0.8-0.7,1.5-1.5,1.5C5.9,9.6,5.2,9,5.2,8.1C5.2,7.3,5.9,6.6,6.7,6.6z M14.1,15L14.1,15c-0.2,0-0.4-0.1-0.5-0.2 c-0.9-1-2.2-1.7-3.7-1.7s-2.8,0.6-3.7,1.7C6.2,14.9,6,15,5.9,15h0c-0.6,0-0.8-0.6-0.5-1.1c1.1-1.3,2.8-2.1,4.6-2.1 c1.8,0,3.5,0.8,4.6,2.1C15,14.3,14.7,15,14.1,15z"
                />
              </svg>
            </a>
          </li>
        </ul>
      </div>
      <div className="feedback-update-form" />
    </div>
  )
}
