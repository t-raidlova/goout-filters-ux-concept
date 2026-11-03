import {
  useEffect,
  useId,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react'
import type { PriceFilter } from '../types'
import { PRICE_OPTIONS, priceKey, priceLabel, type PriceOption } from '../lib/priceFilter'
import { Icon } from './Icon'
import navStyles from './SubNav.module.css'
import styles from './PriceDropdown.module.css'

interface Props {
  value: PriceFilter
  onChange: (price: PriceFilter) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

/**
 * Compact "Cena" dropdown in the sub-nav: a disclosure button and a small popover
 * holding a native radio group (single choice, caps are cumulative).
 *
 * - Mouse/touch: clicking an option applies it and closes the popover, like a <select>.
 * - Keyboard: arrows move and apply (native radios); Enter or Escape closes and
 *   returns focus to the button; Tab out or clicking outside also closes.
 */
export function PriceDropdown({ value, onChange, open, onOpenChange, buttonRef }: Props) {
  const rootRef = useRef<HTMLLIElement>(null)
  const popoverId = useId()
  const hintId = useId()
  const current = priceKey(value)
  const active = value.kind !== 'any'

  // Click/tap outside closes without moving focus.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onOpenChange])

  function closeAndReturnFocus() {
    onOpenChange(false)
    buttonRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!open) return
    const inPopover = (e.target as HTMLElement).closest(`.${styles.popover}`)
    if (e.key === 'Escape' || (e.key === 'Enter' && inPopover)) {
      e.preventDefault()
      e.stopPropagation()
      closeAndReturnFocus()
    }
  }

  // Tabbing away closes the popover.
  function handleBlur(e: FocusEvent) {
    const next = e.relatedTarget as Node | null
    if (open && next && !rootRef.current?.contains(next)) onOpenChange(false)
  }

  // detail > 0 = real pointer click; arrow keys and Space fire click with detail 0.
  function handleOptionClick(e: MouseEvent) {
    if (e.detail > 0) closeAndReturnFocus()
  }

  return (
    <li ref={rootRef} className={styles.root} onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={`${navStyles.item} ${navStyles.button}`}
        data-active={active || open}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => onOpenChange(!open)}
      >
        Cena
        {active && (
          <span className={styles.badge}>
            <span className="visually-hidden">, </span>
            {lowerFirst(priceLabel(value))}
          </span>
        )}
        <Icon
          name="chevronDown"
          size={14}
          className={`${navStyles.chevron} ${open ? navStyles.chevronOpen : ''}`}
        />
      </button>

      <div id={popoverId} className={styles.popover} hidden={!open}>
        <fieldset className={styles.fieldset} aria-describedby={hintId}>
          <legend className="visually-hidden">Cena vstupenky</legend>
          <ul className={styles.options}>
            {PRICE_OPTIONS.map((option) => (
              <Option
                key={option.key}
                option={option}
                checked={current === option.key}
                onSelect={() => onChange(option.filter)}
                onClick={handleOptionClick}
              />
            ))}
          </ul>
          <p id={hintId} className={styles.hint}>
            Podle nejlevnější vstupenky. Akce bez uvedené ceny se skryjí.
          </p>
        </fieldset>
      </div>
    </li>
  )
}

function Option({
  option,
  checked,
  onSelect,
  onClick,
}: {
  option: PriceOption
  checked: boolean
  onSelect: () => void
  onClick: (e: MouseEvent) => void
}) {
  return (
    <li>
      <label className={styles.option}>
        <input
          type="radio"
          name="price"
          value={option.key}
          className={styles.input}
          checked={checked}
          onChange={onSelect}
          onClick={onClick}
        />
        <span className={styles.row}>
          {option.label}
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
  )
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
