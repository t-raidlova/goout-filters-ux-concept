import { useCallback, useState } from 'react'
import type { CategoryId, FilterState } from '../types'
import { DEFAULT_FILTERS } from '../lib/filterEvents'
import { removeCategory, toggleCategory } from '../lib/categorySelection'

/**
 * Single source of truth for filter state. Only categories are wired up so far;
 * price and date stay at their defaults until those steps are built.
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

  return { filters, onToggleCategory, onRemoveCategory, onClearCategories }
}
