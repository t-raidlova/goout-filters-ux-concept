import type { CategoryId, CityId, CountryId, DateFilter, FilterState } from '../types'
import { CATEGORY_IDS } from '../data/categories'
import { cityById, isCityId } from '../data/cities'
import { isCountryId } from '../data/countries'
import { DEFAULT_FILTERS } from './filterEvents'
import { priceOptionByKey } from './priceFilter'
import { DATE_PRESETS, isDayKey } from './dateFilter'
import { isSortKey } from './sort'

/** `city` value meaning "the whole country" (no city). */
const ALL_CITIES_PARAM = 'vse'

/**
 * `?country=sk&city=bratislava&cat=concerts,parties&price=20&date=weekend`
 * (custom date range: `date=2026-11-10..2026-11-12`; editors' picks `tips=1`; `sort=popular|new`)
 * - Defaults (Česko, Praha, any price/date, all categories) are omitted.
 * - `price` = cap in the country's currency; only that country's offered caps are accepted.
 * - A city from another country falls back to the whole country.
 * Unknown or malformed values are dropped silently and fall back to defaults.
 */
/** Praha is the starting city in Česko; other countries start with no city. */
function defaultCityFor(country: CountryId): CityId | null {
  return country === DEFAULT_FILTERS.country ? DEFAULT_FILTERS.city : null
}

export function parseFilters(search: string): FilterState {
  const params = new URLSearchParams(search)

  const categories = (params.get('cat') ?? '')
    .split(',')
    .filter((c, i, all): c is CategoryId =>
      (CATEGORY_IDS as readonly string[]).includes(c) && all.indexOf(c) === i,
    )
  // Keep a canonical order so equal states serialise identically.
  categories.sort((a, b) => CATEGORY_IDS.indexOf(a) - CATEGORY_IDS.indexOf(b))

  const countryParam = params.get('country')
  const country = isCountryId(countryParam) ? countryParam : DEFAULT_FILTERS.country

  // Missing, unknown or other-country city → the country's default
  // (Praha in Česko, the whole country in Slovensko).
  const cityParam = params.get('city')
  const defaultCity = defaultCityFor(country)
  let city: CityId | null
  if (cityParam === ALL_CITIES_PARAM) city = null
  else if (isCityId(cityParam) && cityById(cityParam).country === country) city = cityParam
  else city = defaultCity

  const priceParam = params.get('price')
  // Only caps offered in this country; "any" is the default and never in the URL.
  const priceOption = priceParam === 'any' ? undefined : priceOptionByKey(priceParam, country)
  const price = priceOption?.filter ?? DEFAULT_FILTERS.price

  const date = parseDate(params.get('date'))

  const editorsPick = params.get('tips') === '1'
  const sortParam = params.get('sort')
  const sort = isSortKey(sortParam) ? sortParam : DEFAULT_FILTERS.sort

  return { categories, price, date, country, city, editorsPick, sort }
}

export function serializeFilters(filters: FilterState): string {
  const params = new URLSearchParams()
  if (filters.country !== DEFAULT_FILTERS.country) params.set('country', filters.country)
  if (filters.city !== defaultCityFor(filters.country)) params.set('city', filters.city ?? ALL_CITIES_PARAM)
  if (filters.categories.length > 0) params.set('cat', filters.categories.join(','))
  if (filters.price.kind !== 'any') params.set('price', String(filters.price.amount))
  if (filters.editorsPick) params.set('tips', '1')
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.date.kind === 'range') params.set('date', `${filters.date.from}..${filters.date.to}`)
  else if (filters.date.kind !== 'any') params.set('date', filters.date.kind)
  // Keep commas readable in the address bar.
  const query = params.toString().replaceAll('%2C', ',')
  return query ? `?${query}` : ''
}

/** Preset name, or `from..to` day keys; anything else (or from > to) → any date. */
function parseDate(value: string | null): DateFilter {
  const preset = DATE_PRESETS.find((p) => p.kind === value)
  if (preset) return { kind: preset.kind }
  const [from, to] = (value ?? '').split('..')
  if (from && to && isDayKey(from) && isDayKey(to) && from <= to) return { kind: 'range', from, to }
  return DEFAULT_FILTERS.date
}
