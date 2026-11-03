import { describe, expect, it } from 'vitest'
import { formatPrice, hiddenUnknownMessage, pluralEvents, pluralInterested, resultsMessage } from './format'

// Intl uses a non-breaking space before "Kč"; normalise for readable assertions.
const plain = (s: string) => s.replace(/ /g, ' ')

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

describe('Czech plurals', () => {
  it('pluralEvents', () => {
    expect(pluralEvents(1)).toBe('1 akce')
    expect(pluralEvents(3)).toBe('3 akce')
    expect(pluralEvents(0)).toBe('0 akcí')
    expect(pluralEvents(5)).toBe('5 akcí')
  })

  it('hidden unknown-price message', () => {
    expect(hiddenUnknownMessage(1)).toBe('1 akce bez uvedené ceny skryta')
    expect(hiddenUnknownMessage(2)).toBe('2 akce bez uvedené ceny skryty')
    expect(hiddenUnknownMessage(5)).toBe('5 akcí bez uvedené ceny skryto')
  })

  it('status message mentions hidden events only when there are some', () => {
    expect(resultsMessage(6, 0)).toBe('Nalezeno 6 akcí.')
    expect(resultsMessage(6, 1)).toBe('Nalezeno 6 akcí. 1 akce bez uvedené ceny skryta.')
  })

  it('names the active filters, so a filter change with the same count is still announced', () => {
    const a = resultsMessage(2, 0, 'Praha, Koncerty, Do 200 Kč')
    const b = resultsMessage(2, 0, 'Praha, Koncerty, Zdarma')
    expect(a).toBe('Praha, Koncerty, Do 200 Kč: nalezeno 2 akce.')
    expect(a).not.toBe(b)
  })
})

describe('pluralInterested', () => {
  it('uses Czech plural forms and thousands separators', () => {
    expect(pluralInterested(1)).toBe('1 zájemce')
    expect(pluralInterested(3)).toBe('3 zájemci')
    expect(plain(pluralInterested(1200))).toBe('1 200 zájemců')
  })
})
