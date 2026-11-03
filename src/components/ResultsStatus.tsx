import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { resultsMessage } from '../lib/format'

interface Props {
  count: number
  hiddenUnknownPrice: number
}

/**
 * Polite live region for screen readers. Debounced so quickly changing several
 * filters produces one announcement, not one per click. The visible count
 * elsewhere on the page updates instantly and is not live.
 */
export function ResultsStatus({ count, hiddenUnknownPrice }: Props) {
  const message = useDebouncedValue(resultsMessage(count, hiddenUnknownPrice), 500)
  return (
    <div role="status" className="visually-hidden">
      {message}
    </div>
  )
}
