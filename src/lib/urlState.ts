import type { CategoryId, DatePreset, FilterState } from '../types'
import { CATEGORY_IDS } from '../data/categories'
import { DATE_OPTIONS } from '../data/filterOptions'
import { DEFAULT_FILTERS } from './filterEvents'
import { priceOptionByKey } from './priceFilter'

/**
 * `?cat=concerts,parties&price=500&date=weekend` (`price` = max CZK: 0, 200, 500 or 1000)
 * Unknown or malformed values are dropped silently and fall back to defaults.
 */
export function parseFilters(search: string): FilterState {
  const params = new URLSearchParams(search)

  const categories = (params.get('cat') ?? '')
    .split(',')
    .filter((c, i, all): c is CategoryId =>
      (CATEGORY_IDS as readonly string[]).includes(c) && all.indexOf(c) === i,
    )
  // Keep a canonical order so equal states serialise identically.
  categories.sort((a, b) => CATEGORY_IDS.indexOf(a) - CATEGORY_IDS.indexOf(b))

  const priceParam = params.get('price')
  // Only offered caps are accepted; "any" is the default and never in the URL.
  const priceOption = priceParam === 'any' ? undefined : priceOptionByKey(priceParam)
  const price = priceOption?.filter ?? DEFAULT_FILTERS.price

  const dateParam = params.get('date')
  const date: DatePreset =
    DATE_OPTIONS.find((o) => o.key === dateParam)?.key ?? DEFAULT_FILTERS.date

  return { categories, price, date }
}

export function serializeFilters(filters: FilterState): string {
  const params = new URLSearchParams()
  if (filters.categories.length > 0) params.set('cat', filters.categories.join(','))
  if (filters.price.kind !== 'any') params.set('price', String(filters.price.czk))
  if (filters.date !== 'any') params.set('date', filters.date)
  // Keep commas readable in the address bar.
  const query = params.toString().replaceAll('%2C', ',')
  return query ? `?${query}` : ''
}
