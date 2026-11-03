import type { CountryId, Currency } from './countries'
import { countryById } from './countries'

/**
 * Cities offered in the location dropdown, grouped by country, in GoOut's
 * "Doporučená města" order. Locatives are Czech (the UI language).
 */
export const CITIES = [
  { id: 'praha', country: 'cz', name: 'Praha', locative: 'v Praze' },
  { id: 'brno', country: 'cz', name: 'Brno', locative: 'v Brně' },
  { id: 'ostrava', country: 'cz', name: 'Ostrava', locative: 'v Ostravě' },
  { id: 'plzen', country: 'cz', name: 'Plzeň', locative: 'v Plzni' },
  { id: 'liberec', country: 'cz', name: 'Liberec', locative: 'v Liberci' },
  { id: 'olomouc', country: 'cz', name: 'Olomouc', locative: 'v Olomouci' },
  { id: 'ceske-budejovice', country: 'cz', name: 'České Budějovice', locative: 'v Českých Budějovicích' },
  { id: 'hradec-kralove', country: 'cz', name: 'Hradec Králové', locative: 'v Hradci Králové' },
  { id: 'pardubice', country: 'cz', name: 'Pardubice', locative: 'v Pardubicích' },
  { id: 'zlin', country: 'cz', name: 'Zlín', locative: 've Zlíně' },
  { id: 'bratislava', country: 'sk', name: 'Bratislava', locative: 'v Bratislavě' },
  { id: 'kosice', country: 'sk', name: 'Košice', locative: 'v Košicích' },
  { id: 'zilina', country: 'sk', name: 'Žilina', locative: 'v Žilině' },
  { id: 'banska-bystrica', country: 'sk', name: 'Banská Bystrica', locative: 'v Banské Bystrici' },
  { id: 'nitra', country: 'sk', name: 'Nitra', locative: 'v Nitře' },
  { id: 'presov', country: 'sk', name: 'Prešov', locative: 'v Prešově' },
  { id: 'trnava', country: 'sk', name: 'Trnava', locative: 'v Trnavě' },
] as const satisfies ReadonlyArray<{ id: string; country: CountryId; name: string; locative: string }>

export type CityId = (typeof CITIES)[number]['id']
export type City = (typeof CITIES)[number]

export const CITY_IDS: ReadonlyArray<CityId> = CITIES.map((c) => c.id)

/** Label when no city is selected (all cities of the selected country). */
export const ALL_CITIES_LABEL = 'Všechna města'

/** GoOut opens on Praha; this prototype's starting city. */
export const DEFAULT_CITY: CityId = 'praha'

export function cityById(id: CityId): City {
  return CITIES.find((c) => c.id === id)!
}

export function isCityId(value: string | null): value is CityId {
  return (CITY_IDS as readonly string[]).includes(value ?? '')
}

export function citiesIn(country: CountryId): City[] {
  return CITIES.filter((c) => c.country === country)
}

/** Ticket prices are in the currency of the venue's country. */
export function currencyOfCity(id: CityId): Currency {
  return countryById(cityById(id).country).currency
}
