import { describe, expect, it } from 'vitest'
import { cityLocative, cityName, normalizeForSearch, searchCities } from './citySearch'
import { citiesIn } from '../data/cities'

const names = (q: string) => searchCities(q, citiesIn('cz')).map((c) => c.name)

describe('searchCities', () => {
  it('returns every city for an empty query, in list order', () => {
    expect(names('')).toHaveLength(10)
    expect(names('   ')[0]).toBe('Praha')
  })

  it('ignores case and diacritics', () => {
    expect(names('plzen')).toEqual(['Plzeň'])
    expect(names('ZLIN')).toEqual(['Zlín'])
    expect(names('ceske bud')).toEqual(['České Budějovice'])
  })

  it('matches the start of any word', () => {
    expect(names('kralove')).toEqual(['Hradec Králové'])
    expect(names('bud')).toEqual(['České Budějovice'])
  })

  it('does not match in the middle of a word', () => {
    expect(names('raha')).toEqual([])
  })

  it('can match several cities', () => {
    expect(names('p')).toEqual(['Praha', 'Plzeň', 'Pardubice'])
  })
})

describe('labels', () => {
  it('normalizes text for search', () => {
    expect(normalizeForSearch('  Hradec Králové ')).toBe('hradec kralove')
  })

  it('names and locatives, including the whole country', () => {
    expect(cityName('ostrava')).toBe('Ostrava')
    expect(cityName(null)).toBe('Všechna města')
    expect(cityLocative('plzen', 'cz')).toBe('v Plzni')
    expect(cityLocative(null, 'cz')).toBe('v Česku')
    expect(cityLocative(null, 'sk')).toBe('na Slovensku')
    expect(cityLocative('kosice', 'sk')).toBe('v Košicích')
  })
})

describe('Slovak cities', () => {
  const sk = (q: string) => searchCities(q, citiesIn('sk')).map((c) => c.name)

  it('only lists cities of the selected country', () => {
    expect(sk('')).toEqual(['Bratislava', 'Košice', 'Žilina', 'Banská Bystrica', 'Nitra', 'Prešov', 'Trnava'])
    expect(sk('brno')).toEqual([])
  })

  it('searches without diacritics', () => {
    expect(sk('kosice')).toEqual(['Košice'])
    expect(sk('bystr')).toEqual(['Banská Bystrica'])
  })
})
