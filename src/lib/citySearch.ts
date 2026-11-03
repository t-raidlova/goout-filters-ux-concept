import { ALL_CITIES_LABEL, cityById, type City, type CityId } from '../data/cities'
import { countryById, type CountryId } from '../data/countries'

/** Lowercase and strip diacritics, so "ceske bud" finds "České Budějovice". */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/**
 * Cities matching the query (diacritics- and case-insensitive), in list order.
 * A city matches when any word of its name starts with the query, or the whole
 * name does ("hradec", "kralove", "hradec kr"). Empty query returns every city.
 */
export function searchCities(query: string, cities: readonly City[]): City[] {
  const q = normalizeForSearch(query)
  if (!q) return [...cities]
  return cities.filter((c) => {
    const name = normalizeForSearch(c.name)
    return name.startsWith(q) || name.split(/[\s-]+/).some((word) => word.startsWith(q))
  })
}

/** Name for the bar: "Praha", or "Všechna města" when no city is set. */
export function cityName(city: CityId | null): string {
  return city ? cityById(city).name : ALL_CITIES_LABEL
}

/** For headings: "v Praze", "ve Zlíně", "v Česku", "na Slovensku". */
export function cityLocative(city: CityId | null, country: CountryId): string {
  return city ? cityById(city).locative : countryById(country).whole.locative
}
