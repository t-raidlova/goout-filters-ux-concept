import { describe, expect, it } from 'vitest'
import { parseFilters, serializeFilters } from './urlState'
import { DEFAULT_FILTERS } from './filterEvents'
import type { FilterState } from '../types'

describe('price in the URL', () => {
  it('round-trips categories and a price cap', () => {
    const f: FilterState = {
      ...DEFAULT_FILTERS,
      categories: ['concerts', 'parties'],
      price: { kind: 'max', amount: 500 },
    }
    expect(serializeFilters(f)).toBe('?cat=concerts,parties&price=500')
    expect(parseFilters('?cat=concerts,parties&price=500')).toEqual(f)
  })

  it('price=0 is "Zdarma"', () => {
    expect(parseFilters('?price=0').price).toEqual({ kind: 'max', amount: 0 })
  })

  it('omits the param for "Jakákoliv cena"', () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe('')
  })

  it('only accepts offered caps; anything else falls back to all prices', () => {
    for (const q of ['?price=abc', '?price=450', '?price=-5', '?price=', '?price=any']) {
      expect(parseFilters(q).price).toEqual({ kind: 'any' })
    }
  })
})

describe('city in the URL', () => {
  it('omits the default city (Praha)', () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe('')
    expect(parseFilters('').city).toBe('praha')
  })

  it('round-trips another city and the whole country', () => {
    expect(serializeFilters({ ...DEFAULT_FILTERS, city: 'brno' })).toBe('?city=brno')
    expect(parseFilters('?city=brno').city).toBe('brno')
    expect(serializeFilters({ ...DEFAULT_FILTERS, city: null })).toBe('?city=vse')
    expect(parseFilters('?city=vse').city).toBeNull()
  })

  it('falls back to Praha for unknown cities', () => {
    expect(parseFilters('?city=atlantis').city).toBe('praha')
  })
})

describe('country in the URL', () => {
  it('omits Česko; Slovakia defaults to the whole country', () => {
    expect(serializeFilters({ ...DEFAULT_FILTERS, country: 'sk', city: null })).toBe('?country=sk')
    expect(parseFilters('?country=sk')).toMatchObject({ country: 'sk', city: null })
  })

  it('round-trips a Slovak city and a EUR cap', () => {
    const q = '?country=sk&city=bratislava&price=20'
    expect(parseFilters(q)).toMatchObject({
      country: 'sk',
      city: 'bratislava',
      price: { kind: 'max', amount: 20 },
    })
    expect(serializeFilters(parseFilters(q))).toBe(q)
  })

  it('drops a city from another country and caps from another currency', () => {
    expect(parseFilters('?country=sk&city=brno').city).toBeNull()
    expect(parseFilters('?city=bratislava').city).toBe('praha')
    expect(parseFilters('?country=sk&price=200').price).toEqual({ kind: 'any' })
    expect(parseFilters('?price=20').price).toEqual({ kind: 'any' })
  })

  it('unknown country falls back to Česko + Praha', () => {
    expect(parseFilters('?country=pl')).toMatchObject({ country: 'cz', city: 'praha' })
  })
})

describe('date in the URL', () => {
  it('round-trips presets and custom ranges', () => {
    expect(serializeFilters({ ...DEFAULT_FILTERS, date: { kind: 'weekend' } })).toBe('?date=weekend')
    expect(parseFilters('?date=week').date).toEqual({ kind: 'week' })
    const range = { kind: 'range' as const, from: '2026-11-10', to: '2026-11-12' }
    expect(serializeFilters({ ...DEFAULT_FILTERS, date: range })).toBe('?date=2026-11-10..2026-11-12')
    expect(parseFilters('?date=2026-11-10..2026-11-12').date).toEqual(range)
  })

  it('ignores invalid or reversed ranges', () => {
    for (const q of ['?date=soon', '?date=2026-11-12..2026-11-10', '?date=2026-02-30..2026-03-01', '?date=2026-11-10']) {
      expect(parseFilters(q).date).toEqual({ kind: 'any' })
    }
  })
})

describe('editors\' picks and sort in the URL', () => {
  it('round-trips tips=1 and sort; defaults are omitted', () => {
    const f = { ...DEFAULT_FILTERS, editorsPick: true, sort: 'popular' as const }
    expect(serializeFilters(f)).toBe('?tips=1&sort=popular')
    expect(parseFilters('?tips=1&sort=popular')).toEqual(f)
    expect(serializeFilters({ ...DEFAULT_FILTERS, sort: 'upcoming' })).toBe('')
  })

  it('ignores unknown sort values and tips other than 1', () => {
    expect(parseFilters('?sort=random&tips=yes')).toMatchObject({ sort: 'upcoming', editorsPick: false })
  })
})
