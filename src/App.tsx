import { useId, useMemo, useRef, useState } from 'react'
import { EVENTS, DEMO_NOW } from './data/events'
import { filterEvents } from './lib/filterEvents'
import { groupByDay } from './lib/groupEvents'
import { pluralEvents } from './lib/format'
import { categorySummary, pageTitle } from './lib/categorySelection'
import { useFilters } from './hooks/useFilters'
import { SiteHeader } from './components/SiteHeader'
import { SideNav } from './components/SideNav'
import { SubNav } from './components/SubNav'
import { CategoryPanel } from './components/CategoryPanel'
import { ActiveFilters } from './components/ActiveFilters'
import { ResultsStatus } from './components/ResultsStatus'
import { EventSection } from './components/EventSection'
import { EmptyState } from './components/EmptyState'
import { SiteFooter } from './components/SiteFooter'
import styles from './App.module.css'

export default function App() {
  const { filters, onToggleCategory, onRemoveCategory, onClearCategories } = useFilters()
  const [panelOpen, setPanelOpen] = useState(false)
  const panelId = useId()
  const categoryToggleRef = useRef<HTMLButtonElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { results } = useMemo(() => filterEvents(EVENTS, filters, DEMO_NOW), [filters])
  const groups = useMemo(() => groupByDay(results, DEMO_NOW), [results])
  const selected = filters.categories

  function closePanel() {
    setPanelOpen(false)
    categoryToggleRef.current?.focus()
  }

  function resetFromEmptyState() {
    onClearCategories()
    // The button that was clicked disappears; land on the results instead.
    resultsRef.current?.focus()
  }

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
            categorySummary={categorySummary(selected)}
            categoryActive={selected.length > 0}
            panelId={panelId}
            panelOpen={panelOpen}
            onTogglePanel={() => setPanelOpen((open) => !open)}
            toggleRef={categoryToggleRef}
          />
          <CategoryPanel
            id={panelId}
            open={panelOpen}
            selected={selected}
            onToggle={onToggleCategory}
            onClearAll={onClearCategories}
            onClose={closePanel}
          />
        </section>

        <main className={`content-column ${styles.main}`}>
          <div className={styles.intro}>
            <h1 className={styles.title}>{pageTitle(selected)}</h1>
            <p className={styles.summary}>{pluralEvents(results.length)}</p>
          </div>

          <ActiveFilters
            selected={selected}
            onRemove={onRemoveCategory}
            onClearAll={onClearCategories}
            fallbackFocusRef={categoryToggleRef}
          />
          <ResultsStatus count={results.length} />

          <div id="results" ref={resultsRef} tabIndex={-1} className={styles.results}>
            {groups.length > 0 ? (
              groups.map((group) => <EventSection key={group.day} group={group} now={DEMO_NOW} />)
            ) : (
              <EmptyState onReset={resetFromEmptyState} />
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
