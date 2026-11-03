import { useCallback, useEffect, useState } from 'react'
import type {
  CategoryId,
  CityId,
  CountryId,
  DateFilter,
  FilterState,
  PriceFilter,
  SortKey,
} from '../types'
import { DEFAULT_FILTERS } from '../lib/filterEvents'
import { removeCategory, toggleCategory } from '../lib/categorySelection'
import { parseFilters, serializeFilters } from '../lib/urlState'

/**
 * Single source of truth for filter state: country, city, date, categories, price,
 * editors' picks and sort. Starts from the URL and keeps it in sync, so a link opens
 * the same view. `replaceState`, not `pushState`: filters apply instantly, and one
 * history entry per click would make Back unusable.
 */
export function useFilters(now: Date) {
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFilters(window.location.search, now),
  )

  useEffect(() => {
    const { pathname, search, hash } = window.location
    const query = serializeFilters(filters)
    if (query !== search) window.history.replaceState(null, '', `${pathname}${query}${hash}`)
  }, [filters])

  // Back/Forward to another URL of this page (e.g. a link with different filters).
  useEffect(() => {
    function onPopState() {
      setFilters(parseFilters(window.location.search, now))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [now])

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

  const onSetCity = useCallback((city: CityId | null) => {
    setFilters((f) => ({ ...f, city }))
  }, [])

  const onSetDate = useCallback((date: DateFilter) => {
    setFilters((f) => ({ ...f, date }))
  }, [])

  const onClearDate = useCallback(() => {
    setFilters((f) => ({ ...f, date: DEFAULT_FILTERS.date }))
  }, [])

  const onSetEditorsPick = useCallback((editorsPick: boolean) => {
    setFilters((f) => ({ ...f, editorsPick }))
  }, [])

  /** Sorting isn't a filter: "Zrušit vše" leaves it alone. */
  const onSetSort = useCallback((sort: SortKey) => {
    setFilters((f) => ({ ...f, sort }))
  }, [])

  /**
   * Switching country shows the whole new country (no city) and resets the price,
   * because the city list and the currency (Kč / €) both change. Categories are kept.
   */
  const onSetCountry = useCallback((country: CountryId) => {
    setFilters((f) =>
      f.country === country ? f : { ...f, country, city: null, price: DEFAULT_FILTERS.price },
    )
  }, [])

  /**
   * Clears date, categories, price and "Jen redakční tipy". Country, city and sort
   * aren't filters, so they're kept.
   */
  const onClearAll = useCallback(() => {
    setFilters((f) => ({
      ...f,
      categories: [],
      price: DEFAULT_FILTERS.price,
      date: DEFAULT_FILTERS.date,
      editorsPick: false,
    }))
  }, [])

  return {
    filters,
    onToggleCategory,
    onRemoveCategory,
    onClearCategories,
    onSetPrice,
    onClearPrice,
    onSetCity,
    onSetCountry,
    onSetDate,
    onClearDate,
    onSetEditorsPick,
    onSetSort,
    onClearAll,
  }
}
