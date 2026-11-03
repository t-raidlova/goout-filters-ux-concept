import type { RefObject } from 'react'
import type { CountryId, PriceFilter } from '../types'
import { priceKey, priceLabel, priceOptions } from '../lib/priceFilter'
import { NavDropdown } from './NavDropdown'
import { ChoiceList } from './ChoiceList'
import styles from './PriceDropdown.module.css'

interface Props {
  value: PriceFilter
  onChange: (price: PriceFilter) => void
  /** Sets the currency and caps (Kč / €). */
  country: CountryId
  open: boolean
  onOpenChange: (open: boolean) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

/** Compact "Cena" dropdown: single choice, caps are cumulative, in the country's currency. */
export function PriceDropdown({ value, onChange, country, open, onOpenChange, buttonRef }: Props) {
  const active = value.kind !== 'any'
  const options = priceOptions(country)

  return (
    <NavDropdown
      label={
        <>
          Cena
          {active && (
            <span className={styles.badge}>
              <span className="visually-hidden">, </span>
              {lowerFirst(priceLabel(value, country))}
            </span>
          )}
        </>
      }
      active={active}
      open={open}
      onOpenChange={onOpenChange}
      buttonRef={buttonRef}
    >
      <ChoiceList
        legend="Cena vstupenky"
        name="price"
        choices={options}
        value={priceKey(value)}
        onChange={(key) => {
          const option = options.find((o) => o.key === key)
          if (option) onChange(option.filter)
        }}
        hint="Podle nejlevnější vstupenky. Akce bez uvedené ceny se skryjí."
      />
    </NavDropdown>
  )
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
