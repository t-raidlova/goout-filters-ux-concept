import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { Icon } from './Icon'
import { DropdownCloseContext } from './dropdownContext'
import navStyles from './SubNav.module.css'
import styles from './NavDropdown.module.css'

interface Props {
  /** Button content, e.g. "Praha" or "Cena" plus a badge. */
  label: ReactNode
  /** Visually hidden text before the label, e.g. "Město: ". */
  srPrefix?: string
  /** A non-default value is selected (button turns blue). */
  active: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
  /** Element to focus when the popover opens, e.g. a search field. */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Popover content. It can close the dropdown with `useCloseDropdown()`. */
  children: ReactNode
}

/**
 * A sub-nav item that opens a compact popover under it (disclosure pattern).
 * Escape closes and returns focus to the button; Tab out or a click outside closes
 * without moving focus. Renders its own <li> for the sub-nav list.
 */
export function NavDropdown({
  label,
  srPrefix,
  active,
  open,
  onOpenChange,
  buttonRef,
  initialFocusRef,
  children,
}: Props) {
  const rootRef = useRef<HTMLLIElement>(null)
  const popoverId = useId()

  // Click/tap outside closes without moving focus.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onOpenChange])

  // Move focus into the popover when it opens, if asked to.
  useEffect(() => {
    if (open) initialFocusRef?.current?.focus()
  }, [open, initialFocusRef])

  const close = useCallback(() => {
    onOpenChange(false)
    buttonRef.current?.focus()
  }, [onOpenChange, buttonRef])

  function handleKeyDown(e: KeyboardEvent) {
    if (open && e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  // Tabbing away closes the popover.
  function handleBlur(e: FocusEvent) {
    const next = e.relatedTarget as Node | null
    if (open && next && !rootRef.current?.contains(next)) onOpenChange(false)
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
        {srPrefix && <span className="visually-hidden">{srPrefix}</span>}
        {label}
        <Icon
          name="chevronDown"
          size={14}
          className={`${navStyles.chevron} ${open ? navStyles.chevronOpen : ''}`}
        />
      </button>

      <div id={popoverId} className={styles.popover} hidden={!open}>
        {/* Mounted only while open, so each opening starts fresh (search text, scroll). */}
        {open && <DropdownCloseContext value={close}>{children}</DropdownCloseContext>}
      </div>
    </li>
  )
}
