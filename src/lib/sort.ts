import type { SortKey } from '../types'

/** "Řadit" dropdown. Each option explains its criterion (GoOut doesn't). */
export const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string; description: string }> = [
  { key: 'upcoming', label: 'Blížící se', description: 'Od nejbližšího termínu' },
  { key: 'popular', label: 'Populární', description: 'Podle počtu zájemců' },
  { key: 'new', label: 'Novinky', description: 'Naposledy přidané' },
]

export function sortLabel(sort: SortKey): string {
  return SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Blížící se'
}

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((o) => o.key === value)
}
