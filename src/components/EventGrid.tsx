import type { EventItem } from '../types'
import { EventCard } from './EventCard'
import styles from './EventGrid.module.css'

interface Props {
  events: readonly EventItem[]
  now: Date
  showInterested?: boolean
}

/** Card grid: 3 columns at full width (~318px cards), 2 on tablets, 1 on phones. */
export function EventGrid({ events, now, showInterested }: Props) {
  return (
    <ul className={styles.grid}>
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} now={now} showInterested={showInterested} />
        </li>
      ))}
    </ul>
  )
}
