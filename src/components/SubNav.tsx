import type { Ref } from 'react'
import { Icon } from './Icon'
import styles from './SubNav.module.css'

interface Props {
  categorySummary: string
  categoryActive: boolean
  panelId: string
  panelOpen: boolean
  onTogglePanel: () => void
  toggleRef: Ref<HTMLButtonElement>
}

/**
 * GoOut's location / category / date bar. The category item is a disclosure
 * button for the category panel; location and date are static for now.
 */
export function SubNav({
  categorySummary,
  categoryActive,
  panelId,
  panelOpen,
  onTogglePanel,
  toggleRef,
}: Props) {
  return (
    <div className={styles.bar}>
      <ul className={`content-column ${styles.list}`}>
        <StaticItem label="Česko" />
        <StaticItem label="Praha" />
        <li>
          <button
            ref={toggleRef}
            type="button"
            className={`${styles.item} ${styles.button}`}
            data-active={categoryActive || panelOpen}
            aria-expanded={panelOpen}
            aria-controls={panelId}
            onClick={onTogglePanel}
          >
            <span className="visually-hidden">Kategorie: </span>
            {categorySummary}
            <Icon
              name="chevronDown"
              size={14}
              className={`${styles.chevron} ${panelOpen ? styles.chevronOpen : ''}`}
            />
          </button>
        </li>
        <StaticItem label="Kdykoliv" />
      </ul>
    </div>
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
