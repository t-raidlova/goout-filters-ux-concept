import type { RefObject } from 'react'
import type { SortKey } from '../types'
import { SORT_OPTIONS, sortLabel } from '../lib/sort'
import { NavDropdown } from './NavDropdown'
import { ChoiceList } from './ChoiceList'
import styles from './SortDropdown.module.css'

interface Props {
  value: SortKey
  onChange: (sort: SortKey) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

const CHOICES = SORT_OPTIONS.map((o) => ({ key: o.key, label: o.label, description: o.description }))

/**
 * "Řadit: Blížící se ▾" on the right of the bar, where GoOut has "Redakční tipy ▾".
 * Only orders results; editors' picks are a separate filter (EditorsPickToggle).
 */
export function SortDropdown({ value, onChange, open, onOpenChange, buttonRef }: Props) {
  return (
    <NavDropdown
      label={
        <>
          <span className={styles.prefix}>Řadit:</span> {sortLabel(value)}
        </>
      }
      active={false /* ordering, not filtering: no "active" blue */}
      open={open}
      onOpenChange={onOpenChange}
      buttonRef={buttonRef}
      align="end"
    >
      <ChoiceList
        legend="Řadit akce"
        name="sort"
        choices={CHOICES}
        value={value}
        onChange={onChange}
        width={260}
      />
    </NavDropdown>
  )
}
