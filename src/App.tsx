import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { EVENTS, DEMO_NOW } from './data/events'
import { categoryLabel } from './data/categories'
import {
  filterEvents,
  hasClearableFilters,
  relaxSuggestions,
  type RelaxSuggestion,
} from './lib/filterEvents'
import { groupByDay } from './lib/groupEvents'
import { hiddenUnknownMessage, pluralEvents } from './lib/format'
import { categorySummary, pageTitle } from './lib/categorySelection'
import { priceLabel } from './lib/priceFilter'
import { useFilters } from './hooks/useFilters'
import { PageShell } from './components/PageShell'
import { SubNav } from './components/SubNav'
import { CategoryPanel } from './components/CategoryPanel'
import { CategoryToggle } from './components/CategoryToggle'
import { PriceDropdown } from './components/PriceDropdown'
import { CityDropdown } from './components/CityDropdown'
import { CountryDropdown } from './components/CountryDropdown'
import { DateDropdown } from './components/DateDropdown'
import { SortDropdown } from './components/SortDropdown'
import { EditorsPickToggle } from './components/EditorsPickToggle'
import { sortLabel } from './lib/sort'
import { dateFilterLabel } from './lib/dateFilter'
import { cityName } from './lib/citySearch'
import { ActiveFilters, type FilterChip } from './components/ActiveFilters'
import { ResultsStatus } from './components/ResultsStatus'
import { EventSection } from './components/EventSection'
import { EventGrid } from './components/EventGrid'
import { EmptyState } from './components/EmptyState'
import styles from './App.module.css'

type PanelName = 'country' | 'city' | 'category' | 'price' | 'date' | 'sort'

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
    onSetEditorsPick,
    onSetSort,
    onClearAll,
  } = useFilters(DEMO_NOW)

  // One open at a time: a dropdown (country, city, price, date) or the category panel.
  const [openPanel, setOpenPanel] = useState<PanelName | null>(null)
  const categoryPanelId = useId()
  const categoryToggleRef = useRef<HTMLButtonElement>(null)
  const priceToggleRef = useRef<HTMLButtonElement>(null)
  const cityToggleRef = useRef<HTMLButtonElement>(null)
  const countryToggleRef = useRef<HTMLButtonElement>(null)
  const dateToggleRef = useRef<HTMLButtonElement>(null)
  const sortToggleRef = useRef<HTMLButtonElement>(null)
  const editorsPickRef = useRef<HTMLButtonElement>(null)
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

  const { categories, price, city, country, date, editorsPick, sort } = filters
  // Day headings only make sense for a date-ordered list with a chosen date.
  const splitByDay = date.kind !== 'any' && sort === 'upcoming'
  const priceActive = price.kind !== 'any'

  // One open/close setter per panel. Stable identities: the dropdowns and the category
  // panel subscribe to outside clicks with them.
  const setPanelOpen = useMemo(() => {
    const setter = (name: PanelName) => (open: boolean) =>
      setOpenPanel((current) => (open ? name : current === name ? null : current))
    return {
      country: setter('country'),
      city: setter('city'),
      category: setter('category'),
      price: setter('price'),
      date: setter('date'),
      sort: setter('sort'),
    } satisfies Record<PanelName, (open: boolean) => void>
  }, [])

  const closeCategoryPanel = useCallback(
    (returnFocus: boolean) => {
      setPanelOpen.category(false)
      if (returnFocus) categoryToggleRef.current?.focus()
    },
    [setPanelOpen],
  )

  const relax: Record<RelaxSuggestion['kind'], () => void> = {
    editorsPick: () => onSetEditorsPick(false),
    date: onClearDate,
    price: onClearPrice,
    categories: onClearCategories,
    city: () => onSetCity(null),
  }

  /** Empty-state buttons disappear once results return; move focus to the results. */
  function leaveEmptyState(action: () => void) {
    action()
    resultsRef.current?.focus()
  }

  // Read out with the result count: "Praha, Koncerty, Zdarma, Tento víkend".
  const announcementContext = [
    cityName(city),
    ...categories.map(categoryLabel),
    ...(priceActive ? [priceLabel(price, country)] : []),
    ...(date.kind !== 'any' ? [dateFilterLabel(date)] : []),
    ...(editorsPick ? ['jen redakční tipy'] : []),
    ...(sort !== 'upcoming' ? [`řazeno: ${sortLabel(sort)}`] : []),
  ].join(', ')

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
    ...(editorsPick
      ? [
          {
            key: 'editorsPick',
            label: 'Redakční tipy',
            onRemove: () => onSetEditorsPick(false),
            fallbackFocusRef: editorsPickRef,
          },
        ]
      : []),
  ]

  return (
    <PageShell current="events" skipTarget="results" skipLabel="Přeskočit na akce">
        <section aria-label="Filtry">
          <SubNav
            country={
              <CountryDropdown
                value={country}
                onChange={onSetCountry}
                open={openPanel === 'country'}
                onOpenChange={setPanelOpen.country}
                buttonRef={countryToggleRef}
              />
            }
            city={
              <CityDropdown
                value={city}
                onChange={onSetCity}
                country={country}
                open={openPanel === 'city'}
                onOpenChange={setPanelOpen.city}
                buttonRef={cityToggleRef}
              />
            }
            category={
              <CategoryToggle
                srPrefix="Kategorie: "
                summary={categorySummary(categories)}
                active={categories.length > 0}
                panelId={categoryPanelId}
                expanded={openPanel === 'category'}
                onToggle={() => setPanelOpen.category(openPanel !== 'category')}
                buttonRef={categoryToggleRef}
              />
            }
            price={
              <PriceDropdown
                value={price}
                onChange={onSetPrice}
                country={country}
                open={openPanel === 'price'}
                onOpenChange={setPanelOpen.price}
                buttonRef={priceToggleRef}
              />
            }
            date={
              <DateDropdown
                value={date}
                onChange={onSetDate}
                now={DEMO_NOW}
                open={openPanel === 'date'}
                onOpenChange={setPanelOpen.date}
                buttonRef={dateToggleRef}
              />
            }
            end={
              <>
                <EditorsPickToggle
                  pressed={editorsPick}
                  onChange={onSetEditorsPick}
                  buttonRef={editorsPickRef}
                />
                <SortDropdown
                  value={sort}
                  onChange={onSetSort}
                  open={openPanel === 'sort'}
                  onOpenChange={setPanelOpen.sort}
                  buttonRef={sortToggleRef}
                />
              </>
            }
          />
          <CategoryPanel
            id={categoryPanelId}
            open={openPanel === 'category'}
            selected={categories}
            onToggle={onToggleCategory}
            onClearAll={onClearCategories}
            onClose={closeCategoryPanel}
            toggleRef={categoryToggleRef}
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
          <ResultsStatus
            count={results.length}
            hiddenUnknownPrice={hiddenUnknownPrice}
            context={announcementContext}
          />

          <div id="results" ref={resultsRef} tabIndex={-1} className={styles.results}>
            {results.length > 0 && !splitByDay && (
              // No date chosen, or not sorted by date: one continuous list in the chosen order.
              <section aria-labelledby="all-events-heading">
                <h2 id="all-events-heading" className="visually-hidden">
                  Seznam akcí
                </h2>
                <EventGrid events={results} now={DEMO_NOW} showInterested={sort === 'popular'} />
              </section>
            )}
            {results.length > 0 &&
              splitByDay &&
              // A date is chosen: split by day ("Dnes", "Zítra", …).
              groups.map((group) => <EventSection key={group.day} group={group} now={DEMO_NOW} />)}
            {results.length === 0 && (
              <EmptyState
                suggestions={suggestions}
                priceLabel={priceLabel(price, country)}
                dateLabel={dateFilterLabel(date)}
                onRelax={(kind) => leaveEmptyState(relax[kind])}
                onClearAll={
                  hasClearableFilters(filters) ? () => leaveEmptyState(onClearAll) : undefined
                }
              />
            )}
          </div>
        </main>
    </PageShell>
  )
}
