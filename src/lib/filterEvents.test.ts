import { describe, expect, it } from 'vitest'
import type { CategoryId, EventItem, FilterState, PriceFilter } from '../types'
import { DEMO_NOW, EVENTS } from '../data/events'
import {
  DEFAULT_FILTERS,
  filterEvents,
  matchesCategories,
  matchesCity,
  matchesCountry,
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
    venue: { name: 'Venue', district: 'Holešovice', city: 'praha' },
    imageUrl: '/images/concerts.svg',
    startsAt: '2026-11-07T20:00:00+01:00',
    ticketPrices,
    status: 'onSale',
    editorsPick: false,
    interested: 0,
    addedAt: '2026-10-01T10:00:00+02:00',
    ...overrides,
  }
}

const free = [0]
const unknown: number[] = []
const czk = (...prices: number[]) => prices

const ANY: PriceFilter = { kind: 'any' }
const MAX = (amount: number): PriceFilter => ({ kind: 'max', amount })
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

  it('returns nothing when no filter is active and no city is selected', () => {
    expect(relaxSuggestions(all, withFilters({ city: null }), NOW)).toEqual([])
  })

  it('the default city (Praha) can be widened to the whole country', () => {
    const outside = [event(free, { venue: { name: 'V', district: 'D', city: 'brno' } })]
    expect(relaxSuggestions(outside, DEFAULT_FILTERS, NOW)).toEqual([{ kind: 'city', count: 1 }])
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
  it('each unknown-price event in Praha is hidden by any price cap and counted', () => {
    const unknownCount = EVENTS.filter(
      (e) => e.ticketPrices.length === 0 && e.venue.city === 'praha',
    ).length
    const { hiddenUnknownPrice } = filterEvents(
      EVENTS,
      withFilters({ price: { kind: 'max', amount: 1000 } }),
      DEMO_NOW,
    )
    expect(unknownCount).toBe(2)
    expect(hiddenUnknownPrice).toBe(2)
  })
})

describe('city filter', () => {
  const praha = event([350])
  const brno = event([0], { venue: { name: 'Fléda', district: 'Brno-sever', city: 'brno' } })
  const brnoParty = event([], {
    categories: ['parties'],
    venue: { name: 'Fléda', district: 'Brno-sever', city: 'brno' },
  })
  const all = [praha, brno, brnoParty]

  it('matches a single city; null means the whole country', () => {
    expect(matchesCity(brno, 'brno')).toBe(true)
    expect(matchesCity(brno, 'praha')).toBe(false)
    expect(matchesCity(brno, null)).toBe(true)
  })

  it('defaults to Praha', () => {
    expect(ids(filterEvents(all, DEFAULT_FILTERS, NOW).results)).toEqual([praha.id])
  })

  it('combines with categories and price (AND)', () => {
    const f = withFilters({ city: 'brno', price: MAX(0) })
    expect(ids(filterEvents(all, f, NOW).results)).toEqual([brno.id])
    expect(filterEvents(all, f, NOW).hiddenUnknownPrice).toBe(1)
    expect(filterEvents(all, withFilters({ city: 'brno', categories: ['concerts'] }), NOW).results).toHaveLength(1)
  })

  it('suggests "Všechna města" when the city has no matching events', () => {
    const f = withFilters({ city: 'zlin' })
    expect(filterEvents(all, f, NOW).results).toHaveLength(0)
    expect(relaxSuggestions(all, f, NOW)).toEqual([{ kind: 'city', count: 3 }])
  })
})

describe('mock data: cities', () => {
  it('Brno has events; whole country includes every city', () => {
    const brnoCount = filterEvents(EVENTS, withFilters({ city: 'brno' }), DEMO_NOW).results.length
    const praha = filterEvents(EVENTS, DEFAULT_FILTERS, DEMO_NOW).results.length
    const all = filterEvents(EVENTS, withFilters({ city: null }), DEMO_NOW).results.length
    expect(brnoCount).toBe(4)
    expect(praha).toBe(30)
    expect(all).toBe(40)
  })
})

describe('country filter', () => {
  const praha = event([350])
  const bratislava = event([12], {
    venue: { name: 'KC Dunaj', district: 'Staré Mesto', city: 'bratislava' },
  })
  const kosiceFree = event([0], {
    categories: ['parties'],
    venue: { name: 'Tabačka', district: 'Staré Mesto', city: 'kosice' },
  })
  const all = [praha, bratislava, kosiceFree]

  it("matches the venue city's country", () => {
    expect(matchesCountry(bratislava, 'sk')).toBe(true)
    expect(matchesCountry(bratislava, 'cz')).toBe(false)
    expect(matchesCountry(praha, 'cz')).toBe(true)
  })

  it('whole Slovakia shows only Slovak events', () => {
    const f = withFilters({ country: 'sk', city: null })
    expect(new Set(ids(filterEvents(all, f, NOW).results))).toEqual(
      new Set([bratislava.id, kosiceFree.id]),
    )
  })

  it('price caps apply in the country currency (EUR in Slovakia)', () => {
    const f = withFilters({ country: 'sk', city: null, price: MAX(10) })
    expect(ids(filterEvents(all, f, NOW).results)).toEqual([kosiceFree.id])
  })

  it('combines with categories and city (AND)', () => {
    const f = withFilters({ country: 'sk', city: 'kosice', categories: ['parties'] })
    expect(ids(filterEvents(all, f, NOW).results)).toEqual([kosiceFree.id])
  })
})

describe('mock data: Slovakia', () => {
  it('has Slovak events, kept apart from Czech ones', () => {
    const sk = filterEvents(EVENTS, withFilters({ country: 'sk', city: null }), DEMO_NOW).results
    expect(sk).toHaveLength(8)
    expect(sk.every((e) => matchesCountry(e, 'sk'))).toBe(true)
  })

  it('"Do 20 €" in Slovakia uses EUR prices', () => {
    const f = withFilters({ country: 'sk', city: null, price: MAX(20) })
    const { results, hiddenUnknownPrice } = filterEvents(EVENTS, f, DEMO_NOW)
    expect(results.map((e) => e.title)).toContain('Na skle maľované') // 15–39 €
    expect(hiddenUnknownPrice).toBe(1)
  })
})

describe('date filter', () => {
  const fri = event([350], { startsAt: '2026-11-06T20:00:00+01:00' })
  const sat = event([0], { startsAt: '2026-11-07T20:00:00+01:00', categories: ['parties'] })
  const mon = event([150], { startsAt: '2026-11-09T19:00:00+01:00' })
  const festival = event([500], {
    startsAt: '2026-11-13T18:00:00+01:00',
    endsAt: '2026-11-15T23:00:00+01:00',
  })
  const exhibition = event([0], {
    startsAt: '2026-09-01T10:00:00+02:00',
    endsAt: '2027-02-28T18:00:00+01:00',
  })
  const all = [fri, sat, mon, festival, exhibition]
  const run = (date: FilterState['date'], f: Partial<FilterState> = {}) =>
    ids(filterEvents(all, withFilters({ date, ...f }), NOW).results)

  it('Dnes / Zítra include ongoing multi-day events', () => {
    expect(new Set(run({ kind: 'today' }))).toEqual(new Set([fri.id, exhibition.id]))
    expect(new Set(run({ kind: 'tomorrow' }))).toEqual(new Set([sat.id, exhibition.id]))
  })

  it('on a Friday, Tento týden and Tento víkend are both Fri–Sun', () => {
    expect(new Set(run({ kind: 'week' }))).toEqual(new Set([fri.id, sat.id, exhibition.id]))
    expect(new Set(run({ kind: 'weekend' }))).toEqual(new Set([fri.id, sat.id, exhibition.id]))
  })

  it('a custom range matches events overlapping it', () => {
    expect(new Set(run({ kind: 'range', from: '2026-11-14', to: '2026-11-20' }))).toEqual(
      new Set([festival.id, exhibition.id]),
    )
    expect(new Set(run({ kind: 'range', from: '2026-11-09', to: '2026-11-09' }))).toEqual(
      new Set([mon.id, exhibition.id]),
    )
  })

  it('combines with categories and price (AND)', () => {
    expect(run({ kind: 'weekend' }, { categories: ['parties'], price: MAX(0) })).toEqual([sat.id])
  })

  it('empty state suggests removing the date (not categories, which would still give nothing)', () => {
    const f = withFilters({
      date: { kind: 'range', from: '2026-12-24', to: '2026-12-24' },
      categories: ['concerts'],
    })
    expect(relaxSuggestions([fri, mon], f, NOW)).toEqual([{ kind: 'date', count: 2 }])
  })
})

describe('mock data: dates', () => {
  it('Tento víkend in Praha', () => {
    const { results } = filterEvents(EVENTS, withFilters({ date: { kind: 'weekend' } }), DEMO_NOW)
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((e) => (e.endsAt ?? e.startsAt) >= '2026-11-06')).toBe(true)
  })
})

describe('ongoing events with a future date range', () => {
  it('are listed on the first day of the range, not today', () => {
    const exhibition = event([0], {
      startsAt: '2026-09-01T10:00:00+01:00',
      endsAt: '2027-02-28T18:00:00+01:00',
    })
    const { firstDay } = filterEvents(
      [exhibition],
      withFilters({ date: { kind: 'range', from: '2026-11-12', to: '2026-11-15' } }),
      NOW,
    )
    expect(firstDay).toBe('2026-11-12')
    expect(filterEvents([exhibition], DEFAULT_FILTERS, NOW).firstDay).toBe('2026-11-06')
  })
})

describe('editors\' picks and sorting', () => {
  const soon = event([350], { startsAt: '2026-11-06T20:00:00+01:00', interested: 100, addedAt: '2026-10-01T10:00:00+02:00' })
  const popular = event([200], { startsAt: '2026-11-10T20:00:00+01:00', interested: 900, addedAt: '2026-10-20T10:00:00+02:00', editorsPick: true })
  const fresh = event([0], { startsAt: '2026-11-20T20:00:00+01:00', interested: 40, addedAt: '2026-11-06T09:00:00+01:00', editorsPick: true })
  const tieA = event([0], { startsAt: '2026-11-08T20:00:00+01:00', interested: 100, addedAt: '2026-10-01T10:00:00+02:00' })
  const all = [fresh, popular, soon, tieA]
  const run = (f: Partial<FilterState>) => ids(filterEvents(all, withFilters(f), NOW).results)

  it('"Blížící se" orders by date', () => {
    expect(run({})).toEqual([soon.id, tieA.id, popular.id, fresh.id])
  })

  it('"Populární" orders by interest; ties keep date order', () => {
    expect(run({ sort: 'popular' })).toEqual([popular.id, soon.id, tieA.id, fresh.id])
  })

  it('"Novinky" orders by date added, newest first; ties keep date order', () => {
    expect(run({ sort: 'new' })).toEqual([fresh.id, popular.id, soon.id, tieA.id])
  })

  it('"Jen redakční tipy" filters; sorting never hides events', () => {
    expect(run({ editorsPick: true })).toEqual([popular.id, fresh.id])
    expect(run({ editorsPick: true, sort: 'popular' })).toEqual([popular.id, fresh.id])
    expect(run({ sort: 'new' })).toHaveLength(all.length)
  })

  it('combines with the other filters (AND)', () => {
    expect(run({ editorsPick: true, price: MAX(0) })).toEqual([fresh.id])
  })

  it('empty state suggests dropping "Jen redakční tipy"', () => {
    const f = withFilters({ editorsPick: true, price: MAX(100), categories: ['concerts'] })
    expect(relaxSuggestions([soon, tieA, popular], f, NOW)).toEqual([
      { kind: 'editorsPick', count: 1 },
      { kind: 'price', count: 1 },
    ])
  })
})

describe('mock data: editors\' picks', () => {
  it('Praha has 8 picks, and "Populární" starts with the most popular', () => {
    const picks = filterEvents(EVENTS, withFilters({ editorsPick: true }), DEMO_NOW).results
    expect(picks).toHaveLength(8)
    expect(picks.every((e) => e.editorsPick)).toBe(true)
    const popular = filterEvents(EVENTS, withFilters({ sort: 'popular' }), DEMO_NOW).results
    expect(popular[0].title).toBe('Severní světla: Arena Tour 2026')
  })
})
