import type { Ref } from 'react'
import styles from './EditorsPickToggle.module.css'

interface Props {
  pressed: boolean
  onChange: (pressed: boolean) => void
  /** Focus target when its chip is removed. */
  buttonRef?: Ref<HTMLButtonElement>
}

/**
 * "Redakční tipy" on/off filter. A toggle button (aria-pressed) rather than a sort option,
 * so it combines with any order: e.g. editors' picks sorted by popularity.
 */
export function EditorsPickToggle({ pressed, onChange, buttonRef }: Props) {
  return (
    <li>
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-pressed={pressed}
        onClick={() => onChange(!pressed)}
      >
        <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          {pressed ? (
            <path d="m3 8.5 3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M8 1.8 9.9 5.6l4.2.6-3 2.9.7 4.1L8 11.3l-3.8 2 .7-4.1-3-2.9 4.2-.6z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          )}
        </svg>
        Redakční tipy
      </button>
    </li>
  )
}
