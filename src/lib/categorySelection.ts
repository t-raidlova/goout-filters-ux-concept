import type { CategoryId, CityId, CountryId } from '../types'
import { cityLocative } from './citySearch'
import { CATEGORY_IDS, categoryLabel } from '../data/categories'

/**
 * Pure helpers for the category selection. The selection is always kept in
 * canonical (navigation) order and without duplicates, so equal selections
 * compare and serialise identically whatever order the user clicked in.
 */

export function toggleCategory(selected: readonly CategoryId[], id: CategoryId): CategoryId[] {
  const next = new Set(selected)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return CATEGORY_IDS.filter((c) => next.has(c))
}

export function removeCategory(selected: readonly CategoryId[], id: CategoryId): CategoryId[] {
  return selected.filter((c) => c !== id)
}

/** Text for the sub-nav toggle: "Všechny kategorie", "Koncerty", "Koncerty +2". */
export function categorySummary(selected: readonly CategoryId[]): string {
  if (selected.length === 0) return 'Všechny kategorie'
  const first = categoryLabel(selected[0])
  return selected.length === 1 ? first : `${first} +${selected.length - 1}`
}

/**
 * Page heading, following GoOut's "Festivaly v Praze" pattern:
 * one category → "Koncerty v Brně", otherwise "Akce v Brně";
 * no city → "… v Česku" / "… na Slovensku".
 */
export function pageTitle(
  selected: readonly CategoryId[],
  city: CityId | null,
  country: CountryId,
): string {
  const what = selected.length === 1 ? categoryLabel(selected[0]) : 'Akce'
  return `${what} ${cityLocative(city, country)}`
}
