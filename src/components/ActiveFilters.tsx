import { useEffect, useRef, type RefObject } from 'react'
import type { CategoryId } from '../types'
import { categoryLabel } from '../data/categories'
import styles from './ActiveFilters.module.css'

interface Props {
  selected: readonly CategoryId[]
  onRemove: (id: CategoryId) => void
  onClearAll: () => void
  /** Where focus goes when the last chip disappears (the category toggle). */
  fallbackFocusRef: RefObject<HTMLElement | null>
}

type FocusTarget = { kind: 'chip'; id: CategoryId } | { kind: 'fallback' } | null

/**
 * Summary of selected categories, each removable, plus "Zrušit vše".
 * Removing a chip keeps keyboard focus nearby instead of dropping it on <body>.
 */
export function ActiveFilters({ selected, onRemove, onClearAll, fallbackFocusRef }: Props) {
  const chipRefs = useRef(new Map<CategoryId, HTMLButtonElement>())
  // Set by a click handler, applied after the next commit when the DOM has updated.
  const pendingFocus = useRef<FocusTarget>(null)

  useEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    if (target.kind === 'chip') chipRefs.current.get(target.id)?.focus()
    else fallbackFocusRef.current?.focus()
  })

  if (selected.length === 0) return null

  function remove(id: CategoryId) {
    const index = selected.indexOf(id)
    const neighbour = selected[index + 1] ?? selected[index - 1]
    pendingFocus.current = neighbour ? { kind: 'chip', id: neighbour } : { kind: 'fallback' }
    onRemove(id)
  }

  function clearAll() {
    pendingFocus.current = { kind: 'fallback' }
    onClearAll()
  }

  return (
    <div className={styles.bar}>
      <h2 className="visually-hidden">Vybrané kategorie</h2>
      <ul className={styles.list}>
        {selected.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={styles.chip}
              ref={(el) => {
                if (el) chipRefs.current.set(id, el)
                else chipRefs.current.delete(id)
              }}
              aria-label={`Odebrat filtr: ${categoryLabel(id)}`}
              onClick={() => remove(id)}
            >
              {categoryLabel(id)}
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={styles.clear} onClick={clearAll}>
            Zrušit vše
          </button>
        </li>
      </ul>
    </div>
  )
}
