/** Mirrors GoOut's category navigation (minus "Všechny akce", which is the empty selection). */
import type { CityId } from './data/cities'
import type { CountryId } from './data/countries'

export type { CityId, CountryId }

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
  city: CityId
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
   * Every known ticket price in the venue country's currency (CZK, EUR), whole units
   * (seat categories, early bird, on the door…).
   * 0 = free entry. Empty = price unknown (e.g. tickets sold elsewhere).
   */
  ticketPrices: readonly number[]
  status: EventStatus
}

/**
 * Price filter. `max` is an inclusive cap on the lowest known ticket price, in the
 * selected country's currency (CZK or EUR); `max 0` means free events only.
 */
export type PriceFilter = { kind: 'any' } | { kind: 'max'; amount: number }

export type DatePreset = 'any' | 'today' | 'tomorrow' | 'weekend'

export interface FilterState {
  /** Empty array means "all categories". */
  categories: CategoryId[]
  price: PriceFilter
  /** Country from GoOut's first sub-nav item. Sets the city list and currency. */
  country: CountryId
  /** Single city in that country, as on GoOut. null = all cities ("Všechna města"). */
  city: CityId | null
  date: DatePreset
}
