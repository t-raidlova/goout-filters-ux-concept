import type { KeyboardEvent } from 'react'
import type { CategoryId } from '../types'
import { ALL_CATEGORIES, CATEGORIES } from '../data/categories'
import styles from './CategoryPanel.module.css'

interface Props {
  id: string
  open: boolean
  selected: readonly CategoryId[]
  onToggle: (id: CategoryId) => void
  onClearAll: () => void
  /** Escape pressed inside the panel. */
  onClose: () => void
}

/**
 * GoOut-style category row. Each category is a native checkbox (multi-select, OR logic);
 * "Všechny akce" is a button that clears the selection.
 */
export function CategoryPanel({ id, open, selected, onToggle, onClearAll, onClose }: Props) {
  const noneSelected = selected.length === 0

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }

  return (
    <div id={id} className={styles.panel} hidden={!open} onKeyDown={handleKeyDown}>
      <fieldset className={`content-column ${styles.fieldset}`}>
        <legend className="visually-hidden">Kategorie (lze vybrat více)</legend>
        <ul className={styles.list}>
          <li>
            <button
              type="button"
              className={styles.option}
              aria-pressed={noneSelected}
              onClick={onClearAll}
            >
              <span className={styles.circle} aria-hidden="true">
                {ALL_CATEGORIES.icon}
                <Check />
              </span>
              <span className={styles.label}>{ALL_CATEGORIES.label}</span>
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  className={styles.input}
                  name="category"
                  value={c.id}
                  checked={selected.includes(c.id)}
                  onChange={() => onToggle(c.id)}
                />
                <span className={styles.circle} aria-hidden="true">
                  {c.icon}
                  <Check />
                </span>
                <span className={styles.label}>{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  )
}

/** Checkmark badge so the selected state never relies on colour alone. */
function Check() {
  return (
    <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="8" />
      <path d="m4.5 8.2 2.3 2.3 4.7-4.9" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
