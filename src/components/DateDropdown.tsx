import { useId, useState, type FormEvent, type RefObject } from 'react'
import type { DateFilter, DatePreset } from '../types'
import {
  CUSTOM_DATE_LABEL,
  DATE_PRESETS,
  dateFilterLabel,
  dateWindow,
  formatRange,
  rangeError,
} from '../lib/dateFilter'
import { pragueDayKey } from '../lib/dates'
import { NavDropdown } from './NavDropdown'
import { ChoiceList, type Choice } from './ChoiceList'
import { useCloseDropdown } from './dropdownContext'
import styles from './DateDropdown.module.css'

interface Props {
  value: DateFilter
  onChange: (date: DateFilter) => void
  /** Demo clock; presets and the date-field minimum are relative to it. */
  now: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

/**
 * GoOut's "Kdykoliv" dropdown: Kdykoliv, Dnes, Zítra, Tento týden, Tento víkend
 * (each with its dates on the right) and "Jiné datum", which reveals two native
 * date fields for a custom range.
 */
export function DateDropdown({ value, onChange, now, open, onOpenChange, buttonRef }: Props) {
  const active = value.kind !== 'any'
  return (
    <NavDropdown
      label={dateFilterLabel(value)}
      srPrefix="Datum: "
      active={active}
      open={open}
      onOpenChange={onOpenChange}
      buttonRef={buttonRef}
    >
      <DatePicker value={value} onChange={onChange} now={now} />
    </NavDropdown>
  )
}

const CUSTOM_KEY = 'range'

function DatePicker({ value, onChange, now }: Pick<Props, 'value' | 'onChange' | 'now'>) {
  const close = useCloseDropdown()
  const today = pragueDayKey(now)
  const [showCustom, setShowCustom] = useState(value.kind === 'range')
  const [from, setFrom] = useState(value.kind === 'range' ? value.from : today)
  const [to, setTo] = useState(value.kind === 'range' ? value.to : today)
  const [error, setError] = useState<string | null>(null)
  const fromId = useId()
  const toId = useId()
  const errorId = useId()

  const choices: Choice[] = [
    ...DATE_PRESETS.map((p) => {
      const range = dateWindow({ kind: p.kind }, now)
      return { key: p.kind, label: p.label, detail: range ? formatRange(range) : undefined }
    }),
    {
      key: CUSTOM_KEY,
      label: CUSTOM_DATE_LABEL,
      detail: value.kind === 'range' ? formatRange(value) : 'Vybrat dny',
      keepsOpen: true,
    },
  ]

  function handleChoice(key: string) {
    if (key === CUSTOM_KEY) {
      // Reveal the date fields; the filter changes only when the range is applied.
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    setError(null)
    onChange({ kind: key as DatePreset })
  }

  function applyRange(e: FormEvent) {
    e.preventDefault()
    const problem = rangeError(from, to, now)
    setError(problem)
    if (problem) return
    onChange({ kind: 'range', from, to })
    close()
  }

  return (
    <div className={styles.picker}>
      <ChoiceList
        legend="Datum"
        name="date"
        choices={choices}
        value={showCustom ? CUSTOM_KEY : value.kind}
        onChange={handleChoice}
        width={340}
      />

      {showCustom && (
        <form className={styles.custom} onSubmit={applyRange} noValidate>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor={fromId}>Od</label>
              <input
                id={fromId}
                type="date"
                className={styles.input}
                value={from}
                min={today}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(e) => {
                  setFrom(e.target.value)
                  // Keep the range valid while picking: move "Do" along if needed.
                  if (e.target.value && to < e.target.value) setTo(e.target.value)
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={toId}>Do</label>
              <input
                id={toId}
                type="date"
                className={styles.input}
                value={to}
                min={from || today}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p id={errorId} className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className={styles.apply}>
            Použít
          </button>
        </form>
      )}
    </div>
  )
}
