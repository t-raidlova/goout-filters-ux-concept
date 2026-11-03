import { describe, expect, it } from 'vitest'
import type { CategoryId, EventItem, FilterState, PriceFilter } from '../types'
import { DEMO_NOW, EVENTS } from '../data/events'
import {
  DEFAULT_FILTERS,
  filterEvents,
  matchesCategories,
  matchesPrice,
  relaxSuggestions,
} from './filterEvents'
import { lowestPrice } from './priceFilter'

// Fixed clock: Friday 6 Nov 2026, 17:00 Prague time.
const NOW = new Date('2026-11-06T17:00:00+01:00')

let seq = 0
/** Test event with the given ticket prices (0 = free entry, [] = unknown). */
function event(ticketPrices: number[], overrides: Partial<EventItem> = {}): EventItem {
  seq += 1
  return {
    id: `t${seq}`,
    title: `Test ${seq}`,
    categories: ['concerts'],
    venue: { name: 'Venue', district: 'Holešovice', city: 'Praha' },
    imageUrl: '/images/concerts.svg',
    startsAt: '2026-11-07T20:00:00+01:00',
    ticketPrices,
    status: 'onSale',
    ...overrides,
  }
}

const free = [0]
const unknown: number[] = []
const czk = (...prices: number[]) => prices

const ANY: PriceFilter = { kind: 'any' }
const MAX = (czk: number): PriceFilter => ({ kind: 'max', czk })
/** "Zdarma" = cap of 0. */
const FREE: PriceFilter = MAX(0)

const withFilters = (f: Partial<FilterState>): FilterState => ({ ...DEFAULT_FILTERS, ...f })
const ids = (events: EventItem[]) => events.map((e) => e.id)

describe('lowestPrice', () => {
  it('is the minimum of all known ticket prices, in any order', () => {
    expect(lowestPrice(event(czk(1450, 950, 450, 200)))).toBe(200)
  })

  it('is 0 for free entry, null when unknown', () => {
    expect(lowestPrice(event(free))).toBe(0)
    expect(lowestPrice(event(unknown))).toBeNull()
  })
})

describe('matchesPrice', () => {
  it('"Jakákoliv cena" matches every event, including unknown price', () => {
    for (const p of [free, unknown, czk(50), czk(5000)]) {
      expect(matchesPrice(event(p), ANY)).toBe(true)
    }
  })

  it('"Zdarma" (cap 0) matches only events with free entry', () => {
    expect(matchesPrice(event(free), FREE)).toBe(true)
    expect(matchesPrice(event(czk(1)), FREE)).toBe(false)
    expect(matchesPrice(event(unknown), FREE)).toBe(false)
  })

  it('free events fit under every cap', () => {
    for (const cap of [0, 200, 500, 1000]) {
      expect(matchesPrice(event(free), MAX(cap))).toBe(true)
    }
  })

  it('cap bounds are inclusive', () => {
    expect(matchesPrice(event(czk(200)), MAX(200))).toBe(true)
    expect(matchesPrice(event(czk(201)), MAX(200))).toBe(false)
    expect(matchesPrice(event(czk(500)), MAX(500))).toBe(true)
    expect(matchesPrice(event(czk(501)), MAX(500))).toBe(false)
    expect(matchesPrice(event(czk(1000)), MAX(1000))).toBe(true)
    expect(matchesPrice(event(czk(1001)), MAX(1000))).toBe(false)
  })

  describe('events with several ticket prices are judged by the lowest one', () => {
    const tiers = event(czk(800, 300, 550))

    it('matches a cap at or above the lowest price, even if other tiers exceed it', () => {
      expect(matchesPrice(tiers, MAX(500))).toBe(true)
      expect(matchesPrice(tiers, MAX(1000))).toBe(true)
    })

    it('does not match a cap below the lowest price', () => {
      expect(matchesPrice(tiers, MAX(200))).toBe(false)
      expect(matchesPrice(tiers, FREE)).toBe(false)
    })

    it('lowest tier exactly on the cap matches', () => {
      expect(matchesPrice(event(czk(1450, 950, 450, 200)), MAX(200))).toBe(true)
    })

    it('free entry with optional paid tiers counts as free', () => {
      const donation = event(czk(0, 150))
      expect(matchesPrice(donation, FREE)).toBe(true)
      expect(matchesPrice(donation, MAX(200))).toBe(true)
    })
  })

  it('unknown price never matches an active price filter', () => {
    for (const cap of [0, 200, 500, 1000]) {
      expect(matchesPrice(event(unknown), MAX(cap))).toBe(false)
    }
  })

  it('an event above every cap only shows under "Jakákoliv cena"', () => {
    const arena = event(czk(1290, 2490))
    expect(matchesPrice(arena, MAX(1000))).toBe(false)
    expect(matchesPrice(arena, ANY)).toBe(true)
  })
})

describe('matchesCategories', () => {
  const multi = event(free, { categories: ['concerts', 'parties'] })

  it('empty selection means all categories', () => {
    expect(matchesCategories(multi, [])).toBe(true)
  })

  it('uses OR: any shared category matches', () => {
    expect(matchesCategories(multi, ['parties'])).toBe(true)
    expect(matchesCategories(multi, ['theatre', 'concerts'])).toBe(true)
    expect(matchesCategories(multi, ['theatre'])).toBe(false)
  })
})

describe('filterEvents: price combined with categories', () => {
  const concertFree = event(free, { categories: ['concerts'] })
  const concert350 = event(czk(350), { categories: ['concerts'] })
  const partyRange = event(czk(300, 450), { categories: ['parties'] })
  const both400 = event(czk(400), { categories: ['concerts', 'parties'] })
  const partyUnknown = event(unknown, { categories: ['parties'] })
  const theatre150 = event(czk(150), { categories: ['theatre'] })
  const theatreUnknown = event(unknown, { categories: ['theatre'] })
  const pastFree = event(free, { startsAt: '2026-11-06T12:00:00+01:00' })
  const all = [
    concertFree,
    concert350,
    partyRange,
    both400,
    partyUnknown,
    theatre150,
    theatreUnknown,
    pastFree,
  ]
  const run = (f: Partial<FilterState>) => filterEvents(all, withFilters(f), NOW)

  it('applies category (OR) AND price together', () => {
    const { results } = run({ categories: ['concerts', 'parties'], price: MAX(200) })
    expect(ids(results)).toEqual([concertFree.id])
  })

  it('a multi-category event appears once when several of its categories are selected', () => {
    const { results } = run({ categories: ['concerts', 'parties'], price: MAX(500) })
    expect(ids(results).filter((id) => id === both400.id)).toHaveLength(1)
    expect(new Set(ids(results))).toEqual(
      new Set([concertFree.id, concert350.id, partyRange.id, both400.id]),
    )
  })

  it('price filter alone ignores categories', () => {
    expect(new Set(ids(run({ price: MAX(200) }).results))).toEqual(
      new Set([concertFree.id, theatre150.id]),
    )
  })

  it('never shows past events, even free ones', () => {
    expect(ids(run({ price: FREE }).results)).not.toContain(pastFree.id)
  })

  describe('hiddenUnknownPrice', () => {
    it('is 0 when no price filter is active', () => {
      expect(run({ categories: ['parties'] }).hiddenUnknownPrice).toBe(0)
    })

    it('counts unknown-price events hidden by the price filter', () => {
      expect(run({ price: MAX(1000) }).hiddenUnknownPrice).toBe(2)
    })

    it('only counts events that match the other filters', () => {
      expect(run({ categories: ['parties'], price: MAX(500) }).hiddenUnknownPrice).toBe(1)
      expect(run({ categories: ['concerts'], price: FREE }).hiddenUnknownPrice).toBe(0)
    })
  })
})

describe('relaxSuggestions', () => {
  const gastro450 = event(czk(450), { categories: ['gastro'] })
  const concertFree = event(free, { categories: ['concerts'] })
  const all = [gastro450, concertFree]

  it('suggests dropping the price or the categories, with resulting counts', () => {
    const f = withFilters({ categories: ['gastro'], price: FREE })
    expect(filterEvents(all, f, NOW).results).toHaveLength(0)
    expect(relaxSuggestions(all, f, NOW)).toEqual([
      { kind: 'price', count: 1 },
      { kind: 'categories', count: 1 },
    ])
  })

  it('omits suggestions that would still give no results', () => {
    const f = withFilters({ categories: ['sport'], price: FREE })
    expect(relaxSuggestions(all, f, NOW)).toEqual([{ kind: 'categories', count: 1 }])
  })

  it('returns nothing when no filter is active', () => {
    expect(relaxSuggestions(all, DEFAULT_FILTERS, NOW)).toEqual([])
  })
})

describe('mock data (integration)', () => {
  const run = (categories: CategoryId[], price: PriceFilter) =>
    filterEvents(EVENTS, withFilters({ categories, price }), DEMO_NOW)

  it('Koncerty across price caps', () => {
    expect(run(['concerts'], ANY).results).toHaveLength(8)
    expect(run(['concerts'], FREE).results).toHaveLength(2)
    expect(run(['concerts'], MAX(200)).results).toHaveLength(2)
    expect(run(['concerts'], MAX(500)).results).toHaveLength(5)
    expect(run(['concerts'], MAX(1000)).results).toHaveLength(7)
  })

  it('Koncerty + Parties up to 500 Kč, one unknown-price party hidden', () => {
    const { results, hiddenUnknownPrice } = run(['concerts', 'parties'], MAX(500))
    expect(results).toHaveLength(6)
    expect(hiddenUnknownPrice).toBe(1)
  })

  it('Labutí jezero (200–1 450 Kč) counts as "Do 200 Kč"', () => {
    const titles = run(['theatre'], MAX(200)).results.map((e) => e.title)
    expect(titles).toContain('Labutí jezero')
  })

  it('Gastro + Zdarma is empty and suggests removing the price', () => {
    const f = withFilters({ categories: ['gastro'], price: FREE })
    expect(filterEvents(EVENTS, f, DEMO_NOW).results).toHaveLength(0)
    expect(relaxSuggestions(EVENTS, f, DEMO_NOW)[0]).toEqual({ kind: 'price', count: 1 })
  })
})

describe('mock data: unknown prices', () => {
  it('each unknown-price event is hidden by any price cap and counted', () => {
    const unknownCount = EVENTS.filter((e) => e.ticketPrices.length === 0).length
    const { hiddenUnknownPrice } = filterEvents(
      EVENTS,
      withFilters({ price: { kind: 'max', czk: 1000 } }),
      DEMO_NOW,
    )
    expect(unknownCount).toBe(2)
    expect(hiddenUnknownPrice).toBe(2)
  })
})
