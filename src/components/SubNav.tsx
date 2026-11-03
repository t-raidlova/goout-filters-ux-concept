import type { ReactNode } from 'react'
import styles from './SubNav.module.css'

interface Props {
  /** The country dropdown (renders its own <li>). */
  country: ReactNode
  /** The city dropdown (renders its own <li>). */
  city: ReactNode
  /** The "Kategorie" disclosure button (renders its own <li>). */
  category: ReactNode
  /** The "Cena" dropdown (renders its own <li>). */
  price: ReactNode
  /** The "Kdykoliv" date dropdown (renders its own <li>). */
  date: ReactNode
  /** Right-hand group, where GoOut has "Redakční tipy ▾": tips toggle and sort dropdown. */
  end?: ReactNode
}

/**
 * GoOut's location / category / date bar, extended with a compact "Cena" dropdown.
 * Country, city, date and price are compact dropdowns; category opens a full-width panel.
 */
export function SubNav({ country, city, category, price, date, end }: Props) {
  return (
    <div className={styles.bar}>
      <ul className={`content-column ${styles.list}`}>
        {country}
        {city}
        {category}
        {price}
        {date}
        {end && (
          <li className={styles.end}>
            <ul className={styles.endList}>{end}</ul>
          </li>
        )}
      </ul>
    </div>
  )
}
