import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { pluralEvents } from '../lib/format'

interface Props {
  count: number
}

/**
 * Polite live region for screen readers. Debounced so quickly toggling several
 * categories produces one announcement, not one per click. The visible count
 * elsewhere on the page updates instantly and is not live.
 */
export function ResultsStatus({ count }: Props) {
  const message = useDebouncedValue(`Nalezeno: ${pluralEvents(count)}`, 500)
  return (
    <div role="status" className="visually-hidden">
      {message}
    </div>
  )
}
