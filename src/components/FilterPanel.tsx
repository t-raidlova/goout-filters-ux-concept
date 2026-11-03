import type { KeyboardEvent, ReactNode } from 'react'
import styles from './FilterPanel.module.css'

interface Props {
  id: string
  open: boolean
  /** Escape pressed inside the panel. */
  onClose: () => void
  children: ReactNode
}

/** White panel under the sub-nav, opened by a disclosure button in the bar. */
export function FilterPanel({ id, open, onClose, children }: Props) {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }

  return (
    <div id={id} className={styles.panel} hidden={!open} onKeyDown={handleKeyDown}>
      <div className={`content-column ${styles.inner}`}>{children}</div>
    </div>
  )
}
