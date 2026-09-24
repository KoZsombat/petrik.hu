/**
 * Thin fetch wrapper for the /hirkezelo/ backend (server/, see AGENT.md 6.15).
 * Every call goes through the Vite dev proxy (vite.config.ts) or, in
 * production, the same Express process that serves the built site - so a
 * relative /api/... path is always correct.
 */
import type { AuditEntry, Post, Role } from '../../../shared/pnw/types.ts'

export type ApiUser = {
  id: string
  /** Present on GET /users (the account-management listing), absent on the session's own user. */
  username?: string
  displayName: string
  role: Role
  allowedCategoryIds?: string[]
}

export type AccountInput = {
  username: string
  displayName: string
  role: Role
  /** Blank/omitted on an edit keeps the existing password. */
  password?: string
  allowedCategoryIds?: string[]
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

// --- dashboard -----------------------------------------------------------

export type AuthorDashboard = {
  role: 'author'
  counts: Record<string, number>
  posts: Post[]
}

export type ReviewerDashboard = {
  role: 'reviewer'
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
  data: { title: string; content: unknown; excerpt: string; categoryIds: string[] },
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
