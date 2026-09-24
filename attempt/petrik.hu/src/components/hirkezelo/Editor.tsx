import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import type { ApiUser } from '../../lib/hirkezelo/api.ts'
import { STATUS } from '../../../shared/pnw/types.ts'
import type { Post, RichTextDocument } from '../../../shared/pnw/types.ts'
import { emptyDocument } from '../../../shared/pnw/richtext.ts'
import { allowedCategoryIds } from '../../../shared/pnw/access.ts'
import { categories } from '../../../shared/pnw/categories.ts'
import PostFields from './PostFields.tsx'
import PreviewModal from './PreviewModal.tsx'

type Props = { user: ApiUser; postId?: string; published?: boolean }

const ALL_CATEGORY_IDS = categories.map((category) => category.id)

/** Ported from PNW_Frontend_Editor_Trait::render_editor() / render_published_editor(). */
export default function Editor({ user, postId, published }: Props) {
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(!!postId)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<RichTextDocument>(emptyDocument())
  const [excerpt, setExcerpt] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [modalImageUrl, setModalImageUrl] = useState<string | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!postId) return
    let cancelled = false
    api
      .getPost(postId)
      .then(({ post }) => {
        if (cancelled) return
        setPost(post)
        setTitle(post.title)
        setContent(post.content)
        setExcerpt(post.excerpt)
        setCategoryIds(post.categoryIds)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  useEffect(() => {
    // Deriving a blob URL from `image` is the effect's whole job here (it
    // needs cleanup via revokeObjectURL), not a computation that belongs in
    // the render body.
    if (!image) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModalImageUrl(undefined)
      return
    }
    const url = URL.createObjectURL(image)
    setModalImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const isRevision = post?.status === STATUS.REVISION
  // The author-only category restriction only applies to their own
  // draft/pending submissions - editing an already-published post (like the
  // reviewer's own editor) sees every category, matching render_common_fields()'s
  // $all_categories=true for both those cases.
  const allowed = published ? undefined : allowedCategoryIds(user, ALL_CATEGORY_IDS)

  if (loading) {
    return (
      <section className="pnw-section">
        <div className="pnw-empty-inline">Betöltés…</div>
      </section>
    )
  }

  if (published && !post) {
    return (
      <section className="pnw-section">
        <div className="pnw-notice pnw-notice-error">Ez a publikált hír nem található.</div>
      </section>
    )
  }

  async function submit(command: 'draft' | 'submit'): Promise<void> {
    setBusy(true)
    try {
      const form = new FormData()
      form.set('title', title)
      form.set('content', JSON.stringify(content))
      form.set('excerpt', excerpt)
      form.set('categoryIds', JSON.stringify(categoryIds))
      form.set('command', command)
      if (image) form.set('featuredImage', image)

      const result = postId ? await api.updatePost(postId, form) : await api.createPost(form)
      const target = command === 'draft' ? `pnw_view=edit&post_id=${result.post.id}` : ''
      navigate(`/hirkezelo/?pnw_notice=${result.notice}${target ? `&${target}` : ''}`)
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'save_error'
      const target = postId ? `pnw_view=edit&post_id=${postId}` : 'pnw_view=new'
      navigate(`/hirkezelo/?pnw_notice=${code}&${target}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  async function saveChanges(): Promise<void> {
    if (!postId) return
    setBusy(true)
    try {
      const form = new FormData()
      form.set('title', title)
      form.set('content', JSON.stringify(content))
      form.set('excerpt', excerpt)
      form.set('categoryIds', JSON.stringify(categoryIds))
      if (image) form.set('featuredImage', image)

      const result = await api.updatePublished(postId, form)
      navigate(`/hirkezelo/?pnw_notice=${result.notice}&pnw_view=published_edit&post_id=${postId}`)
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'save_error'
      navigate(`/hirkezelo/?pnw_notice=${code}&pnw_view=published_edit&post_id=${postId}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  async function archive(): Promise<void> {
    if (!postId) return
    if (
      !window.confirm(
        'Biztosan archiválod ezt a jelenleg publikus hírt? Az oldalról azonnal eltűnik, de az Archívumból bármikor visszaállítható.',
      )
    ) {
      return
    }
    const result = await api.archivePost(postId)
    navigate(`/hirkezelo/?pnw_notice=${result.notice}&pnw_view=published`)
  }

  async function removeDraft(): Promise<void> {
    if (!postId) return
    if (!window.confirm('Biztosan a lomtárba helyezed ezt a piszkozatot?')) return
    const result = await api.trashPost(postId)
    navigate(`/hirkezelo/?pnw_notice=${result.notice}`)
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">
            {published ? 'Publikált hír' : isRevision ? 'Javítás' : post ? 'Szerkesztés' : 'Új tartalom'}
          </div>
          <h3>{post ? post.title || '(Névtelen hír)' : 'Új hír beküldése'}</h3>
        </div>
        {published && (
          <Link className="pnw-button pnw-button-secondary" to="/hirkezelo/?pnw_view=published">
            Mégse
          </Link>
        )}
      </div>

      {post?.reviewNote && (
        <div className="pnw-review-note">
          <strong>Vezetői megjegyzés</strong>
          <p>{post.reviewNote}</p>
        </div>
      )}
      {isRevision && (
        <div className="pnw-notice pnw-notice-warning pnw-inline-notice">
          Módosítsd a kért részeket, nézd meg az előnézetet, majd küldd vissza újra jóváhagyásra.
        </div>
      )}

      <div className="pnw-form">
        <PostFields
          editorId={published ? 'pnw-published-editor' : 'pnw-author-editor'}
          title={title}
          onTitleChange={setTitle}
          content={content}
          onContentChange={setContent}
          excerpt={excerpt}
          onExcerptChange={setExcerpt}
          categoryIds={categoryIds}
          onCategoryIdsChange={setCategoryIds}
          allowedCategoryIds={allowed}
          currentImage={post?.featuredImage}
          onImageChange={setImage}
        />

        <div className="pnw-form-actions pnw-form-actions-spread">
          <button type="button" className="pnw-button pnw-button-preview" onClick={() => setPreviewOpen(true)}>
            Előnézet
          </button>
          <div className="pnw-form-actions-main">
            {published ? (
              <button type="button" className="pnw-button" disabled={busy} onClick={saveChanges}>
                Módosítások mentése
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="pnw-button pnw-button-secondary"
                  disabled={busy}
                  onClick={() => submit('draft')}
                >
                  Piszkozat mentése
                </button>
                <button type="button" className="pnw-button" disabled={busy} onClick={() => submit('submit')}>
                  {isRevision ? 'Újraküldés jóváhagyásra' : 'Beküldés jóváhagyásra'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        content={content}
        categoryIds={categoryIds}
        image={modalImageUrl ?? post?.featuredImage}
      />

      {published ? (
        <div className="pnw-delete-form">
          <button type="button" className="pnw-button pnw-button-danger" onClick={archive}>
            Archiválás
          </button>
        </div>
      ) : (
        post && (
          <div className="pnw-delete-form">
            <button type="button" className="pnw-link-danger" onClick={removeDraft}>
              Piszkozat törlése
            </button>
          </div>
        )
      )}
    </section>
  )
}
