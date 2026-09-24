import type { Post } from '../../../shared/pnw/types.ts'
import { statusCssClass, statusLabel } from '../../../shared/pnw/statuses.ts'
import PostTemplatePreview from './PostTemplatePreview.tsx'

/**
 * Ported from PNW_Frontend_Editor_Trait::render_readonly_details() - the
 * content itself renders through the same real single-post template as the
 * "Előnézet" modal (PostTemplatePreview, see AGENT.md 6.15), on request.
 * Only the status badge stays as workflow-specific chrome above it; the
 * category names are dropped from here since the template's own post-meta
 * line already shows them (as real category links, matching a real post).
 */
export default function ReadOnlyDetails({ post }: { post: Post }) {
  return (
    <>
      {post.reviewNote && (
        <div className="pnw-review-note">
          <strong>Vezetői megjegyzés</strong>
          <p>{post.reviewNote}</p>
        </div>
      )}
      <div className="pnw-readonly-meta">
        <span className={`pnw-badge pnw-badge-${statusCssClass(post.status)}`}>{statusLabel(post.status)}</span>
      </div>
      <div className="pnw-readonly-template">
        <PostTemplatePreview
          title={post.title}
          content={post.content}
          categoryIds={post.categoryIds}
          image={post.featuredImage}
          date={post.date}
        />
      </div>
    </>
  )
}
