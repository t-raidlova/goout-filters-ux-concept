import { useId, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { useCloseDropdown } from './dropdownContext'
import styles from './ChoiceList.module.css'

export interface Choice<K extends string = string> {
  key: K
  label: string
  /** Secondary text on the right, e.g. a date range "6. 11. – 8. 11.". */
  detail?: string
  /** One-line explanation under the label, e.g. "Podle počtu zájemců". */
  description?: string
  /** Choosing it doesn't close the dropdown (e.g. "Jiné datum" reveals more fields). */
  keepsOpen?: boolean
}

interface Props<K extends string> {
  /** Group name for screen readers (visually hidden legend). */
  legend: string
  /** Radio group name. */
  name: string
  choices: readonly Choice<K>[]
  value: K
  onChange: (key: K) => void
  /** Optional short note under the options. */
  hint?: string
  /** Width of the list in px (default 240). */
  width?: number
}

/**
 * Single-choice list for a NavDropdown, built on native radios.
 * - Mouse/touch: clicking an option applies it and closes, like a <select>.
 * - Keyboard: arrows move and apply (native radios); Enter closes.
 */
export function ChoiceList<K extends string>({
  legend,
  name,
  choices,
  value,
  onChange,
  hint,
  width,
}: Props<K>) {
  const close = useCloseDropdown()
  const hintId = useId()

  const keepsOpen = (key: K) => choices.find((c) => c.key === key)?.keepsOpen ?? false

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !keepsOpen(value)) {
      e.preventDefault()
      close()
    }
  }

  // detail > 0 = real pointer click; arrow keys and Space fire click with detail 0.
  function handleClick(e: MouseEvent<HTMLInputElement>, key: K) {
    if (e.detail > 0 && !keepsOpen(key)) close()
  }

  return (
    <fieldset
      className={styles.fieldset}
      style={width ? ({ '--list-width': `${width}px` } as CSSProperties) : undefined}
      aria-describedby={hint ? hintId : undefined}
      onKeyDown={handleKeyDown}
    >
      <legend className="visually-hidden">{legend}</legend>
      <ul>
        {choices.map((choice) => (
          <li key={choice.key}>
            <label className={styles.option}>
              <input
                type="radio"
                name={name}
                value={choice.key}
                className={styles.input}
                checked={value === choice.key}
                onChange={() => onChange(choice.key)}
                onClick={(e) => handleClick(e, choice.key)}
              />
              <span className={styles.row}>
                <span className={styles.label}>
                  {choice.label}
                  {choice.description && (
                    <span className={styles.description}>{choice.description}</span>
                  )}
                </span>
                {choice.detail && <span className={styles.detail}>{choice.detail}</span>}
                <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="m3 8.5 3.2 3.2L13 4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </fieldset>
  )
}
