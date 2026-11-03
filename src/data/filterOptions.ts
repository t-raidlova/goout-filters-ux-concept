import type { DatePreset, PriceFilter } from '../types'

export interface PriceOption {
  /** Stable key, also used in the URL (`?price=200`). */
  key: 'any' | 'free' | '200' | '500' | '1000'
  label: string
  filter: PriceFilter
}

/** Cumulative bands ("up to"), so this is a single-choice group. */
export const PRICE_OPTIONS: ReadonlyArray<PriceOption> = [
  { key: 'any', label: 'Jakákoliv cena', filter: { kind: 'any' } },
  { key: 'free', label: 'Zdarma', filter: { kind: 'free' } },
  { key: '200', label: 'Do 200 Kč', filter: { kind: 'max', czk: 200 } },
  { key: '500', label: 'Do 500 Kč', filter: { kind: 'max', czk: 500 } },
  { key: '1000', label: 'Do 1 000 Kč', filter: { kind: 'max', czk: 1000 } },
]

export function priceKey(filter: PriceFilter): PriceOption['key'] {
  if (filter.kind === 'max') return String(filter.czk) as PriceOption['key']
  return filter.kind
}

export function priceLabel(filter: PriceFilter): string {
  const key = priceKey(filter)
  return PRICE_OPTIONS.find((o) => o.key === key)?.label ?? key
}

export const DATE_OPTIONS: ReadonlyArray<{ key: DatePreset; label: string }> = [
  { key: 'any', label: 'Kdykoliv' },
  { key: 'today', label: 'Dnes' },
  { key: 'tomorrow', label: 'Zítra' },
  { key: 'weekend', label: 'Tento víkend' },
]

export function dateLabel(preset: DatePreset): string {
  return DATE_OPTIONS.find((o) => o.key === preset)?.label ?? preset
}
