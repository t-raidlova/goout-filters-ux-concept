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
  /**
   * Every known ticket price in whole CZK (seat categories, early bird, on the door…).
   * 0 = free entry. Empty = price unknown (e.g. tickets sold elsewhere).
   */
  ticketPrices: readonly number[]
  status: EventStatus
}

/**
 * Price filter. `max` is an inclusive cap on the lowest known ticket price, in whole CZK;
 * `max 0` means free events only.
 */
export type PriceFilter = { kind: 'any' } | { kind: 'max'; czk: number }

export type DatePreset = 'any' | 'today' | 'tomorrow' | 'weekend'

export interface FilterState {
  /** Empty array means "all categories". */
  categories: CategoryId[]
  price: PriceFilter
  date: DatePreset
}
