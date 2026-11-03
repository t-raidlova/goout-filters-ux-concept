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
    expect(pageTitle(['film'], 'praha', 'cz')).toBe('Filmy v Praze')
    expect(pageTitle(['film', 'gastro'], 'praha', 'cz')).toBe('Akce v Praze')
    expect(pageTitle([], 'praha', 'cz')).toBe('Akce v Praze')
  })

  it('uses the city locative, or the whole country', () => {
    expect(pageTitle([], 'brno', 'cz')).toBe('Akce v Brně')
    expect(pageTitle(['concerts'], 'zlin', 'cz')).toBe('Koncerty ve Zlíně')
    expect(pageTitle([], 'ceske-budejovice', 'cz')).toBe('Akce v Českých Budějovicích')
    expect(pageTitle([], null, 'cz')).toBe('Akce v Česku')
    expect(pageTitle(['theatre'], null, 'sk')).toBe('Divadlo na Slovensku')
    expect(pageTitle([], 'bratislava', 'sk')).toBe('Akce v Bratislavě')
  })
})
