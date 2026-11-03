import type { CategoryId } from '../types'
import { ALL_CATEGORIES, CATEGORIES } from '../data/categories'
import { FilterPanel } from './FilterPanel'
import { FilterOption, OptionVisual } from './FilterOption'
import styles from './FilterPanel.module.css'

interface Props {
  id: string
  open: boolean
  selected: readonly CategoryId[]
  onToggle: (id: CategoryId) => void
  onClearAll: () => void
  onClose: () => void
}

/**
 * Multi-select categories (checkboxes, OR logic). "Všechny akce" is a button that
 * clears the selection, pressed while nothing is selected.
 */
export function CategoryPanel({ id, open, selected, onToggle, onClearAll, onClose }: Props) {
  return (
    <FilterPanel id={id} open={open} onClose={onClose}>
      <fieldset className={styles.fieldset}>
        <legend className="visually-hidden">Kategorie (lze vybrat více)</legend>
        <ul className={styles.list}>
          <li>
            <button
              type="button"
              className={styles.option}
              aria-pressed={selected.length === 0}
              onClick={onClearAll}
            >
              <OptionVisual icon={ALL_CATEGORIES.icon} label={ALL_CATEGORIES.label} />
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <FilterOption
              key={c.id}
              type="checkbox"
              name="category"
              value={c.id}
              checked={selected.includes(c.id)}
              onChange={() => onToggle(c.id)}
              icon={c.icon}
              label={c.label}
            />
          ))}
        </ul>
      </fieldset>
    </FilterPanel>
  )
}
