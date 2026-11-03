import { createContext, useContext } from 'react'

/** Lets popover content close its NavDropdown (and return focus to its button). */
export const DropdownCloseContext = createContext<() => void>(() => {})

export function useCloseDropdown(): () => void {
  return useContext(DropdownCloseContext)
}
