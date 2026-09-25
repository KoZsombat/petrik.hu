/**
 * Shared between the Vite frontend (src/) and the Express backend (server/) -
 * see AGENT.md 6.15. Both run modern TS-stripping tooling, so this is plain
 * `.ts` with no build step, imported by relative path from either side.
 */

export type Align = 'left' | 'center' | 'right'

/**
 * One styled stretch of text. `bold`/`italic` are all the Hírkezelő's editor
 * writes; `color`, `href` and `underline` exist for the Szerkesztő (AGENT.md
 * 6.19), whose content comes from the mirror's own markup - coloured spans,
 * links, underlines. A `\n` inside `text` renders as a line break.
 */
export type TextRun = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  /** A CSS colour, e.g. `#72c3b6`. Validated server-side (server/lib/validation.ts). */
  color?: string
  /** A root-relative in-app route (`/nyolcadikos/`) or an absolute http(s)/mailto/tel URL. */
  href?: string
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
  align?: Align | 'justify'
  /** Only read when `type === 'heading'`; a heading without it is an <h2>, as it always was. */
  level?: 1 | 2 | 3 | 4
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

/**
 * Accounts carry a plain set of these and nothing else - there are **no
 * roles** anywhere in this re-implementation (user decision, see AGENT.md
 * 6.16). The real plugin bundles the same `pnw_*` capabilities into three
 * WordPress roles; here every account is given its permissions one by one on
 * the Fiókok screen, so any mix is possible.
 */
export const CAPABILITY = {
  /** Write your own news: draft, edit your own draft/revision, submit for review. */
  SUBMIT_NEWS: 'pnw_submit_news',
  /** Review the queue: edit a pending post, approve, schedule, send back. */
  REVIEW_NEWS: 'pnw_review_news',
  /** Edit, archive and restore already-published news. */
  MANAGE_PUBLISHED: 'pnw_manage_published_news',
  /** See the statistics screen and the full audit log. */
  VIEW_AUDIT_LOG: 'pnw_view_audit_log',
  /** Create/edit/delete Hírkezelő accounts (no equivalent in the real plugin). */
  MANAGE_USERS: 'pnw_manage_users',
  /**
   * Create new categories and tags from inside the editor. Using existing
   * ones needs no permission at all - every account may pick any category
   * or tag (see AGENT.md 6.16).
   */
  MANAGE_TERMS: 'pnw_manage_terms',
  /**
   * The Szerkesztő (/szerkeszto/): edit the content of the mirrored pages,
   * create/delete new pages and edit the main menu (AGENT.md 6.19). No
   * equivalent in the real plugin.
   */
  MANAGE_PAGES: 'pnw_manage_pages',
} as const

export type Capability = (typeof CAPABILITY)[keyof typeof CAPABILITY]

export type SessionUser = {
  id: string
  displayName: string
  permissions: Capability[]
}

/** A user account as the account-management screen (Users.tsx) sees it - never a password/hash. */
export type Account = {
  id: string
  username: string
  displayName: string
  permissions: Capability[]
}

export type TermKind = 'category' | 'tag'

/**
 * A category or a tag. Both live in the same `terms` table (server/data/
 * terms-repo.ts) and both can be created from the editor by anyone holding
 * `pnw_manage_terms`.
 */
export type Term = {
  id: string
  kind: TermKind
  name: string
  /**
   * The mirrored category archive this term is the same thing as
   * ("/kategoria/hirek/"), for the seeded categories only - it is what makes
   * a post's category a real link in the single-post template. Terms created
   * inside the Hírkezelő have no mirrored archive page, so no route.
   */
  route?: string
}

export type Post = {
  id: string
  /** Stable from creation, even if the title is edited later - the public /hirek/:slug/ URL. */
  slug: string
  title: string
  content: RichTextDocument
  excerpt: string
  categoryIds: string[]
  tagIds: string[]
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
