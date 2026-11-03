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
import { ActiveFilters, type FilterChip } from './components/ActiveFilters'
import { ResultsStatus } from './components/ResultsStatus'
import { EventSection } from './components/EventSection'
import { EmptyState } from './components/EmptyState'
import { SiteFooter } from './components/SiteFooter'
import styles from './App.module.css'

type PanelName = 'category' | 'price'

export default function App() {
  const {
    filters,
    onToggleCategory,
    onRemoveCategory,
    onClearCategories,
    onSetPrice,
    onClearPrice,
    onClearAll,
  } = useFilters()

  // One open at a time: the category panel or the price dropdown.
  const [openPanel, setOpenPanel] = useState<PanelName | null>(null)
  const categoryPanelId = useId()
  const categoryToggleRef = useRef<HTMLButtonElement>(null)
  const priceToggleRef = useRef<HTMLButtonElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { results, hiddenUnknownPrice } = useMemo(
    () => filterEvents(EVENTS, filters, DEMO_NOW),
    [filters],
  )
  const groups = useMemo(() => groupByDay(results, DEMO_NOW), [results])
  const suggestions = useMemo(
    () => (results.length === 0 ? relaxSuggestions(EVENTS, filters, DEMO_NOW) : []),
    [results, filters],
  )

  const { categories, price } = filters
  const priceActive = price.kind !== 'any'

  function togglePanel(name: PanelName) {
    setOpenPanel((open) => (open === name ? null : name))
  }

  function closeCategoryPanel() {
    setOpenPanel(null)
    categoryToggleRef.current?.focus()
  }

  // Stable identity: the dropdown subscribes to outside clicks with it.
  const setPriceOpen = useCallback((open: boolean) => {
    setOpenPanel((current) => (open ? 'price' : current === 'price' ? null : current))
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
            label: priceLabel(price),
            onRemove: onClearPrice,
            fallbackFocusRef: priceToggleRef,
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
                open={openPanel === 'price'}
                onOpenChange={setPriceOpen}
                buttonRef={priceToggleRef}
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
            <h1 className={styles.title}>{pageTitle(categories)}</h1>
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
            {groups.length > 0 ? (
              groups.map((group) => <EventSection key={group.day} group={group} now={DEMO_NOW} />)
            ) : (
              <EmptyState
                suggestions={suggestions}
                priceLabel={priceLabel(price)}
                onClearPrice={fromEmptyState(onClearPrice)}
                onClearCategories={fromEmptyState(onClearCategories)}
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
