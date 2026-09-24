import { STATUS } from './types.ts'
import type { Post, SessionUser } from './types.ts'
import { canReview, canSubmit } from './roles.ts'

/** Ported from PNW_Access::can_edit_workflow_post(). */
export function canEditWorkflowPost(post: Post, user: SessionUser): boolean {
  if (canReview(user.role)) return true

  return (
    canSubmit(user.role) &&
    post.authorId === user.id &&
    (post.status === STATUS.DRAFT || post.status === STATUS.REVISION)
  )
}

/** Ported from PNW_Access::can_view_workflow_post(). */
export function canViewWorkflowPost(post: Post, user: SessionUser): boolean {
  if (canReview(user.role)) return true
  return canSubmit(user.role) && post.authorId === user.id
}

/** Ported from PNW_Access::allowed_category_ids(). */
export function allowedCategoryIds(user: SessionUser, allCategoryIds: string[]): string[] {
  if (user.allowedCategoryIds && user.allowedCategoryIds.length > 0) {
    const allowed = new Set(user.allowedCategoryIds)
    return allCategoryIds.filter((id) => allowed.has(id))
  }
  return allCategoryIds
}
