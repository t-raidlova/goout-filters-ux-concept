import type { EventItem } from '../types'
import { categoryLabel } from '../data/categories'
import { STATUS_LABEL, formatPrice, formatWhen } from '../lib/format'
import styles from './EventCard.module.css'

interface Props {
  event: EventItem
  now: Date
}

export function EventCard({ event, now }: Props) {
  const onSale = event.status === 'onSale'

  return (
    <article className={styles.card}>
      {/* Title first in the DOM for screen readers; CSS shows the image above it. */}
      <h3 className={styles.title}>{event.title}</h3>

      <img
        className={styles.image}
        src={event.imageUrl}
        alt=""
        width={318}
        height={212}
        loading="lazy"
        decoding="async"
      />

      <div className={styles.details}>
        <p>
          {/* GoOut shows the primary category only. */}
          {categoryLabel(event.categories[0])},{' '}
          <time dateTime={event.startsAt}>{formatWhen(event, now)}</time>
        </p>
        <p>{event.venue.name}</p>
      </div>

      <div className={styles.footer}>
        {/* Concept addition: price on the card (GoOut cards don't show it). */}
        <p className={styles.price}>{formatPrice(event.price)}</p>
        {/* Checkout is out of scope, so this is a label, not a link. */}
        <span className={onSale ? styles.ticketPill : styles.statusPill}>
          {STATUS_LABEL[event.status]}
        </span>
      </div>
    </article>
  )
}
