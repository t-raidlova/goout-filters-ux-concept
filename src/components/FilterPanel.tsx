import { useEffect, useRef, type FocusEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import styles from './FilterPanel.module.css'

interface Props {
  id: string
  open: boolean
  /** Close the panel; `returnFocus` moves focus back to the toggle button. */
  onClose: (returnFocus: boolean) => void
  /** The disclosure button in the bar that opens this panel. */
  toggleRef: RefObject<HTMLElement | null>
  children: ReactNode
}

const FOCUSABLE = 'button, input'

function firstFocusable(panel: HTMLElement | null): HTMLElement | null {
  return panel?.querySelector<HTMLElement>(FOCUSABLE) ?? null
}

/** Outside both the panel and its toggle (the toggle handles its own clicks). */
function isOutside(node: Node, panel: HTMLElement | null, toggle: HTMLElement | null): boolean {
  return !panel?.contains(node) && !toggle?.contains(node)
}

/**
 * White panel under the sub-nav, opened by a disclosure button in the bar.
 *
 * The panel follows the whole bar in the DOM (it spans the full width under it), so
 * Tab from its button would otherwise reach Cena, Datum, … before the options. To keep
 * a logical order (button → options → results):
 * - opening moves focus to the first option;
 * - Shift+Tab from the first option, or Escape, closes and returns focus to the button;
 * - Tab past the last option continues to the results, and the panel closes.
 * A click outside closes it without moving focus, like the dropdowns.
 */
export function FilterPanel({ id, open, onClose, toggleRef, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) firstFocusable(panelRef.current)?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (isOutside(e.target as Node, panelRef.current, toggleRef.current)) onClose(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onClose, toggleRef])

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose(true)
    } else if (e.key === 'Tab' && e.shiftKey && e.target === firstFocusable(panelRef.current)) {
      e.preventDefault()
      onClose(true)
    }
  }

  function handleBlur(e: FocusEvent) {
    const next = e.relatedTarget as Node | null
    if (open && next && isOutside(next, panelRef.current, toggleRef.current)) onClose(false)
  }

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.panel}
      hidden={!open}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <div className={`content-column ${styles.inner}`}>{children}</div>
    </div>
  )
}
