import type { CategoryId } from '../types'

export interface CategoryOption {
  id: CategoryId
  label: string
  /** Decorative, like GoOut's object photos. Hidden from assistive tech. */
  icon: string
}

/** Same order and labels as GoOut's category navigation. */
export const CATEGORIES: ReadonlyArray<CategoryOption> = [
  { id: 'concerts', label: 'Koncerty', icon: '🎤' },
  { id: 'theatre', label: 'Divadlo', icon: '🎭' },
  { id: 'exhibitions', label: 'Výstavy', icon: '🖼️' },
  { id: 'festivals', label: 'Festivaly', icon: '✌️' },
  { id: 'parties', label: 'Parties', icon: '🪩' },
  { id: 'film', label: 'Filmy', icon: '🍿' },
  { id: 'gastro', label: 'Gastro', icon: '🍩' },
  { id: 'kids', label: 'Pro děti', icon: '🧸' },
  { id: 'sport', label: 'Sport', icon: '👟' },
  { id: 'other', label: 'Jiné akce', icon: '✨' },
]

/** The "no category selected" option shown first in the panel. */
export const ALL_CATEGORIES = { label: 'Všechny akce', icon: '🎟️' } as const

export const CATEGORY_IDS: ReadonlyArray<CategoryId> = CATEGORIES.map((c) => c.id)

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
