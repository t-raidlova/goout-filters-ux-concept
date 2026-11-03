import { describe, expect, it } from 'vitest'
import { categorySummary, pageTitle, removeCategory, toggleCategory } from './categorySelection'

describe('toggleCategory', () => {
  it('adds and removes', () => {
    expect(toggleCategory([], 'concerts')).toEqual(['concerts'])
    expect(toggleCategory(['concerts'], 'concerts')).toEqual([])
  })

  it('keeps navigation order regardless of click order', () => {
    expect(toggleCategory(['parties'], 'concerts')).toEqual(['concerts', 'parties'])
  })

  it('never duplicates', () => {
    expect(toggleCategory(['concerts', 'concerts'], 'parties')).toEqual(['concerts', 'parties'])
  })
})

describe('removeCategory', () => {
  it('removes only that category', () => {
    expect(removeCategory(['concerts', 'parties'], 'concerts')).toEqual(['parties'])
  })
})

describe('labels', () => {
  it('summarises the selection for the sub-nav', () => {
    expect(categorySummary([])).toBe('Všechny kategorie')
    expect(categorySummary(['concerts'])).toBe('Koncerty')
    expect(categorySummary(['concerts', 'parties', 'film'])).toBe('Koncerty +2')
  })

  it('names the page after a single category only', () => {
    expect(pageTitle(['film'])).toBe('Filmy v Praze')
    expect(pageTitle(['film', 'gastro'])).toBe('Akce v Praze')
    expect(pageTitle([])).toBe('Akce v Praze')
  })
})
