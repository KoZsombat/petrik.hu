/**
 * Shared between the Vite frontend (src/) and the Express backend (server/) -
 * see AGENT.md 6.15. Both run modern TS-stripping tooling, so this is plain
 * `.ts` with no build step, imported by relative path from either side.
 */

export type Align = 'left' | 'center' | 'right'

export type TextRun = {
  text: string
  bold?: boolean
  italic?: boolean
}

/**
 * The plugin's real editor is WordPress TinyMCE - full HTML. This repo never
 * renders raw HTML (no dangerouslySetInnerHTML, see AGENT.md), so the content
 * is this small structured model instead: one block per paragraph/heading/
 * list-item/quote, each holding styled runs. It renders through real JSX
 * everywhere (editor, preview modal, review screen, published view).
 */
export type BlockType = 'paragraph' | 'heading' | 'bulleted-list' | 'numbered-list' | 'blockquote'

export type RichTextBlock = {
  id: string
  type: BlockType
  align?: Align
  runs: TextRun[]
}

export type RichTextDocument = RichTextBlock[]

export const STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  REVISION: 'pnw_revision',
  TEST_APPROVED: 'pnw_test_ok',
  ARCHIVED: 'pnw_archived',
  PUBLISH: 'publish',
  FUTURE: 'future',
  TRASH: 'trash',
} as const

export type PostStatus = (typeof STATUS)[keyof typeof STATUS]

export const ROLE = {
  MK_LEADER: 'petrik_mk_leader',
  DEPUTY: 'petrik_deputy_director',
  DIRECTOR: 'petrik_director',
} as const

export type Role = (typeof ROLE)[keyof typeof ROLE]

export type Capability =
  | 'pnw_submit_news'
  | 'pnw_review_news'
  | 'pnw_view_audit_log'
  | 'pnw_manage_workflow'
  | 'pnw_manage_published_news'
  /**
   * Not in the real plugin - WordPress user management (wp-admin) is where
   * that plugin assigns its roles, and this repo doesn't have a wp-admin
   * equivalent. Added by user request so accounts can be managed from
   * inside the Hírkezelő itself. See AGENT.md 6.15.
   */
  | 'pnw_manage_users'

export type SessionUser = {
  id: string
  displayName: string
  role: Role
  /** Empty/undefined means every category is allowed - matches PNW_Access::allowed_category_ids(). */
  allowedCategoryIds?: string[]
}

/** A user account as the account-management screen (Users.tsx) sees it - never a password/hash. */
export type Account = {
  id: string
  username: string
  displayName: string
  role: Role
  allowedCategoryIds?: string[]
}

export type Post = {
  id: string
  /** Stable from creation, even if the title is edited later - the public /hirek/:slug/ URL. */
  slug: string
  title: string
  content: RichTextDocument
  excerpt: string
  categoryIds: string[]
  /** Public URL path under /uploads/, or undefined. */
  featuredImage?: string
  authorId: string
  status: PostStatus
  reviewNote?: string
  lastReviewerId?: string
  lastReviewedAt?: string
  scheduledFor?: string
  scheduledById?: string
  archivedAt?: string
  archivedById?: string
  createdAt: string
  modifiedAt: string
  /** The post's own "date" - display date for publish/future, same as WordPress post_date. */
  date: string
}

export type AuditAction =
  | 'created_draft'
  | 'updated_draft'
  | 'submitted'
  | 'reviewer_edited'
  | 'rejected'
  | 'approved'
  | 'scheduled'
  | 'scheduled_published'
  | 'trashed'
  | 'published_updated'
  | 'published_archived'
  | 'archived_restored'

export type AuditEntry = {
  id: string
  postId: string
  userId: string | null
  action: AuditAction
  fromStatus: string
  toStatus: string
  note?: string
  createdAt: string
}

export type LoginErrorCode = 'empty_fields' | 'invalid_credentials' | 'no_access'

export type NoticeCode =
  | 'draft_saved'
  | 'submitted'
  | 'review_saved'
  | 'approved'
  | 'scheduled'
  | 'schedule_invalid'
  | 'rejected'
  | 'trashed'
  | 'published_updated'
  | 'published_archived'
  | 'archived_restored'
  | 'published_trashed'
  | 'production_only'
  | 'missing_fields'
  | 'category_required'
  | 'rejection_note_required'
  | 'save_error'
