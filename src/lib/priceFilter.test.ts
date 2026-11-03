import { describe, expect, it } from 'vitest'
import { formatPrice, lowestPrice, priceKey, priceLabel, priceOptionByKey, priceOptions } from './priceFilter'

// Intl uses non-breaking spaces ("1 000 Kč"); normalise for readable assertions.
const plain = (s: string) => s.replace(/[  ]/g, ' ')
const labels = (country: 'cz' | 'sk') => priceOptions(country).map((o) => plain(o.label))

describe('priceOptions', () => {
  it('Česko: five options in CZK, "Jakákoliv cena" first', () => {
    expect(labels('cz')).toEqual(['Jakákoliv cena', 'Zdarma', 'Do 200 Kč', 'Do 500 Kč', 'Do 1 000 Kč'])
    expect(priceOptions('cz')[0].filter).toEqual({ kind: 'any' })
  })

  it('Slovensko: same structure in EUR', () => {
    expect(labels('sk')).toEqual(['Jakákoliv cena', 'Zdarma', 'Do 10 €', 'Do 20 €', 'Do 40 €'])
  })

  it('"Zdarma" is a cap of 0 in both countries', () => {
    expect(priceOptionByKey('0', 'cz')?.filter).toEqual({ kind: 'max', amount: 0 })
    expect(priceOptionByKey('0', 'sk')?.filter).toEqual({ kind: 'max', amount: 0 })
  })

  it('keys round-trip; caps are only valid in their own country', () => {
    for (const o of priceOptions('cz')) expect(priceOptionByKey(priceKey(o.filter), 'cz')).toEqual(o)
    expect(priceOptionByKey('200', 'sk')).toBeUndefined()
    expect(priceOptionByKey('20', 'cz')).toBeUndefined()
  })
})

describe('priceLabel', () => {
  it('names each filter state in the country currency', () => {
    expect(priceLabel({ kind: 'any' }, 'cz')).toBe('Jakákoliv cena')
    expect(priceLabel({ kind: 'max', amount: 0 }, 'sk')).toBe('Zdarma')
    expect(plain(priceLabel({ kind: 'max', amount: 500 }, 'cz'))).toBe('Do 500 Kč')
    expect(plain(priceLabel({ kind: 'max', amount: 20 }, 'sk'))).toBe('Do 20 €')
  })
})

describe('lowestPrice', () => {
  it('ignores order and handles a single price', () => {
    expect(lowestPrice({ ticketPrices: [590, 290, 390] })).toBe(290)
    expect(lowestPrice({ ticketPrices: [350] })).toBe(350)
  })

  it('free = 0, unknown = null', () => {
    expect(lowestPrice({ ticketPrices: [0, 150] })).toBe(0)
    expect(lowestPrice({ ticketPrices: [] })).toBeNull()
  })
})

describe('formatPrice', () => {
  it('labels free and unknown prices in words', () => {
    expect(formatPrice([0], 'CZK')).toBe('Zdarma')
    expect(formatPrice([], 'CZK')).toBe('Cena neuvedena')
  })

  it('shows a single price as is', () => {
    expect(plain(formatPrice([350], 'CZK'))).toBe('350 Kč')
    expect(plain(formatPrice([350, 350], 'CZK'))).toBe('350 Kč')
  })

  it('shows several prices as "od" the lowest, matching how the filter judges them', () => {
    expect(plain(formatPrice([590, 290, 390], 'CZK'))).toBe('od 290 Kč')
    expect(plain(formatPrice([2490, 1290], 'CZK'))).toBe('od 1 290 Kč')
  })

  it('formats euro prices for Slovak events', () => {
    expect(plain(formatPrice([39, 25, 15], 'EUR'))).toBe('od 15 €')
    expect(plain(formatPrice([12], 'EUR'))).toBe('12 €')
  })

  it('free entry with optional paid tiers', () => {
    expect(plain(formatPrice([0, 150, 300], 'CZK'))).toBe('Zdarma i od 150 Kč')
  })
})
