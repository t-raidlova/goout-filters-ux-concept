import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { EVENTS, DEMO_NOW } from './data/events'
import { categoryLabel } from './data/categories'
import { filterEvents, relaxSuggestions } from './lib/filterEvents'
import { groupByDay } from './lib/groupEvents'
import { hiddenUnknownMessage, pluralEvents } from './lib/format'
import { categorySummary, pageTitle } from './lib/categorySelection'
import { priceLabel } from './lib/priceFilter'
import { useFilters } from './hooks/useFilters'
import { SiteHeader } from './components/SiteHeader'
import { SideNav } from './components/SideNav'
import { SubNav } from './components/SubNav'
import { CategoryPanel } from './components/CategoryPanel'
import { PriceDropdown } from './components/PriceDropdown'
import { CityDropdown } from './components/CityDropdown'
import { CountryDropdown } from './components/CountryDropdown'
import { DateDropdown } from './components/DateDropdown'
import { dateFilterLabel } from './lib/dateFilter'
import { ALL_CITIES_LABEL } from './data/cities'
import { ActiveFilters, type FilterChip } from './components/ActiveFilters'
import { ResultsStatus } from './components/ResultsStatus'
import { EventSection } from './components/EventSection'
import { EventGrid } from './components/EventGrid'
import { EmptyState } from './components/EmptyState'
import { SiteFooter } from './components/SiteFooter'
import styles from './App.module.css'

type PanelName = 'country' | 'city' | 'category' | 'price' | 'date'

export default function App() {
  const {
    filters,
    onToggleCategory,
    onRemoveCategory,
    onClearCategories,
    onSetPrice,
    onClearPrice,
    onSetCity,
    onSetCountry,
    onSetDate,
    onClearDate,
    onClearAll,
  } = useFilters()

  // One open at a time: a dropdown (country, city, price, date) or the category panel.
  const [openPanel, setOpenPanel] = useState<PanelName | null>(null)
  const categoryPanelId = useId()
  const categoryToggleRef = useRef<HTMLButtonElement>(null)
  const priceToggleRef = useRef<HTMLButtonElement>(null)
  const cityToggleRef = useRef<HTMLButtonElement>(null)
  const countryToggleRef = useRef<HTMLButtonElement>(null)
  const dateToggleRef = useRef<HTMLButtonElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { results, hiddenUnknownPrice, firstDay } = useMemo(
    () => filterEvents(EVENTS, filters, DEMO_NOW),
    [filters],
  )
  const groups = useMemo(() => groupByDay(results, DEMO_NOW, firstDay), [results, firstDay])
  const suggestions = useMemo(
    () => (results.length === 0 ? relaxSuggestions(EVENTS, filters, DEMO_NOW) : []),
    [results, filters],
  )

  const { categories, price, city, country, date } = filters
  const priceActive = price.kind !== 'any'

  function togglePanel(name: PanelName) {
    setOpenPanel((open) => (open === name ? null : name))
  }

  function closeCategoryPanel() {
    setOpenPanel(null)
    categoryToggleRef.current?.focus()
  }

  // Stable identities: the dropdowns subscribe to outside clicks with them.
  const setPriceOpen = useCallback((open: boolean) => {
    setOpenPanel((current) => (open ? 'price' : current === 'price' ? null : current))
  }, [])
  const setCityOpen = useCallback((open: boolean) => {
    setOpenPanel((current) => (open ? 'city' : current === 'city' ? null : current))
  }, [])
  const setDateOpen = useCallback((open: boolean) => {
    setOpenPanel((current) => (open ? 'date' : current === 'date' ? null : current))
  }, [])
  const setCountryOpen = useCallback((open: boolean) => {
    setOpenPanel((current) => (open ? 'country' : current === 'country' ? null : current))
  }, [])

  /** Empty-state buttons disappear once results return; move focus to the results. */
  function fromEmptyState(action: () => void) {
    return () => {
      action()
      resultsRef.current?.focus()
    }
  }

  const chips: FilterChip[] = [
    ...categories.map((id) => ({
      key: `cat:${id}`,
      label: categoryLabel(id),
      onRemove: () => onRemoveCategory(id),
      fallbackFocusRef: categoryToggleRef,
    })),
    ...(priceActive
      ? [
          {
            key: 'price',
            label: priceLabel(price, country),
            onRemove: onClearPrice,
            fallbackFocusRef: priceToggleRef,
          },
        ]
      : []),
    ...(date.kind !== 'any'
      ? [
          {
            key: 'date',
            label: dateFilterLabel(date),
            onRemove: onClearDate,
            fallbackFocusRef: dateToggleRef,
          },
        ]
      : []),
  ]

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#results">
        Přeskočit na akce
      </a>
      <div className={styles.header}>
        <SiteHeader />
      </div>
      <div className={styles.sidebar}>
        <SideNav />
      </div>
      <div className={styles.content}>
        <section aria-label="Filtry">
          <SubNav
            country={
              <CountryDropdown
                value={country}
                onChange={onSetCountry}
                open={openPanel === 'country'}
                onOpenChange={setCountryOpen}
                buttonRef={countryToggleRef}
              />
            }
            city={
              <CityDropdown
                value={city}
                onChange={onSetCity}
                country={country}
                open={openPanel === 'city'}
                onOpenChange={setCityOpen}
                buttonRef={cityToggleRef}
              />
            }
            category={{
              srPrefix: 'Kategorie: ',
              summary: categorySummary(categories),
              active: categories.length > 0,
              panelId: categoryPanelId,
              expanded: openPanel === 'category',
              onToggle: () => togglePanel('category'),
              buttonRef: categoryToggleRef,
            }}
            price={
              <PriceDropdown
                value={price}
                onChange={onSetPrice}
                country={country}
                open={openPanel === 'price'}
                onOpenChange={setPriceOpen}
                buttonRef={priceToggleRef}
              />
            }
            date={
              <DateDropdown
                value={date}
                onChange={onSetDate}
                now={DEMO_NOW}
                open={openPanel === 'date'}
                onOpenChange={setDateOpen}
                buttonRef={dateToggleRef}
              />
            }
          />
          <CategoryPanel
            id={categoryPanelId}
            open={openPanel === 'category'}
            selected={categories}
            onToggle={onToggleCategory}
            onClearAll={onClearCategories}
            onClose={closeCategoryPanel}
          />
        </section>

        <main className={`content-column ${styles.main}`}>
          <div className={styles.intro}>
            <h1 className={styles.title}>{pageTitle(categories, city, country)}</h1>
            <p className={styles.summary}>
              {pluralEvents(results.length)}
              {hiddenUnknownPrice > 0 && (
                <span className={styles.hidden}>
                  <span className="visually-hidden">, </span>
                  {hiddenUnknownMessage(hiddenUnknownPrice)}
                </span>
              )}
            </p>
          </div>

          <ActiveFilters
            chips={chips}
            onClearAll={onClearAll}
            clearAllFocusRef={categoryToggleRef}
          />
          <ResultsStatus count={results.length} hiddenUnknownPrice={hiddenUnknownPrice} />

          <div id="results" ref={resultsRef} tabIndex={-1} className={styles.results}>
            {results.length > 0 && date.kind === 'any' && (
              // No date chosen: one continuous list, still in date order.
              <section aria-labelledby="all-events-heading">
                <h2 id="all-events-heading" className="visually-hidden">
                  Seznam akcí
                </h2>
                <EventGrid events={results} now={DEMO_NOW} />
              </section>
            )}
            {results.length > 0 &&
              date.kind !== 'any' &&
              // A date is chosen: split by day ("Dnes", "Zítra", …).
              groups.map((group) => <EventSection key={group.day} group={group} now={DEMO_NOW} />)}
            {results.length === 0 && (
              <EmptyState
                suggestions={suggestions}
                priceLabel={priceLabel(price, country)}
                dateLabel={dateFilterLabel(date)}
                onClearDate={fromEmptyState(onClearDate)}
                wholeCountryLabel={ALL_CITIES_LABEL}
                onClearPrice={fromEmptyState(onClearPrice)}
                onClearCategories={fromEmptyState(onClearCategories)}
                onClearCity={fromEmptyState(() => onSetCity(null))}
                onClearAll={fromEmptyState(onClearAll)}
              />
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
