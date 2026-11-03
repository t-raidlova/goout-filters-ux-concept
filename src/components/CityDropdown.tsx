import { useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import type { CityId, CountryId } from '../types'
import { citiesIn } from '../data/cities'
import { cityName, searchCities } from '../lib/citySearch'
import { NavDropdown } from './NavDropdown'
import { useCloseDropdown } from './dropdownContext'
import styles from './CityDropdown.module.css'

interface Props {
  value: CityId | null
  onChange: (city: CityId | null) => void
  /** Only this country's cities are offered. */
  country: CountryId
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

/**
 * GoOut's location dropdown: search field, "Vybrané město" with a clear (×) button,
 * and a scrollable list of "Doporučená města". Single choice.
 *
 * - Opening focuses the search field. Typing filters the list (diacritics-insensitive);
 *   Enter picks the first city shown in the list.
 * - Picking a city applies it, closes, and returns focus to the button.
 * - × clears the city (whole country) and keeps the popover open on the search field.
 */
export function CityDropdown({ value, onChange, country, open, onOpenChange, buttonRef }: Props) {
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <NavDropdown
      label={cityName(value)}
      srPrefix="Město: "
      active={false /* location is context, not a filter: stays black, as on GoOut */}
      open={open}
      onOpenChange={onOpenChange}
      buttonRef={buttonRef}
      initialFocusRef={searchRef}
    >
      <CityPicker value={value} onChange={onChange} country={country} searchRef={searchRef} />
    </NavDropdown>
  )
}

interface PickerProps {
  value: CityId | null
  onChange: (city: CityId | null) => void
  country: CountryId
  searchRef: RefObject<HTMLInputElement | null>
}

/** Popover content; mounted per opening, so the search starts empty each time. */
function CityPicker({ value, onChange, country, searchRef }: PickerProps) {
  const [query, setQuery] = useState('')
  const close = useCloseDropdown()
  const searchId = useId()
  const statusId = useId()
  const listLabelId = useId()
  const selectedLabelId = useId()

  const matches = searchCities(query, citiesIn(country))
  const listed = matches.filter((c) => c.id !== value)
  const name = cityName(value)

  function select(id: CityId) {
    onChange(id)
    close()
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    // Only after typing, and only a city that's visible in the list (not the selected one).
    if (e.key === 'Enter' && query.trim() && listed[0]) {
      e.preventDefault()
      select(listed[0].id)
    }
  }

  function clear() {
    onChange(null)
    searchRef.current?.focus()
  }

  return (
    <div className={styles.content}>
      <div className={styles.search}>
        <label htmlFor={searchId} className="visually-hidden">
          Hledat město
        </label>
        <input
          ref={searchRef}
          id={searchId}
          type="search"
          className={styles.input}
          placeholder="Hledat"
          autoComplete="off"
          value={query}
          aria-describedby={statusId}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* Result count for screen readers while typing. */}
      <p id={statusId} role="status" className="visually-hidden">
        {query ? searchStatus(listed.length, matches.length > listed.length) : ''}
      </p>

      <div className={styles.scroll}>
        {value && (
          <section aria-labelledby={selectedLabelId}>
            <p id={selectedLabelId} className={styles.sectionTitle}>
              Vybrané město
            </p>
            <div className={styles.selected}>
              <span className={styles.selectedName}>{name}</span>
              <button
                type="button"
                className={styles.clear}
                aria-label={`Zrušit výběr města ${name}`}
                onClick={clear}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                  <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </section>
        )}

        <section aria-labelledby={listLabelId}>
          <p id={listLabelId} className={styles.sectionTitle}>
            {query ? 'Výsledky hledání' : 'Doporučená města'}
          </p>
          {listed.length > 0 ? (
            <ul aria-labelledby={listLabelId}>
              {listed.map((c) => (
                <li key={c.id}>
                  <button type="button" className={styles.city} onClick={() => select(c.id)}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              {matches.length > 0 ? 'Jiné město neodpovídá.' : `Žádné město neodpovídá „${query}“.`}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

/**
 * Count of the cities listed under "Výsledky hledání": "1 město", "3 města", "5 měst",
 * "Žádné město", or "Žádné jiné město" when only the selected city matches.
 */
function searchStatus(n: number, selectedMatches: boolean): string {
  if (n === 0) return selectedMatches ? 'Žádné jiné město' : 'Žádné město'
  if (n === 1) return '1 město'
  if (n <= 4) return `${n} města`
  return `${n} měst`
}
