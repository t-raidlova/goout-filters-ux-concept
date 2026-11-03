import type { EventItem, PriceFilter } from '../types'
import { countryById, type CountryId, type Currency } from '../data/countries'
import { formatMoney } from './format'

/**
 * Lowest known ticket price, or null when no price is known.
 * Free entry is 0, so a free event's lowest price is 0.
 */
export function lowestPrice(event: Pick<EventItem, 'ticketPrices'>): number | null {
  return event.ticketPrices.length > 0 ? Math.min(...event.ticketPrices) : null
}

/**
 * Card price label. It uses `lowestPrice()`, the same number the filter judges by:
 * "Zdarma", "350 Kč", "od 290 Kč" (several prices), "Zdarma i od 150 Kč", "od 15 €"
 * or "Cena neuvedena".
 */
export function formatPrice(ticketPrices: readonly number[], currency: Currency): string {
  const lowest = lowestPrice({ ticketPrices })
  if (lowest === null) return 'Cena neuvedena'
  const paid = ticketPrices.filter((p) => p > 0)
  if (paid.length === 0) return 'Zdarma'
  const cheapestPaid = Math.min(...paid)
  if (lowest === 0) return `Zdarma i od ${formatMoney(cheapestPaid, currency)}`
  return paid.some((p) => p > lowest) ? `od ${formatMoney(lowest, currency)}` : formatMoney(lowest, currency)
}

export interface PriceOption {
  /** Stable key, also the URL value (`?price=200`); "any" is never written to the URL. */
  key: string
  label: string
  filter: PriceFilter
}

/**
 * Options in the "Cena" dropdown for a country, in its currency:
 * Jakákoliv cena, Zdarma, then "Do 200 Kč / 500 Kč / 1 000 Kč" or "Do 10 € / 20 € / 40 €".
 * Caps are cumulative ("up to"), so it's single-select.
 */
export function priceOptions(country: CountryId): PriceOption[] {
  const { currency, priceCaps } = countryById(country)
  return [
    { key: 'any', label: 'Jakákoliv cena', filter: { kind: 'any' } },
    { key: '0', label: 'Zdarma', filter: { kind: 'max', amount: 0 } },
    ...priceCaps.map((amount) => ({
      key: String(amount),
      label: `Do ${formatMoney(amount, currency)}`,
      filter: { kind: 'max', amount } as const,
    })),
  ]
}

export function priceKey(filter: PriceFilter): string {
  return filter.kind === 'any' ? 'any' : String(filter.amount)
}

/** Option for a key in a country, or undefined if it isn't offered there. */
export function priceOptionByKey(key: string | null, country: CountryId): PriceOption | undefined {
  return priceOptions(country).find((o) => o.key === key)
}

/** "Jakákoliv cena", "Zdarma", "Do 500 Kč", "Do 20 €". */
export function priceLabel(filter: PriceFilter, country: CountryId): string {
  if (filter.kind === 'any') return 'Jakákoliv cena'
  if (filter.amount === 0) return 'Zdarma'
  return `Do ${formatMoney(filter.amount, countryById(country).currency)}`
}
