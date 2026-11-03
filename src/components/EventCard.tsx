import type { EventItem } from '../types'
import { categoryLabel } from '../data/categories'
import { currencyOfCity } from '../data/cities'
import { STATUS_LABEL, formatWhen, pluralInterested } from '../lib/format'
import { formatPrice } from '../lib/priceFilter'
import styles from './EventCard.module.css'

interface Props {
  event: EventItem
  now: Date
  /** Show "1 200 zájemců" (when sorted by popularity). */
  showInterested?: boolean
}

export function EventCard({ event, now, showInterested = false }: Props) {
  const onSale = event.status === 'onSale'

  return (
    <article className={styles.card}>
      {/* Title first in the DOM for screen readers; CSS shows the image above it. */}
      <h3 className={styles.title}>{event.title}</h3>

      {/*
        Editors' pick: real text with a solid background over the image corner, so it's
        readable on any photo and read by screen readers (GoOut's overlay is plain white text).
      */}
      {event.editorsPick && <p className={styles.pick}>Redakční tip</p>}

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
        {showInterested && <p className={styles.interested}>{pluralInterested(event.interested)}</p>}
      </div>

      <div className={styles.footer}>
        {/* Concept addition: price on the card (GoOut cards don't show it). */}
        <p className={styles.price}>{formatPrice(event.ticketPrices, currencyOfCity(event.venue.city))}</p>
        {/* Checkout is out of scope, so this is a label, not a link. */}
        <span className={onSale ? styles.ticketPill : styles.statusPill}>
          {STATUS_LABEL[event.status]}
        </span>
      </div>
    </article>
  )
}
