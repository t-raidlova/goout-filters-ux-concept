import type {
  CategoryId,
  CityId,
  DateFilter,
  EventItem,
  FilterState,
  PriceFilter,
  SortKey,
} from '../types'
import { CATEGORY_IDS } from '../data/categories'
import { pragueDayKey, type DayKey } from './dates'
import { dateWindow } from './dateFilter'
import { lowestPrice } from './priceFilter'
import { DEFAULT_CITY, cityById } from '../data/cities'
import { DEFAULT_COUNTRY, type CountryId } from '../data/countries'

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  price: { kind: 'any' },
  date: { kind: 'any' },
  country: DEFAULT_COUNTRY,
  city: DEFAULT_CITY,
  editorsPick: false,
  sort: 'upcoming',
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

/** "Jen redakční tipy". */
export function matchesEditorsPick(event: EventItem, onlyPicks: boolean): boolean {
  return !onlyPicks || event.editorsPick
}

export function matchesCountry(event: EventItem, country: CountryId): boolean {
  return cityById(event.venue.city).country === country
}

/** Single city; null means the whole country. */
export function matchesCity(event: EventItem, city: CityId | null): boolean {
  return city === null || event.venue.city === city
}

/** A multi-day event matches if its span overlaps the filter's days (presets or custom range). */
export function matchesDate(event: EventItem, filter: DateFilter, now: Date): boolean {
  const range = dateWindow(filter, now)
  if (!range) return true
  const start = pragueDayKey(new Date(event.startsAt))
  const end = pragueDayKey(endOf(event))
  return start <= range.to && end >= range.from
}

export function matchesAll(event: EventItem, filters: FilterState, now: Date): boolean {
  return (
    isUpcoming(event, now) &&
    matchesCountry(event, filters.country) &&
    matchesEditorsPick(event, filters.editorsPick) &&
    matchesCity(event, filters.city) &&
    matchesCategories(event, filters.categories) &&
    matchesPrice(event, filters.price) &&
    matchesDate(event, filters.date, now)
  )
}

const STATUS_RANK: Record<EventItem['status'], number> = { onSale: 0, soldOut: 1, saleEnded: 2 }

/**
 * Stable order: by the day the event is next "on" (ongoing events count as `firstDay`,
 * normally today),
 * then events starting that day before long-running ones already in progress,
 * then events you can still buy, then start time, then title.
 */
export function sortEvents(
  events: readonly EventItem[],
  now: Date,
  firstDay: DayKey = pragueDayKey(now),
): EventItem[] {
  const startDay = (e: EventItem) => pragueDayKey(new Date(e.startsAt))
  const dayOf = (e: EventItem) => (startDay(e) < firstDay ? firstDay : startDay(e))
  const ongoing = (e: EventItem) => (startDay(e) < firstDay ? 1 : 0)
  return [...events].sort(
    (a, b) =>
      dayOf(a).localeCompare(dayOf(b)) ||
      ongoing(a) - ongoing(b) ||
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.startsAt.localeCompare(b.startsAt) ||
      a.title.localeCompare(b.title),
  )
}

/**
 * Applies the "Řadit" choice. Ties fall back to the date order, so equal popularity
 * or the same day added still reads chronologically.
 * - upcoming: by date (see sortEvents)
 * - popular: most "Mám zájem" first
 * - new: most recently added first
 */
export function orderEvents(
  events: readonly EventItem[],
  sort: SortKey,
  now: Date,
  firstDay: DayKey = pragueDayKey(now),
): EventItem[] {
  const byDate = sortEvents(events, now, firstDay)
  if (sort === 'upcoming') return byDate
  const rank = new Map(byDate.map((e, i) => [e.id, i]))
  const tieBreak = (a: EventItem, b: EventItem) => rank.get(a.id)! - rank.get(b.id)!
  return [...byDate].sort(
    sort === 'popular'
      ? (a, b) => b.interested - a.interested || tieBreak(a, b)
      : (a, b) => b.addedAt.localeCompare(a.addedAt) || tieBreak(a, b),
  )
}

export interface FilterResult {
  results: EventItem[]
  /** Events that match everything except price, hidden only because their price is unknown. */
  hiddenUnknownPrice: number
  /** First day shown: today, or the start of a future date range. Ongoing events sort here. */
  firstDay: DayKey
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
  // Events already running before the first shown day are listed on that day.
  const today = pragueDayKey(now)
  const range = dateWindow(filters.date, now)
  const firstDay = range && range.from > today ? range.from : today
  return {
    results: orderEvents(results, filters.sort, now, firstDay),
    hiddenUnknownPrice,
    firstDay,
  }
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
    filters.date.kind === 'any' &&
    !filters.editorsPick &&
    filters.country === DEFAULT_COUNTRY &&
    filters.city === DEFAULT_CITY
  )
}

export interface RelaxSuggestion {
  /** Which filter to drop: editors' picks, date, price, the whole category selection, or the city. */
  kind: 'editorsPick' | 'date' | 'price' | 'categories' | 'city'
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
  if (filters.editorsPick) {
    suggestions.push({
      kind: 'editorsPick',
      count: countMatches(events, { ...filters, editorsPick: false }, now),
    })
  }
  if (filters.date.kind !== 'any') {
    suggestions.push({
      kind: 'date',
      count: countMatches(events, { ...filters, date: { kind: 'any' } }, now),
    })
  }
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
