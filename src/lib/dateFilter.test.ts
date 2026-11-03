import { describe, expect, it } from 'vitest'
import { dateFilterLabel, dateWindow, formatRange, isDayKey, rangeError } from './dateFilter'

// Prague noon on a given day; weekday noted for readability.
const at = (day: string) => new Date(`${day}T12:00:00+01:00`)
const TUE = at('2026-11-03') // the reference screenshot's day
const FRI = at('2026-11-06') // DEMO_NOW's day
const SAT = at('2026-11-07')
const SUN = at('2026-11-08')

describe('dateWindow matches GoOut', () => {
  it('Tuesday 3. 11.: same ranges as the reference screenshot', () => {
    expect(formatRange(dateWindow({ kind: 'today' }, TUE)!)).toBe('3. 11.')
    expect(formatRange(dateWindow({ kind: 'tomorrow' }, TUE)!)).toBe('4. 11.')
    expect(formatRange(dateWindow({ kind: 'week' }, TUE)!)).toBe('3. 11. – 8. 11.')
    expect(formatRange(dateWindow({ kind: 'weekend' }, TUE)!)).toBe('6. 11. – 8. 11.')
  })

  it('weekend is Friday–Sunday; from Friday on it is the rest of this weekend', () => {
    expect(dateWindow({ kind: 'weekend' }, FRI)).toEqual({ from: '2026-11-06', to: '2026-11-08' })
    expect(dateWindow({ kind: 'weekend' }, SAT)).toEqual({ from: '2026-11-07', to: '2026-11-08' })
    expect(dateWindow({ kind: 'weekend' }, SUN)).toEqual({ from: '2026-11-08', to: '2026-11-08' })
  })

  it('week runs from today to Sunday, so on Sunday it is just today', () => {
    expect(dateWindow({ kind: 'week' }, SUN)).toEqual({ from: '2026-11-08', to: '2026-11-08' })
  })

  it('crosses month boundaries', () => {
    expect(dateWindow({ kind: 'tomorrow' }, at('2026-11-30'))).toEqual({
      from: '2026-12-01',
      to: '2026-12-01',
    })
    expect(formatRange(dateWindow({ kind: 'weekend' }, at('2026-12-29'))!)).toBe('1. 1. – 3. 1.')
  })

  it('"Kdykoliv" has no window; a custom range is used as is', () => {
    expect(dateWindow({ kind: 'any' }, TUE)).toBeNull()
    expect(dateWindow({ kind: 'range', from: '2026-11-10', to: '2026-11-12' }, TUE)).toEqual({
      from: '2026-11-10',
      to: '2026-11-12',
    })
  })

  it('uses the Prague day, not the browser time zone', () => {
    // 23:30 UTC on Thursday is already Friday 00:30 in Prague.
    expect(dateWindow({ kind: 'today' }, new Date('2026-11-05T23:30:00Z'))).toEqual({
      from: '2026-11-06',
      to: '2026-11-06',
    })
  })
})

describe('labels', () => {
  it('presets use their names, ranges their dates', () => {
    expect(dateFilterLabel({ kind: 'any' })).toBe('Kdykoliv')
    expect(dateFilterLabel({ kind: 'weekend' })).toBe('Tento víkend')
    expect(dateFilterLabel({ kind: 'range', from: '2026-11-10', to: '2026-11-12' })).toBe('10. 11. – 12. 11.')
    expect(dateFilterLabel({ kind: 'range', from: '2026-11-10', to: '2026-11-10' })).toBe('10. 11.')
  })
})

describe('custom range validation', () => {
  it('accepts a range from today on, including a single day', () => {
    expect(rangeError('2026-11-06', '2026-11-06', FRI)).toBeNull()
    expect(rangeError('2026-11-10', '2026-11-20', FRI)).toBeNull()
  })

  it('rejects missing, invalid, past or reversed dates', () => {
    expect(rangeError('', '2026-11-10', FRI)).toBe('Vyberte datum od i do.')
    expect(rangeError('2026-02-30', '2026-03-01', FRI)).toBe('Zadejte platné datum.')
    expect(rangeError('2026-11-05', '2026-11-10', FRI)).toBe('Datum od nemůže být v minulosti.')
    expect(rangeError('2026-11-12', '2026-11-10', FRI)).toBe(
      'Datum do musí být stejné nebo pozdější než datum od.',
    )
  })

  it('isDayKey only accepts real calendar dates', () => {
    expect(isDayKey('2028-02-29')).toBe(true)
    expect(isDayKey('2026-02-29')).toBe(false)
    expect(isDayKey('6. 11. 2026')).toBe(false)
  })
})
