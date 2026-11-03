import type { DayGroup } from '../lib/groupEvents'
import { pluralEvents } from '../lib/format'
import { EventCard } from './EventCard'
import styles from './EventSection.module.css'

interface Props {
  group: DayGroup
  now: Date
}

export function EventSection({ group, now }: Props) {
  const headingId = `day-${group.day}`
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          {group.label}
        </h2>
        <p className={styles.count}>{pluralEvents(group.events.length)}</p>
      </div>
      <ul className={styles.grid}>
        {group.events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} now={now} />
          </li>
        ))}
      </ul>
    </section>
  )
}
