import type { RelaxSuggestion } from '../lib/filterEvents'
import { pluralEvents } from '../lib/format'
import { ALL_CITIES_LABEL } from '../data/cities'
import styles from './EmptyState.module.css'

type RelaxKind = RelaxSuggestion['kind']

interface Props {
  suggestions: readonly RelaxSuggestion[]
  /** Labels of the active date and price filters, for the suggestion text. */
  dateLabel: string
  priceLabel: string
  /** Drop one filter (the suggestion's kind). */
  onRelax: (kind: RelaxKind) => void
  /**
   * "Zrušit všechny filtry". Omitted when nothing is clearable: "Zrušit vše" keeps the
   * city, so it wouldn't help when the city alone has no events (e.g. Zlín).
   */
  onClearAll?: () => void
}

/** No results: offer the single changes that would bring events back, with counts. */
export function EmptyState({ suggestions, dateLabel, priceLabel, onRelax, onClearAll }: Props) {
  const text: Record<RelaxKind, string> = {
    editorsPick: 'Nejen redakční tipy',
    date: `Odebrat „${dateLabel}“`,
    price: `Odebrat „${priceLabel}“`,
    categories: 'Všechny kategorie',
    city: ALL_CITIES_LABEL,
  }
  const hasActions = suggestions.length > 0 || onClearAll !== undefined

  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>Žádné akce neodpovídají výběru</h2>
      {hasActions && (
        <>
          <p>Zkuste upravit filtry:</p>
          <ul className={styles.actions}>
            {suggestions.map((s) => (
              <li key={s.kind}>
                <button type="button" className={styles.secondary} onClick={() => onRelax(s.kind)}>
                  {text[s.kind]} ({pluralEvents(s.count)})
                </button>
              </li>
            ))}
            {onClearAll && (
              <li>
                <button type="button" className={styles.primary} onClick={onClearAll}>
                  Zrušit všechny filtry
                </button>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  )
}
