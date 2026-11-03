import type { RelaxSuggestion } from '../lib/filterEvents'
import { pluralEvents } from '../lib/format'
import styles from './EmptyState.module.css'

interface Props {
  suggestions: readonly RelaxSuggestion[]
  /** Labels of the active date and price filters, for the suggestion text. */
  dateLabel: string
  priceLabel: string
  onClearDate: () => void
  onClearPrice: () => void
  onClearCategories: () => void
  onClearCity: () => void
  onClearAll: () => void
  /** "Všechna města", for the suggestion that drops the city. */
  wholeCountryLabel: string
}

/** No results: offer the single changes that would bring events back, with counts. */
export function EmptyState({
  suggestions,
  dateLabel,
  priceLabel,
  onClearDate,
  onClearPrice,
  onClearCategories,
  onClearCity,
  onClearAll,
  wholeCountryLabel,
}: Props) {
  const action = {
    date: onClearDate,
    price: onClearPrice,
    categories: onClearCategories,
    city: onClearCity,
  }
  const text = {
    date: `Odebrat „${dateLabel}“`,
    price: `Odebrat „${priceLabel}“`,
    categories: 'Všechny kategorie',
    city: wholeCountryLabel,
  }
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>Žádné akce neodpovídají výběru</h2>
      <p>Zkuste upravit filtry:</p>
      <ul className={styles.actions}>
        {suggestions.map((s) => (
          <li key={s.kind}>
            <button
              type="button"
              className={styles.secondary}
              onClick={action[s.kind]}
            >
              {text[s.kind]} ({pluralEvents(s.count)})
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={styles.primary} onClick={onClearAll}>
            Zrušit všechny filtry
          </button>
        </li>
      </ul>
    </div>
  )
}
