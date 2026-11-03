import type { RelaxSuggestion } from '../lib/filterEvents'
import { pluralEvents } from '../lib/format'
import styles from './EmptyState.module.css'

interface Props {
  suggestions: readonly RelaxSuggestion[]
  /** Label of the active price filter, for the suggestion text. */
  priceLabel: string
  onClearPrice: () => void
  onClearCategories: () => void
  onClearAll: () => void
}

/** No results: offer the single changes that would bring events back, with counts. */
export function EmptyState({
  suggestions,
  priceLabel,
  onClearPrice,
  onClearCategories,
  onClearAll,
}: Props) {
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
              onClick={s.kind === 'price' ? onClearPrice : onClearCategories}
            >
              {s.kind === 'price' ? `Odebrat „${priceLabel}“` : 'Všechny kategorie'} (
              {pluralEvents(s.count)})
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
