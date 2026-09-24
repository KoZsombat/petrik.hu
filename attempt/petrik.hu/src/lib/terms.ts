import { useEffect, useSyncExternalStore } from 'react'
import type { Term, TermKind } from '../../shared/pnw/types.ts'
import { SEED_CATEGORIES } from '../../shared/pnw/seed-terms.ts'

/**
 * The live category/tag list (AGENT.md 6.16). Terms used to be a fixed,
 * build-time list (shared/pnw/categories.ts); now they are rows the server
 * owns, so every screen that shows a category or tag name - inside the
 * Hírkezelő *and* on the public site, where a published post prints its
 * categories - reads them through here.
 *
 * One fetch per page load, cached at module scope like useUsers.ts, but with
 * a subscriber set on top: creating a term in the editor has to reach every
 * mounted list at once. Until the fetch lands (and forever, if no backend is
 * running at all) the seeded categories are the snapshot, so the static site
 * still renders real category names on its own.
 */
let snapshot: Term[] = SEED_CATEGORIES
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function publish(next: Term[]): void {
  snapshot = next
  for (const listener of listeners) listener()
}

function load(): Promise<void> {
  inflight ??= fetch('/api/terms')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error('terms_unavailable'))))
    .then((data: { terms?: Term[] }) => {
      if (data.terms) publish(data.terms)
    })
    .catch(() => {
      /* no backend running - the seeded categories are still the right names */
    })
  return inflight
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): Term[] {
  return snapshot
}

/** Every category and tag, newest server state first-come. */
export function useTerms(): Term[] {
  const terms = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    load()
  }, [])

  return terms
}

/** Folds a freshly created term (api.createTerm) into the shared snapshot. */
export function rememberTerm(term: Term): void {
  if (snapshot.some((existing) => existing.id === term.id)) return
  publish([...snapshot, term])
}

export function termsOfKind(terms: Term[], kind: TermKind): Term[] {
  return terms.filter((term) => term.kind === kind).sort((a, b) => a.name.localeCompare(b.name, 'hu'))
}

export function termMap(terms: Term[]): Map<string, Term> {
  return new Map(terms.map((term) => [term.id, term]))
}

/** Display names for a post's category/tag ids, in the post's own order. */
export function termNames(terms: Term[], ids: string[]): string[] {
  const byId = termMap(terms)
  return ids.map((id) => byId.get(id)?.name ?? id)
}
