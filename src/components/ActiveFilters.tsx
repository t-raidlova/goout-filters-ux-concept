import { useEffect, useRef, type RefObject } from 'react'
import styles from './ActiveFilters.module.css'

export interface FilterChip {
  /** Unique across all filters, e.g. "cat:concerts" or "price". */
  key: string
  label: string
  onRemove: () => void
  /** Where focus goes if this was the last chip (the filter's sub-nav toggle). */
  fallbackFocusRef: RefObject<HTMLElement | null>
}

interface Props {
  chips: readonly FilterChip[]
  onClearAll: () => void
  /** Where focus goes after "Zrušit vše". */
  clearAllFocusRef: RefObject<HTMLElement | null>
}

/**
 * Removable summary of every active filter, plus "Zrušit vše".
 * Removing a chip keeps keyboard focus nearby instead of dropping it on <body>.
 */
export function ActiveFilters({ chips, onClearAll, clearAllFocusRef }: Props) {
  const chipRefs = useRef(new Map<string, HTMLButtonElement>())
  // Set by a click handler, applied after the next commit when the DOM has updated.
  const pendingFocus = useRef<(() => void) | null>(null)

  useEffect(() => {
    const focus = pendingFocus.current
    pendingFocus.current = null
    focus?.()
  })

  if (chips.length === 0) return null

  function remove(chip: FilterChip, index: number) {
    const neighbour = chips[index + 1] ?? chips[index - 1]
    pendingFocus.current = neighbour
      ? () => chipRefs.current.get(neighbour.key)?.focus()
      : () => chip.fallbackFocusRef.current?.focus()
    chip.onRemove()
  }

  function clearAll() {
    pendingFocus.current = () => clearAllFocusRef.current?.focus()
    onClearAll()
  }

  return (
    <div className={styles.bar}>
      <h2 className="visually-hidden">Aktivní filtry</h2>
      <ul className={styles.list}>
        {chips.map((chip, index) => (
          <li key={chip.key}>
            <button
              type="button"
              className={styles.chip}
              ref={(el) => {
                if (el) chipRefs.current.set(chip.key, el)
                else chipRefs.current.delete(chip.key)
              }}
              aria-label={`Odebrat filtr: ${chip.label}`}
              onClick={() => remove(chip, index)}
            >
              {chip.label}
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
