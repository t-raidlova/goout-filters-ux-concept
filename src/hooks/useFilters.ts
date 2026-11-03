import { useCallback, useState } from 'react'
import type { CategoryId, FilterState, PriceFilter } from '../types'
import { DEFAULT_FILTERS } from '../lib/filterEvents'
import { removeCategory, toggleCategory } from '../lib/categorySelection'

/**
 * Single source of truth for filter state. Categories and price are wired up;
 * date stays at its default until that step is built.
 */
export function useFilters(initial: FilterState = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<FilterState>(initial)

  const onToggleCategory = useCallback((id: CategoryId) => {
    setFilters((f) => ({ ...f, categories: toggleCategory(f.categories, id) }))
  }, [])

  const onRemoveCategory = useCallback((id: CategoryId) => {
    setFilters((f) => ({ ...f, categories: removeCategory(f.categories, id) }))
  }, [])

  const onClearCategories = useCallback(() => {
    setFilters((f) => ({ ...f, categories: [] }))
  }, [])

  const onSetPrice = useCallback((price: PriceFilter) => {
    setFilters((f) => ({ ...f, price }))
  }, [])

  const onClearPrice = useCallback(() => {
    setFilters((f) => ({ ...f, price: DEFAULT_FILTERS.price }))
  }, [])

  const onClearAll = useCallback(() => {
    setFilters((f) => ({ ...f, categories: [], price: DEFAULT_FILTERS.price }))
  }, [])

  return {
    filters,
    onToggleCategory,
    onRemoveCategory,
    onClearCategories,
    onSetPrice,
    onClearPrice,
    onClearAll,
  }
}
