import type { CategoryId, CityId, DatePreset, EventItem, FilterState, PriceFilter } from '../types'
import { CATEGORY_IDS } from '../data/categories'
import { pragueDayKey, presetWindow } from './dates'
import { lowestPrice } from './priceFilter'
import { DEFAULT_CITY, cityById } from '../data/cities'
import { DEFAULT_COUNTRY, type CountryId } from '../data/countries'

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  price: { kind: 'any' },
  date: 'any',
  country: DEFAULT_COUNTRY,
  city: DEFAULT_CITY,
}

function endOf(event: EventItem): Date {
  return new Date(event.endsAt ?? event.startsAt)
}

/** Single-time events drop out once they've started; multi-day ones once they've ended. */
export function isUpcoming(event: EventItem, now: Date): boolean {
  return endOf(event).getTime() >= now.getTime()
}

/** OR within the category facet. An empty selection means "all". */
export function matchesCategories(event: EventItem, selected: readonly CategoryId[]): boolean {
  if (selected.length === 0) return true
  return event.categories.some((c) => selected.includes(c))
}

/**
 * An event matches a price cap when its lowest known ticket price is at or below it
 * (inclusive). Both are in the selected country's currency, since events are
 * filtered to that country first. Free entry is 0, so free events fit under every cap and a cap of 0 means
 * "free only". Events with no known price never match an active price filter.
 */
export function matchesPrice(event: EventItem, filter: PriceFilter): boolean {
  if (filter.kind === 'any') return true
  const lowest = lowestPrice(event)
  return lowest !== null && lowest <= filter.amount
}

export function matchesCountry(event: EventItem, country: CountryId): boolean {
  return cityById(event.venue.city).country === country
}

/** Single city; null means the whole country. */
export function matchesCity(event: EventItem, city: CityId | null): boolean {
  return city === null || event.venue.city === city
}

/** A multi-day event matches if its span overlaps the preset's days. */
export function matchesDate(event: EventItem, preset: DatePreset, now: Date): boolean {
  const range = presetWindow(preset, now)
  if (!range) return true
  const start = pragueDayKey(new Date(event.startsAt))
  const end = pragueDayKey(endOf(event))
  return start <= range.to && end >= range.from
}

export function matchesAll(event: EventItem, filters: FilterState, now: Date): boolean {
  return (
    isUpcoming(event, now) &&
    matchesCountry(event, filters.country) &&
    matchesCity(event, filters.city) &&
    matchesCategories(event, filters.categories) &&
    matchesPrice(event, filters.price) &&
    matchesDate(event, filters.date, now)
  )
}

const STATUS_RANK: Record<EventItem['status'], number> = { onSale: 0, soldOut: 1, saleEnded: 2 }

/**
 * Stable order: by the day the event is next "on" (ongoing events count as today),
 * then events starting that day before long-running ones already in progress,
 * then events you can still buy, then start time, then title.
 */
export function sortEvents(events: readonly EventItem[], now: Date): EventItem[] {
  const today = pragueDayKey(now)
  const startDay = (e: EventItem) => pragueDayKey(new Date(e.startsAt))
  const dayOf = (e: EventItem) => (startDay(e) < today ? today : startDay(e))
  const ongoing = (e: EventItem) => (startDay(e) < today ? 1 : 0)
  return [...events].sort(
    (a, b) =>
      dayOf(a).localeCompare(dayOf(b)) ||
      ongoing(a) - ongoing(b) ||
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.startsAt.localeCompare(b.startsAt) ||
      a.title.localeCompare(b.title),
  )
}

export interface FilterResult {
  results: EventItem[]
  /** Events that match everything except price, hidden only because their price is unknown. */
  hiddenUnknownPrice: number
}

export function filterEvents(
  events: readonly EventItem[],
  filters: FilterState,
  now: Date,
): FilterResult {
  const results = events.filter((e) => matchesAll(e, filters, now))
  const hiddenUnknownPrice =
    filters.price.kind === 'any'
      ? 0
      : events.filter(
          (e) =>
            lowestPrice(e) === null &&
            matchesAll(e, { ...filters, price: { kind: 'any' } }, now),
        ).length
  return { results: sortEvents(results, now), hiddenUnknownPrice }
}

export function countMatches(
  events: readonly EventItem[],
  filters: FilterState,
  now: Date,
): number {
  return events.reduce((n, e) => (matchesAll(e, filters, now) ? n + 1 : n), 0)
}

/**
 * How many results each category would contribute on its own, given the other active
 * filters (price, date). Used for the "(12)" counts on category chips.
 */
export function categoryCounts(
  events: readonly EventItem[],
  filters: FilterState,
  now: Date,
): Record<CategoryId, number> {
  const counts = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0])) as Record<CategoryId, number>
  const withoutCategories = { ...filters, categories: [] }
  for (const e of events) {
    if (!matchesAll(e, withoutCategories, now)) continue
    for (const c of new Set(e.categories)) counts[c] += 1
  }
  return counts
}

export function isDefault(filters: FilterState): boolean {
  return (
    filters.categories.length === 0 &&
    filters.price.kind === 'any' &&
    filters.date === 'any' &&
    filters.country === DEFAULT_COUNTRY &&
    filters.city === DEFAULT_CITY
  )
}

export interface RelaxSuggestion {
  /** Which filter to drop: the price cap, the whole category selection, or the city. */
  kind: 'price' | 'categories' | 'city'
  /** Results the user would get after dropping it. */
  count: number
}

/**
 * For the empty state: which single change would bring results back, and how many.
 * Removing one category from an OR selection can only shrink results, so the
 * category suggestion clears the whole selection. Suggestions that would still
 * yield nothing are omitted.
 */
export function relaxSuggestions(
  events: readonly EventItem[],
  filters: FilterState,
  now: Date,
): RelaxSuggestion[] {
  const suggestions: RelaxSuggestion[] = []
  if (filters.price.kind !== 'any') {
    suggestions.push({
      kind: 'price',
      count: countMatches(events, { ...filters, price: { kind: 'any' } }, now),
    })
  }
  if (filters.categories.length > 0) {
    suggestions.push({
      kind: 'categories',
      count: countMatches(events, { ...filters, categories: [] }, now),
    })
  }
  if (filters.city !== null) {
    suggestions.push({
      kind: 'city',
      count: countMatches(events, { ...filters, city: null }, now),
    })
  }
  return suggestions.filter((s) => s.count > 0)
}
