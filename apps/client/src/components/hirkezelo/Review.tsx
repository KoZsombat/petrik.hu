import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { ApiUser } from '../../lib/hirkezelo/api.ts'
import { STATUS } from '../../../../../shared/pnw/types.ts'
import type { AuditEntry, Post, RichTextDocument } from '../../../../../shared/pnw/types.ts'
import { canManageTerms, canReview, canSubmit } from '../../../../../shared/pnw/permissions.ts'
import { canEditWorkflowPost } from '../../../../../shared/pnw/access.ts'
import { statusLabel } from '../../../../../shared/pnw/statuses.ts'
import { useUsers } from '../../lib/hirkezelo/useUsers.ts'
import PostFields from './PostFields.tsx'
import PreviewModal from './PreviewModal.tsx'
import ReadOnlyDetails from './ReadOnlyDetails.tsx'
import AuditTimeline from './AuditTimeline.tsx'

/** Ported from PNW_Frontend_Editor_Trait::render_review(). */
export default function Review({ user, postId }: { user: ApiUser; postId: string }) {
  const navigate = useNavigate()
  const authors = useUsers()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [audit, setAudit] = useState<AuditEntry[]>([])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState<RichTextDocument>([])
  const [excerpt, setExcerpt] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // `key={postId}` on this component (Hirkezelo.tsx) remounts it whenever
    // postId changes, so `loading` is already true from its initial state -
    // no need to set it again here.
    let cancelled = false
    Promise.all([api.getPost(postId), api.getPostAudit(postId)]).then(([postResult, auditResult]) => {
      if (cancelled) return
      setPost(postResult.post)
      setTitle(postResult.post.title)
      setContent(postResult.post.content)
      setExcerpt(postResult.post.excerpt)
      setCategoryIds(postResult.post.categoryIds)
      setTagIds(postResult.post.tagIds)
      setAudit(auditResult.entries)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [postId])

  if (loading || !post) {
    return (
      <section className="pnw-section">
        <div className="pnw-empty-inline">Betöltés…</div>
      </section>
    )
  }

  const author = authors.get(post.authorId)

  if (!canReview(user)) {
    // The author checking their own submitted/decided post.
    return (
      <section className="pnw-section">
        <div className="pnw-section-heading">
          <div>
            <div className="pnw-kicker">Részletek</div>
            <h3>{post.title}</h3>
          </div>
          {post.status === STATUS.REVISION && canSubmit(user) && canEditWorkflowPost(post, user) && (
            <Link className="pnw-button" to={`/hirkezelo/?pnw_view=edit&post_id=${post.id}`}>
              Hír módosítása
            </Link>
          )}
        </div>
        <ReadOnlyDetails post={post} />
      </section>
    )
  }

  if (post.status !== STATUS.PENDING) {
    return (
      <section className="pnw-section">
        <div className="pnw-section-heading">
          <div>
            <div className="pnw-kicker">Vezetői ellenőrzés</div>
            <h3>{post.title}</h3>
            <p>Beküldő: {author?.displayName ?? '—'}</p>
          </div>
        </div>
        <div className="pnw-notice pnw-notice-warning">
          Ez a hír már nem vár jóváhagyásra. Aktuális állapot: {statusLabel(post.status)}.
        </div>
        <ReadOnlyDetails post={post} />
        <div className="pnw-audit-block">
          <h4>Előzmények</h4>
          <AuditTimeline entries={audit} authors={authors} compact />
        </div>
      </section>
    )
  }

  async function saveReviewerEdits(): Promise<void> {
    setBusy(true)
    try {
      const result = await api.reviewerSave(postId, { title, content, excerpt, categoryIds, tagIds })
      navigate(`/hirkezelo/?pnw_notice=${result.notice}&pnw_view=review&post_id=${postId}`)
    } finally {
      setBusy(false)
    }
  }

  async function approve(): Promise<void> {
    setBusy(true)
    try {
      const result = await api.decide(postId, { decision: 'approve', note: reviewNote })
      navigate(`/hirkezelo/?pnw_notice=${result.notice}`)
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'save_error'
      navigate(`/hirkezelo/?pnw_notice=${code}&pnw_view=review&post_id=${postId}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  async function reject(): Promise<void> {
    if (!rejectNote.trim()) {
      navigate(`/hirkezelo/?pnw_notice=rejection_note_required&pnw_view=review&post_id=${postId}`, { replace: true })
      return
    }
    setBusy(true)
    try {
      const result = await api.decide(postId, { decision: 'reject', note: rejectNote })
      navigate(`/hirkezelo/?pnw_notice=${result.notice}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Vezetői ellenőrzés</div>
          <h3>{post.title}</h3>
          <p>Beküldő: {author?.displayName ?? '—'}</p>
        </div>
      </div>

      <div className="pnw-form">
        <PostFields
          editorId="pnw-reviewer-editor"
          title={title}
          onTitleChange={setTitle}
          content={content}
          onContentChange={setContent}
          excerpt={excerpt}
          onExcerptChange={setExcerpt}
          categoryIds={categoryIds}
          onCategoryIdsChange={setCategoryIds}
          tagIds={tagIds}
          onTagIdsChange={setTagIds}
          canCreateTerms={canManageTerms(user)}
          currentImage={post.featuredImage}
          onImageChange={() => {
            /* the reviewer edits text/categories only, the plugin's own reviewer_save has no image field */
          }}
        />
        <div className="pnw-form-actions pnw-form-actions-spread">
          <button type="button" className="pnw-button pnw-button-preview" onClick={() => setPreviewOpen(true)}>
            Előnézet
          </button>
          <div className="pnw-form-actions-main">
            <button
              type="button"
              className="pnw-button pnw-button-secondary"
              disabled={busy}
              onClick={saveReviewerEdits}
            >
              Vezetői módosítások mentése
            </button>
          </div>
        </div>
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        content={content}
        categoryIds={categoryIds}
        tagIds={tagIds}
        image={post.featuredImage}
      />

      <div className="pnw-decision-grid">
        <div className="pnw-decision pnw-decision-approve">
          <h4>Jóváhagyás</h4>
          <p>A hír azonnal megjelenik a weboldalon.</p>
          <textarea
            rows={3}
            placeholder="Opcionális belső megjegyzés"
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
          />
          <button type="button" className="pnw-button pnw-button-success" disabled={busy} onClick={approve}>
            ✓ Jóváhagyás és publikálás
          </button>
        </div>
        <div className="pnw-decision pnw-decision-reject">
          <h4>Visszaküldés javításra</h4>
          <p>A megjegyzést az MK-vezető itt a felületen látja.</p>
          <textarea
            rows={4}
            required
            placeholder="Mit kell javítani?"
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
          />
          <button type="button" className="pnw-button pnw-button-danger" disabled={busy} onClick={reject}>
            ↩ Visszaküldés
          </button>
        </div>
      </div>

      <div className="pnw-audit-block">
        <h4>Előzmények</h4>
        <AuditTimeline entries={audit} authors={authors} compact />
      </div>
    </section>
  )
}
