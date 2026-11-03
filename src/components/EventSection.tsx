import type { DayGroup } from '../lib/groupEvents'
import { pluralEvents } from '../lib/format'
import { EventGrid } from './EventGrid'
import styles from './EventSection.module.css'

interface Props {
  group: DayGroup
  now: Date
}

/** One day of results ("Dnes", "Zítra", …), used when a date filter is active. */
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
      <EventGrid events={group.events} now={now} />
    </section>
  )
}
