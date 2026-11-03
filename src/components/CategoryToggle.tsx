import type { Ref } from 'react'
import { Icon } from './Icon'
import styles from './SubNav.module.css'

interface Props {
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

/** "Kategorie: Koncerty +1 ▾" in the sub-nav: a disclosure button for the full-width CategoryPanel. */
export function CategoryToggle({ srPrefix, summary, active, panelId, expanded, onToggle, buttonRef }: Props) {
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
