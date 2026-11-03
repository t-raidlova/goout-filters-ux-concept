import type { CategoryId, DatePreset, EventItem, FilterState, PriceFilter } from '../types'
import { CATEGORY_IDS } from '../data/categories'
import { pragueDayKey, presetWindow } from './dates'

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  price: { kind: 'any' },
  date: 'any',
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
 * Paid events are judged by their cheapest ticket ("from" price), bounds inclusive.
 * Free events fit under every cap. Unknown prices never match an active price filter.
 */
export function matchesPrice(event: EventItem, filter: PriceFilter): boolean {
  const { price } = event
  switch (filter.kind) {
    case 'any':
      return true
    case 'free':
      return price.kind === 'free'
    case 'max':
      if (price.kind === 'free') return true
      if (price.kind === 'paid') return price.fromCzk <= filter.czk
      return false
  }
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
            e.price.kind === 'unknown' &&
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
    filters.categories.length === 0 && filters.price.kind === 'any' && filters.date === 'any'
  )
}
