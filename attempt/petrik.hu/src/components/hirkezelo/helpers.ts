import { categories } from '../../../shared/pnw/categories.ts'

export function categoryNames(ids: string[]): string {
  if (ids.length === 0) return 'Nincs kategória'
  const map = new Map(categories.map((category) => [category.id, category.name]))
  return ids.map((id) => map.get(id) ?? id).join(', ')
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
