import { describe, expect, it } from 'vitest'
import type { EventItem, FilterState, PriceFilter } from '../types'
import { DEMO_NOW, EVENTS } from '../data/events'
import {
  DEFAULT_FILTERS,
  filterEvents,
  hasClearableFilters,
  isUpcoming,
  matchesCategories,
  matchesPrice,
  relaxSuggestions,
} from './filterEvents'

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

  it('cap bounds are inclusive', () => {
    expect(matchesPrice(event(czk(200)), MAX(200))).toBe(true)
    expect(matchesPrice(event(czk(201)), MAX(200))).toBe(false)
    expect(matchesPrice(event(czk(500)), MAX(500))).toBe(true)
    expect(matchesPrice(event(czk(501)), MAX(500))).toBe(false)
    expect(matchesPrice(event(czk(1000)), MAX(1000))).toBe(true)
    expect(matchesPrice(event(czk(1001)), MAX(1000))).toBe(false)
  })

  it('several ticket prices are judged by the lowest one, even if other tiers exceed the cap', () => {
    const tiers = event(czk(800, 300, 550))
    expect(matchesPrice(tiers, MAX(500))).toBe(true)
    expect(matchesPrice(tiers, MAX(200))).toBe(false)
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

  it('never shows past events, even free ones', () => {
    expect(ids(run({ price: FREE }).results)).not.toContain(pastFree.id)
  })

  describe('hiddenUnknownPrice', () => {
    it('is 0 when no price filter is active', () => {
      expect(run({ categories: ['parties'] }).hiddenUnknownPrice).toBe(0)
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
})

describe('city filter', () => {
  const praha = event([350])
  const brno = event([0], { venue: { name: 'Fléda', district: 'Brno-sever', city: 'brno' } })
  const brnoParty = event([], {
    categories: ['parties'],
    venue: { name: 'Fléda', district: 'Brno-sever', city: 'brno' },
  })
  const all = [praha, brno, brnoParty]

  it('defaults to Praha', () => {
    expect(ids(filterEvents(all, DEFAULT_FILTERS, NOW).results)).toEqual([praha.id])
  })

  it('suggests "Všechna města" when the city has no matching events', () => {
    const f = withFilters({ city: 'zlin' })
    expect(filterEvents(all, f, NOW).results).toHaveLength(0)
    expect(relaxSuggestions(all, f, NOW)).toEqual([{ kind: 'city', count: 3 }])
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

  it('whole Slovakia shows only Slovak events', () => {
    const f = withFilters({ country: 'sk', city: null })
    expect(new Set(ids(filterEvents(all, f, NOW).results))).toEqual(
      new Set([bratislava.id, kosiceFree.id]),
    )
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

  it('a custom range matches events overlapping it', () => {
    expect(new Set(run({ kind: 'range', from: '2026-11-14', to: '2026-11-20' }))).toEqual(
      new Set([festival.id, exhibition.id]),
    )
    expect(new Set(run({ kind: 'range', from: '2026-11-09', to: '2026-11-09' }))).toEqual(
      new Set([mon.id, exhibition.id]),
    )
  })

  it('empty state suggests removing the date (not categories, which would still give nothing)', () => {
    const f = withFilters({
      date: { kind: 'range', from: '2026-12-24', to: '2026-12-24' },
      categories: ['concerts'],
    })
    expect(relaxSuggestions([fri, mon], f, NOW)).toEqual([{ kind: 'date', count: 2 }])
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

  it('empty state suggests dropping "Jen redakční tipy"', () => {
    const f = withFilters({ editorsPick: true, price: MAX(100), categories: ['concerts'] })
    expect(relaxSuggestions([soon, tieA, popular], f, NOW)).toEqual([
      { kind: 'editorsPick', count: 1 },
      { kind: 'price', count: 1 },
    ])
  })
})

describe('isUpcoming', () => {
  it('drops an event without endsAt once it has started', () => {
    expect(isUpcoming(event(free, { startsAt: '2026-11-06T16:00:00+01:00' }), NOW)).toBe(false)
    expect(isUpcoming(event(free, { startsAt: '2026-11-06T17:00:00+01:00' }), NOW)).toBe(true)
  })

  it('keeps an event with opening hours today until it closes', () => {
    const market = event(free, {
      startsAt: '2026-11-06T12:00:00+01:00',
      endsAt: '2026-11-06T22:00:00+01:00',
    })
    expect(isUpcoming(market, NOW)).toBe(true)
    expect(isUpcoming(market, new Date('2026-11-06T22:30:00+01:00'))).toBe(false)
  })
})

// Logic is covered above with test events. This only checks the demo data
// loads and shows something, without pinning counts that change with the data.
describe('demo data (smoke)', () => {
  it('shows upcoming events under the default filters', () => {
    const { results } = filterEvents(EVENTS, DEFAULT_FILTERS, DEMO_NOW)
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((e) => isUpcoming(e, DEMO_NOW))).toBe(true)
  })
})

describe('hasClearableFilters', () => {
  it('ignores country, city and sort, which "Zrušit vše" keeps', () => {
    expect(hasClearableFilters(DEFAULT_FILTERS)).toBe(false)
    expect(
      hasClearableFilters({ ...DEFAULT_FILTERS, country: 'sk', city: null, sort: 'popular' }),
    ).toBe(false)
    expect(hasClearableFilters({ ...DEFAULT_FILTERS, city: 'zlin' })).toBe(false)
  })

  it('is true when any of categories, price, date or picks is set', () => {
    expect(hasClearableFilters({ ...DEFAULT_FILTERS, categories: ['film'] })).toBe(true)
    expect(hasClearableFilters({ ...DEFAULT_FILTERS, price: { kind: 'max', amount: 0 } })).toBe(true)
    expect(hasClearableFilters({ ...DEFAULT_FILTERS, date: { kind: 'today' } })).toBe(true)
    expect(hasClearableFilters({ ...DEFAULT_FILTERS, editorsPick: true })).toBe(true)
  })
})
