import type { EventItem } from '../types'
import { TIME_ZONE, addDays, pragueDayKey, type DayKey } from './dates'

export interface DayGroup {
  day: DayKey
  label: string
  events: EventItem[]
}

const longDay = new Intl.DateTimeFormat('cs-CZ', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function dayLabel(day: DayKey, today: DayKey): string {
  if (day === today) return 'Dnes'
  if (day === addDays(today, 1)) return 'Zítra'
  // Noon UTC avoids any DST edge when turning the key back into an instant.
  const label = longDay.format(new Date(`${day}T12:00:00Z`))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Groups already-sorted events by the Prague day they're next "on".
 * Ongoing multi-day events belong to `firstDay` (today, or the start of a future date range).
 */
export function groupByDay(
  sorted: readonly EventItem[],
  now: Date,
  firstDay: DayKey = pragueDayKey(now),
): DayGroup[] {
  const today = pragueDayKey(now)
  const groups: DayGroup[] = []
  for (const event of sorted) {
    const start = pragueDayKey(new Date(event.startsAt))
    const day = start < firstDay ? firstDay : start
    const last = groups.at(-1)
    if (last?.day === day) last.events.push(event)
    else groups.push({ day, label: dayLabel(day, today), events: [event] })
  }
  return groups
}
