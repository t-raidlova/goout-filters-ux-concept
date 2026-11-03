import type { ReactNode, Ref } from 'react'
import { Icon } from './Icon'
import styles from './SubNav.module.css'

export interface FilterToggleProps {
  /** Visually hidden text before the visible label, e.g. "Kategorie: ". */
  srPrefix?: string
  /** Visible text on the bar, e.g. "Koncerty +1". */
  summary: string
  /** A non-default value is selected. */
  active: boolean
  panelId: string
  expanded: boolean
  onToggle: () => void
  buttonRef: Ref<HTMLButtonElement>
}

interface Props {
  category: FilterToggleProps
  /** The "Cena" dropdown (renders its own <li>). */
  price: ReactNode
}

/**
 * GoOut's location / category / date bar, extended with a compact "Cena" dropdown.
 * Category opens a full-width panel; location and date are static.
 */
export function SubNav({ category, price }: Props) {
  return (
    <div className={styles.bar}>
      <ul className={`content-column ${styles.list}`}>
        <StaticItem label="Česko" />
        <StaticItem label="Praha" />
        <FilterToggle {...category} />
        {price}
        <StaticItem label="Kdykoliv" />
      </ul>
    </div>
  )
}

function FilterToggle({ srPrefix, summary, active, panelId, expanded, onToggle, buttonRef }: FilterToggleProps) {
  return (
    <li>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.item} ${styles.button}`}
        data-active={active || expanded}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {srPrefix && <span className="visually-hidden">{srPrefix}</span>}
        {summary}
        <Icon
          name="chevronDown"
          size={14}
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}
        />
      </button>
    </li>
  )
}

function StaticItem({ label }: { label: string }) {
  return (
    <li className={styles.item}>
      {label}
      <Icon name="chevronDown" size={14} className={styles.chevron} />
    </li>
  )
}
