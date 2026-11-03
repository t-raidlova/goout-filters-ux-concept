import type { DatePreset } from '../types'

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

/** Inclusive range of Prague calendar days, or `null` for "any time". */
export function presetWindow(
  preset: DatePreset,
  now: Date,
): { from: DayKey; to: DayKey } | null {
  const today = pragueDayKey(now)
  switch (preset) {
    case 'any':
      return null
    case 'today':
      return { from: today, to: today }
    case 'tomorrow': {
      const tomorrow = addDays(today, 1)
      return { from: tomorrow, to: tomorrow }
    }
    case 'weekend': {
      const wd = weekday(today)
      // Already the weekend: the rest of the current one.
      if (wd === 6) return { from: today, to: addDays(today, 1) }
      if (wd === 0) return { from: today, to: today }
      const saturday = addDays(today, 6 - wd)
      return { from: saturday, to: addDays(saturday, 1) }
    }
  }
}
