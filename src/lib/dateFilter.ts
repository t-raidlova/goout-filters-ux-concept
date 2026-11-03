import type { DateFilter, DatePreset } from '../types'
import { addDays, pragueDayKey, weekday, type DayKey } from './dates'

export interface DayRange {
  from: DayKey
  to: DayKey
}

export const ANY_DATE: DateFilter = { kind: 'any' }

/** Options in the "Kdykoliv" dropdown, in GoOut's order ("Jiné datum" is added by the UI). */
export const DATE_PRESETS: ReadonlyArray<{ kind: DatePreset; label: string }> = [
  { kind: 'any', label: 'Kdykoliv' },
  { kind: 'today', label: 'Dnes' },
  { kind: 'tomorrow', label: 'Zítra' },
  { kind: 'week', label: 'Tento týden' },
  { kind: 'weekend', label: 'Tento víkend' },
]

export const CUSTOM_DATE_LABEL = 'Jiné datum'

/**
 * Inclusive range of Prague calendar days for a filter, or null for "Kdykoliv".
 * Follows GoOut (reference screenshot, Tue 3. 11.):
 * - Tento týden = today … Sunday (3. 11. – 8. 11.)
 * - Tento víkend = Friday … Sunday (6. 11. – 8. 11.); from Friday on, today … Sunday
 */
export function dateWindow(filter: DateFilter, now: Date): DayRange | null {
  const today = pragueDayKey(now)
  const wd = weekday(today) // 0 = Sunday … 6 = Saturday
  const daysToSunday = (7 - wd) % 7
  const sunday = addDays(today, daysToSunday)

  switch (filter.kind) {
    case 'any':
      return null
    case 'today':
      return { from: today, to: today }
    case 'tomorrow': {
      const tomorrow = addDays(today, 1)
      return { from: tomorrow, to: tomorrow }
    }
    case 'week':
      return { from: today, to: sunday }
    case 'weekend': {
      // Friday, Saturday, Sunday: the rest of this weekend.
      if (wd === 5 || wd === 6 || wd === 0) return { from: today, to: sunday }
      return { from: addDays(sunday, -2), to: sunday }
    }
    case 'range':
      return { from: filter.from, to: filter.to }
  }
}

/** "6. 11." */
export function formatDayKey(key: DayKey): string {
  const [, m, d] = key.split('-').map(Number)
  return `${d}. ${m}.`
}

/** "6. 11." for one day, "6. 11. – 8. 11." for a range. */
export function formatRange(range: DayRange): string {
  return range.from === range.to
    ? formatDayKey(range.from)
    : `${formatDayKey(range.from)} – ${formatDayKey(range.to)}`
}

/** Label for the bar, chips and empty state: "Kdykoliv", "Tento víkend", "10. 11. – 12. 11.". */
export function dateFilterLabel(filter: DateFilter): string {
  if (filter.kind === 'range') return formatRange(filter)
  return DATE_PRESETS.find((p) => p.kind === filter.kind)?.label ?? 'Kdykoliv'
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/

/** A real calendar date as `YYYY-MM-DD` (rejects "2026-02-30"). */
export function isDayKey(value: string): value is DayKey {
  if (!DAY_KEY.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/**
 * Validates a custom range from the two date fields. Returns a Czech error message,
 * or null when the range is usable. Past days aren't allowed (past events are never shown).
 */
export function rangeError(from: string, to: string, now: Date): string | null {
  if (!from || !to) return 'Vyberte datum od i do.'
  if (!isDayKey(from) || !isDayKey(to)) return 'Zadejte platné datum.'
  if (from < pragueDayKey(now)) return 'Datum od nemůže být v minulosti.'
  if (to < from) return 'Datum do musí být stejné nebo pozdější než datum od.'
  return null
}
