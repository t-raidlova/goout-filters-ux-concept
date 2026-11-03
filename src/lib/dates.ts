export const TIME_ZONE = 'Europe/Prague'

/** A calendar day in Prague as `YYYY-MM-DD`. Strings compare lexicographically. */
export type DayKey = string

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar day of an instant in Prague, regardless of the browser's time zone. */
export function pragueDayKey(date: Date): DayKey {
  return dayKeyFormatter.format(date)
}

export function addDays(key: DayKey, days: number): DayKey {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(key: DayKey): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}
