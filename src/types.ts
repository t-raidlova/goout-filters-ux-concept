/** Mirrors GoOut's category navigation (minus "Všechny akce", which is the empty selection). */
export type CategoryId =
  | 'concerts'
  | 'theatre'
  | 'exhibitions'
  | 'festivals'
  | 'parties'
  | 'film'
  | 'gastro'
  | 'kids'
  | 'sport'
  | 'other'

/**
 * Real ticket data is messy: several tiers, external ticketing, donations.
 * "unknown" is a normal state, not an error.
 */
export type PriceInfo =
  | { kind: 'free' }
  | { kind: 'paid'; fromCzk: number; toCzk?: number }
  | { kind: 'unknown' }

export type EventStatus = 'onSale' | 'soldOut' | 'saleEnded'

export interface Venue {
  name: string
  /** Neighbourhood, e.g. "Holešovice". */
  district: string
  city: string
}

export interface EventItem {
  id: string
  title: string
  /** Primary category first. Events can carry several tags. */
  categories: CategoryId[]
  venue: Venue
  /** Path under /public. Decorative: the title carries the meaning. */
  imageUrl: string
  /** ISO 8601 with offset (Europe/Prague). */
  startsAt: string
  /** Set for multi-day events: festivals, exhibitions. */
  endsAt?: string
  price: PriceInfo
  status: EventStatus
}

export type PriceCap = 200 | 500 | 1000

export type PriceFilter =
  | { kind: 'any' }
  | { kind: 'free' }
  | { kind: 'max'; czk: PriceCap }

export type DatePreset = 'any' | 'today' | 'tomorrow' | 'weekend'

export interface FilterState {
  /** Empty array means "all categories". */
  categories: CategoryId[]
  price: PriceFilter
  date: DatePreset
}
