import type { RefObject } from 'react'
import type { CountryId } from '../types'
import { COUNTRIES, countryById, isCountryId } from '../data/countries'
import { NavDropdown } from './NavDropdown'
import { ChoiceList } from './ChoiceList'

interface Props {
  value: CountryId
  onChange: (country: CountryId) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

const CHOICES = COUNTRIES.map((c) => ({ key: c.id, label: c.name }))

/**
 * GoOut's first sub-nav item: Česko / Slovensko. Location context like the city,
 * so the button stays black rather than "active" blue.
 */
export function CountryDropdown({ value, onChange, open, onOpenChange, buttonRef }: Props) {
  return (
    <NavDropdown
      label={countryById(value).name}
      srPrefix="Země: "
      active={false}
      open={open}
      onOpenChange={onOpenChange}
      buttonRef={buttonRef}
    >
      <ChoiceList
        legend="Země"
        name="country"
        choices={CHOICES}
        value={value}
        onChange={(key) => {
          if (isCountryId(key)) onChange(key)
        }}
      />
    </NavDropdown>
  )
}
