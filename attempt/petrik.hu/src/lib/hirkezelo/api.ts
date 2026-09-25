/**
 * Thin fetch wrapper for the /hirkezelo/ backend (server/, see AGENT.md 6.15).
 * Every call goes through the Vite dev proxy (vite.config.ts) or, in
 * production, the same Express process that serves the built site - so a
 * relative /api/... path is always correct.
 */
import type { AuditEntry, Capability, Post, Term, TermKind } from '../../../shared/pnw/types.ts'
import type { BuilderPage, PageDocument, PageOverrides, PageStatus, SiteMenu } from '../../../shared/pnw/page-types.ts'
import { rememberTerm } from '../terms.ts'

export type ApiUser = {
  id: string
  /** Present on GET /users (the account-management listing), absent on the session's own user. */
  username?: string
  displayName: string
  /** The account's whole authority - there are no roles (AGENT.md 6.16). */
  permissions: Capability[]
}

export type AccountInput = {
  username: string
  displayName: string
  permissions: Capability[]
  /** Blank/omitted on an edit keeps the existing password. */
  password?: string
}

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: init?.body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  })

  const data: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const code = (data as { error?: string } | null)?.error ?? 'unknown_error'
    throw new ApiError(code, response.status)
  }
  return data as T
}

// --- auth --------------------------------------------------------------

export function login(loginValue: string, password: string): Promise<{ user: ApiUser }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ login: loginValue, password }) })
}

export function logout(): Promise<{ ok: true }> {
  return request('/auth/logout', { method: 'POST' })
}

export function me(): Promise<{ user: ApiUser }> {
  return request('/auth/me')
}

export function listUsers(): Promise<{ users: ApiUser[] }> {
  return request('/users')
}

export function createAccount(input: AccountInput): Promise<{ user: ApiUser }> {
  return request('/users', { method: 'POST', body: JSON.stringify(input) })
}

export function updateAccount(id: string, input: AccountInput): Promise<{ user: ApiUser }> {
  return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteAccount(id: string): Promise<{ ok: true }> {
  return request(`/users/${id}`, { method: 'DELETE' })
}

// --- categories and tags ---------------------------------------------------

/**
 * Creating a term needs `pnw_manage_terms`; using one needs nothing at all
 * (AGENT.md 6.16). The new term is folded straight into the shared snapshot
 * (src/lib/terms.ts) so every open checkbox list sees it without a refetch.
 */
export async function createTerm(kind: TermKind, name: string): Promise<Term> {
  const { term } = await request<{ term: Term }>('/terms', {
    method: 'POST',
    body: JSON.stringify({ kind, name }),
  })
  rememberTerm(term)
  return term
}

// --- dashboard -----------------------------------------------------------

export type AuthorDashboard = {
  view: 'author'
  counts: Record<string, number>
  posts: Post[]
}

export type ReviewerDashboard = {
  view: 'reviewer'
  pendingCount: number
  returnedCount: number
  scheduledCount: number
  publishedTodayCount: number
  ownWorking: Post[]
  pending: Post[]
  scheduled: Post[]
  recent: Post[]
}

export function dashboard(): Promise<AuthorDashboard | ReviewerDashboard> {
  return request('/posts/dashboard')
}

// --- single post -----------------------------------------------------------

export function getPost(id: string): Promise<{ post: Post }> {
  return request(`/posts/${id}`)
}

export function getPostAudit(id: string): Promise<{ entries: AuditEntry[] }> {
  return request(`/posts/${id}/audit`)
}

type SaveResponse = { post: Post; notice: string }

export function createPost(form: FormData): Promise<SaveResponse> {
  return request('/posts', { method: 'POST', body: form })
}

export function updatePost(id: string, form: FormData): Promise<SaveResponse> {
  return request(`/posts/${id}`, { method: 'PUT', body: form })
}

export function reviewerSave(
  id: string,
  data: { title: string; content: unknown; excerpt: string; categoryIds: string[]; tagIds: string[] },
): Promise<{ notice: string }> {
  return request(`/posts/${id}/reviewer`, { method: 'PUT', body: JSON.stringify(data) })
}

export function decide(
  id: string,
  data: { decision: 'approve' | 'reject'; note: string; publishMode?: 'now' | 'schedule'; publishAt?: string },
): Promise<{ notice: string }> {
  return request(`/posts/${id}/decision`, { method: 'POST', body: JSON.stringify(data) })
}

export function trashPost(id: string): Promise<{ notice: string }> {
  return request(`/posts/${id}`, { method: 'DELETE' })
}

export function updatePublished(id: string, form: FormData): Promise<SaveResponse> {
  return request(`/posts/${id}/published`, { method: 'PUT', body: form })
}

export function archivePost(id: string): Promise<{ notice: string }> {
  return request(`/posts/${id}/archive`, { method: 'POST' })
}

export function restorePost(id: string): Promise<{ notice: string }> {
  return request(`/posts/${id}/restore`, { method: 'POST' })
}

// --- published / archive lists --------------------------------------------

type ListResponse = { posts: Post[]; total: number; totalPages: number; testMode?: boolean }

export function listPublished(query: string, page: number): Promise<ListResponse> {
  return request(`/posts/published?q=${encodeURIComponent(query)}&page=${page}`)
}

export function listArchived(query: string, page: number): Promise<ListResponse> {
  return request(`/posts/archived?q=${encodeURIComponent(query)}&page=${page}`)
}

// --- audit / statistics -----------------------------------------------------

export function fullAuditLog(limit = 100): Promise<{ entries: AuditEntry[] }> {
  return request(`/audit?limit=${limit}`)
}

export type Statistics = {
  liveAll: number
  liveManaged: number
  scheduled: number
  pending: number
  archived: number
  monthPublished: number
  averageApprovalSeconds: number
  monthlyChart: { key: string; count: number }[]
  topAuthors: { key: string; count: number }[]
  topCategories: { key: string; count: number }[]
}

export function statistics(): Promise<Statistics> {
  return request('/statistics')
}

// --- the Szerkesztő (AGENT.md 6.19) -----------------------------------------

export type OverrideSummary = { route: string; modifiedAt: string; hidden: boolean }

export function listPages(): Promise<{ pages: BuilderPage[]; overrides: OverrideSummary[] }> {
  return request('/pages')
}

export type PageInput = {
  title: string
  description: string
  status: PageStatus
  document: PageDocument
}

export function createPage(input: PageInput): Promise<{ page: BuilderPage }> {
  return request('/pages', { method: 'POST', body: JSON.stringify(input) })
}

export function getPage(id: string): Promise<{ page: BuilderPage }> {
  return request(`/pages/${encodeURIComponent(id)}`)
}

export function updatePage(id: string, input: PageInput): Promise<{ page: BuilderPage }> {
  return request(`/pages/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deletePage(id: string): Promise<{ ok: true }> {
  return request(`/pages/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function getOverrides(route: string): Promise<{ overrides: PageOverrides | null; modifiedAt: string | null }> {
  return request(`/pages/overrides?route=${encodeURIComponent(route)}`)
}

export function saveOverrides(overrides: PageOverrides): Promise<{ overrides: PageOverrides; modifiedAt: string }> {
  return request(`/pages/overrides?route=${encodeURIComponent(overrides.route)}`, {
    method: 'PUT',
    body: JSON.stringify({ overrides }),
  })
}

export function clearOverrides(route: string): Promise<{ ok: true }> {
  return request(`/pages/overrides?route=${encodeURIComponent(route)}`, { method: 'DELETE' })
}

export function getMenu(): Promise<{ menu: SiteMenu | null; modifiedAt: string | null }> {
  return request('/pages/menu')
}

export function saveMenu(menu: SiteMenu): Promise<{ menu: SiteMenu }> {
  return request('/pages/menu', { method: 'PUT', body: JSON.stringify({ menu }) })
}

export function resetMenu(): Promise<{ ok: true }> {
  return request('/pages/menu', { method: 'DELETE' })
}

export type MediaItem = { url: string; name: string; size: number; modifiedAt: string }

export function listMedia(): Promise<{ items: MediaItem[] }> {
  return request('/pages/media')
}

export function uploadMedia(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  return request('/pages/media', { method: 'POST', body: form })
}
