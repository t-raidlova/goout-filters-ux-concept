import { useId, type KeyboardEvent, type MouseEvent } from 'react'
import { useCloseDropdown } from './dropdownContext'
import styles from './ChoiceList.module.css'

export interface Choice {
  key: string
  label: string
}

interface Props {
  /** Group name for screen readers (visually hidden legend). */
  legend: string
  /** Radio group name. */
  name: string
  choices: readonly Choice[]
  value: string
  onChange: (key: string) => void
  /** Optional short note under the options. */
  hint?: string
}

/**
 * Single-choice list for a NavDropdown, built on native radios.
 * - Mouse/touch: clicking an option applies it and closes, like a <select>.
 * - Keyboard: arrows move and apply (native radios); Enter closes.
 */
export function ChoiceList({ legend, name, choices, value, onChange, hint }: Props) {
  const close = useCloseDropdown()
  const hintId = useId()

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      close()
    }
  }

  // detail > 0 = real pointer click; arrow keys and Space fire click with detail 0.
  function handleClick(e: MouseEvent) {
    if (e.detail > 0) close()
  }

  return (
    <fieldset
      className={styles.fieldset}
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
                onClick={handleClick}
              />
              <span className={styles.row}>
                {choice.label}
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
