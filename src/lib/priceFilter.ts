import type { EventItem, PriceFilter } from '../types'

/**
 * Lowest known ticket price in CZK, or null when no price is known.
 * Free entry is 0, so a free event's lowest price is 0.
 */
export function lowestPrice(event: Pick<EventItem, 'ticketPrices'>): number | null {
  return event.ticketPrices.length > 0 ? Math.min(...event.ticketPrices) : null
}

export interface PriceOption {
  /** Stable key, also the URL value (`?price=200`); "any" is never written to the URL. */
  key: 'any' | '0' | '200' | '500' | '1000'
  label: string
  filter: PriceFilter
}

export const ANY_PRICE: PriceFilter = { kind: 'any' }

/** Options in the "Cena" dropdown. Caps are cumulative ("up to"), so it's single-select. */
export const PRICE_OPTIONS: ReadonlyArray<PriceOption> = [
  { key: 'any', label: 'Jakákoliv cena', filter: ANY_PRICE },
  { key: '0', label: 'Zdarma', filter: { kind: 'max', czk: 0 } },
  { key: '200', label: 'Do 200 Kč', filter: { kind: 'max', czk: 200 } },
  { key: '500', label: 'Do 500 Kč', filter: { kind: 'max', czk: 500 } },
  { key: '1000', label: 'Do 1 000 Kč', filter: { kind: 'max', czk: 1000 } },
]

export function priceKey(filter: PriceFilter): string {
  return filter.kind === 'any' ? 'any' : String(filter.czk)
}

/** Option for a key, or undefined if it isn't one of the offered options. */
export function priceOptionByKey(key: string | null): PriceOption | undefined {
  return PRICE_OPTIONS.find((o) => o.key === key)
}

/** "Jakákoliv cena", "Zdarma", "Do 500 Kč". */
export function priceLabel(filter: PriceFilter): string {
  return priceOptionByKey(priceKey(filter))?.label ?? `Do ${filter.kind === 'max' ? filter.czk : ''} Kč`
}
