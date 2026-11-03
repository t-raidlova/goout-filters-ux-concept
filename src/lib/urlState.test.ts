import { describe, expect, it } from 'vitest'
import { parseFilters, serializeFilters } from './urlState'
import { DEFAULT_FILTERS } from './filterEvents'
import type { FilterState } from '../types'

describe('price in the URL', () => {
  it('round-trips categories and a price cap', () => {
    const f: FilterState = {
      ...DEFAULT_FILTERS,
      categories: ['concerts', 'parties'],
      price: { kind: 'max', czk: 500 },
    }
    expect(serializeFilters(f)).toBe('?cat=concerts,parties&price=500')
    expect(parseFilters('?cat=concerts,parties&price=500')).toEqual(f)
  })

  it('price=0 is "Zdarma"', () => {
    expect(parseFilters('?price=0').price).toEqual({ kind: 'max', czk: 0 })
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
