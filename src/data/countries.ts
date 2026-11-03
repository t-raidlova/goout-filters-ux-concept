/**
 * Countries in GoOut's first sub-nav item. Each has its own currency, so price caps
 * are defined per country: amounts are always in the country's currency.
 */
export const COUNTRIES = [
  {
    id: 'cz',
    name: 'Česko',
    currency: 'CZK',
    whole: { locative: 'v Česku' },
    priceCaps: [200, 500, 1000],
  },
  {
    id: 'sk',
    name: 'Slovensko',
    currency: 'EUR',
    whole: { locative: 'na Slovensku' },
    priceCaps: [10, 20, 40],
  },
] as const

export type CountryId = (typeof COUNTRIES)[number]['id']
export type Country = (typeof COUNTRIES)[number]
export type Currency = Country['currency']

export const DEFAULT_COUNTRY: CountryId = 'cz'

export function countryById(id: CountryId): Country {
  return COUNTRIES.find((c) => c.id === id)!
}

export function isCountryId(value: string | null): value is CountryId {
  return COUNTRIES.some((c) => c.id === value)
}
