import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { MergedPostSummary } from '../lib/posts/postsContext.ts'

type Props = { post: MergedPostSummary }

/**
 * One post in a category, date or author archive.
 *
 * This is the theme's own listing markup rather than Divi's blog module, and
 * the two differ in ways worth keeping: WordPress prints the author here, uses
 * a larger thumbnail, and words the excerpt slightly differently. Both readings
 * are stored, so the archive renders the archive's.
 *
 * The excerpt is a bare string child of <article> on purpose - the theme wraps
 * it in nothing at all, and giving it a <p> here would add a paragraph's margin
 * that the original never had.
 */
export default function ArchiveCard({ post }: Props) {
  // A mirrored post lives at `/<slug>/`; one published through /hirkezelo/
  // lives at `/hirek/<slug>/` and carries that in `href` - the same rule
  // PostCard and RecentPosts already follow (AGENT.md 6.15).
  const href = post.href ?? `/${post.slug}/`
  const image = post.archiveImage ?? post.image
  const excerpt = post.archiveExcerpt ?? post.excerpt

  return (
    <article
      id={post.id ? `post-${post.id}` : undefined}
      className={
        (post.articleClass ?? 'et_pb_post') + (post.available ? '' : ' post-unavailable')
      }
      // A blog module's card has a "bővebben" link, and an unavailable post
      // gets a note in its place. An archive card has no such link - the title
      // is simply not a link - so there is nothing to replace, and adding a
      // line of its own would push every one of the 252 unavailable cards
      // about 30px down the page. The state is said here instead, where it
      // costs no layout.
      title={post.available ? undefined : 'Ez a bejegyzés nem érhető el a mentésben.'}
    >
      {image &&
        (post.available ? (
          <Link className="entry-featured-image-url" to={href}>
            <img
              src={image.src}
              alt={image.alt}
              className=""
              srcSet={image.srcSet}
              sizes={image.sizes}
              width={image.width}
              height={image.height}
            />
          </Link>
        ) : (
          /*
           * An <a> with no href: not a link, not focusable, but still an <a>,
           * which keeps the theme's `.et_pb_post a img { vertical-align:
           * bottom }` matching. A <span> here puts the image back on the
           * baseline and adds about 7px under all 252 unavailable cards.
           */
          <a className="entry-featured-image-url">
            <img
              src={image.src}
              alt={image.alt}
              className=""
              srcSet={image.srcSet}
              sizes={image.sizes}
              width={image.width}
              height={image.height}
            />
          </a>
        ))}

      <h2 className="entry-title">
        {post.available ? <Link to={href}>{post.title}</Link> : post.title}
      </h2>

      {/* The leading space before "Szerző:" is the theme's, and the separators
          are " | " between the parts and ", " between the categories. */}
      <p className="post-meta">
        {post.author && (
          <>
            {' Szerző: '}
            <span className="author vcard">
              <Link to={post.author.to} title={`${post.author.name} bejegyzései`} rel="author">
                {post.author.name}
              </Link>
            </span>
            {' | '}
          </>
        )}
        {post.date && (
          <>
            <span className="published">{post.date}</span>
            {post.categories.length > 0 && ' | '}
          </>
        )}
        {post.categories.map((category, at) => (
          <Fragment key={category.to}>
            {at > 0 && ', '}
            <Link to={category.to} rel="category tag">
              {category.label}
            </Link>
          </Fragment>
        ))}
      </p>
      {/* The theme leaves whitespace between the excerpt and </article>, which
          is a real space where two cards meet. It renders as nothing, but it
          is there, so it is reproduced rather than trimmed away. */}
      {excerpt}{' '}
    </article>
  )
}
