import { describe, expect, it } from 'vitest'
import { ANY_PRICE, PRICE_OPTIONS, lowestPrice, priceKey, priceLabel, priceOptionByKey } from './priceFilter'

describe('PRICE_OPTIONS', () => {
  it('offers exactly the five dropdown options, "Jakákoliv cena" first', () => {
    expect(PRICE_OPTIONS.map((o) => o.label)).toEqual([
      'Jakákoliv cena',
      'Zdarma',
      'Do 200 Kč',
      'Do 500 Kč',
      'Do 1 000 Kč',
    ])
    expect(PRICE_OPTIONS[0].filter).toEqual(ANY_PRICE)
  })

  it('"Zdarma" is a cap of 0', () => {
    expect(priceOptionByKey('0')?.filter).toEqual({ kind: 'max', czk: 0 })
  })

  it('keys round-trip', () => {
    for (const o of PRICE_OPTIONS) expect(priceOptionByKey(priceKey(o.filter))).toBe(o)
  })
})

describe('priceLabel', () => {
  it('names each filter state', () => {
    expect(priceLabel(ANY_PRICE)).toBe('Jakákoliv cena')
    expect(priceLabel({ kind: 'max', czk: 0 })).toBe('Zdarma')
    expect(priceLabel({ kind: 'max', czk: 500 })).toBe('Do 500 Kč')
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
