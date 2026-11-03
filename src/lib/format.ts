import type { EventItem, EventStatus } from '../types'
import type { Currency } from '../data/countries'
import { TIME_ZONE, addDays, pragueDayKey } from './dates'

const moneyFormatters = new Map<Currency, Intl.NumberFormat>()

/** "1 290 Kč", "15 €" (Czech formatting for both, as the UI is Czech). */
export function formatMoney(amount: number, currency: Currency): string {
  let f = moneyFormatters.get(currency)
  if (!f) {
    f = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 })
    moneyFormatters.set(currency, f)
  }
  return f.format(amount)
}

/**
 * Card price label, consistent with how the filter judges the event (lowest price):
 * "Zdarma", "350 Kč", "od 290 Kč" (several prices), "od 15 €" or "Cena neuvedena".
 */
export function formatPrice(ticketPrices: readonly number[], currency: Currency): string {
  if (ticketPrices.length === 0) return 'Cena neuvedena'
  const lowest = Math.min(...ticketPrices)
  const highest = Math.max(...ticketPrices)
  if (highest === 0) return 'Zdarma'
  if (lowest === 0) {
    return `Zdarma i od ${formatMoney(Math.min(...ticketPrices.filter((p) => p > 0)), currency)}`
  }
  return highest > lowest ? `od ${formatMoney(lowest, currency)}` : formatMoney(lowest, currency)
}

/** Ticket call-to-action label, as on GoOut cards. */
export const STATUS_LABEL: Record<EventStatus, string> = {
  onSale: 'Vstupenky',
  soldOut: 'Vyprodáno',
  saleEnded: 'Prodej ukončen',
}

const parts = new Intl.DateTimeFormat('cs-CZ', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function pragueParts(date: Date) {
  const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]))
  return {
    weekday: p.weekday,
    dayMonth: `${Number(p.day)}. ${Number(p.month)}.`,
    year: p.year,
    time: `${Number(p.hour)}:${p.minute}`,
  }
}

/**
 * GoOut-style dates:
 * - "dnes 20:00", "zítra 19:30", "pá 13. 11. 18:00"
 * - multi-day: "30. 10. – 14. 11." or "23. 9. 2026 – 9. 6. 2027" across years
 */
export function formatWhen(event: EventItem, now: Date): string {
  const start = new Date(event.startsAt)
  const s = pragueParts(start)

  if (event.endsAt) {
    const end = new Date(event.endsAt)
    const e = pragueParts(end)
    if (pragueDayKey(start) === pragueDayKey(end)) {
      return `${relativeDay(start, now, s)} ${s.time}–${e.time}`
    }
    return s.year === e.year
      ? `${s.dayMonth} – ${e.dayMonth}`
      : `${s.dayMonth} ${s.year} – ${e.dayMonth} ${e.year}`
  }
  return `${relativeDay(start, now, s)} ${s.time}`
}

function relativeDay(date: Date, now: Date, p: ReturnType<typeof pragueParts>): string {
  const day = pragueDayKey(date)
  const today = pragueDayKey(now)
  if (day === today) return 'dnes'
  if (day === addDays(today, 1)) return 'zítra'
  return `${p.weekday} ${p.dayMonth}`
}

/** Czech plural: 1 akce, 2–4 akce, 5+ akcí. */
export function pluralEvents(n: number): string {
  if (n === 1) return '1 akce'
  if (n >= 2 && n <= 4) return `${n} akce`
  return `${n} akcí`
}

/** "2 akce bez uvedené ceny skryty" — shown when a price filter hides unknown-price events. */
export function hiddenUnknownMessage(n: number): string {
  return `${pluralEvents(n)} bez uvedené ceny ${n === 1 ? 'skryta' : n <= 4 ? 'skryty' : 'skryto'}`
}

/**
 * Screen-reader announcement after filters change. It starts with the active filters
 * ("Praha, Koncerty, Zdarma"), so the text changes, and is announced, even when the
 * number of results stays the same.
 */
export function resultsMessage(count: number, hiddenUnknownPrice: number, context = ''): string {
  const base = `${context ? `${context}: n` : 'N'}alezeno ${pluralEvents(count)}.`
  return hiddenUnknownPrice > 0 ? `${base} ${hiddenUnknownMessage(hiddenUnknownPrice)}.` : base
}
