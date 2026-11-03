import type { EventItem, EventStatus, PriceInfo } from '../types'
import { TIME_ZONE, addDays, pragueDayKey } from './dates'

const czk = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

export function formatCzk(amount: number): string {
  return czk.format(amount)
}

export function formatPrice(price: PriceInfo): string {
  switch (price.kind) {
    case 'free':
      return 'Zdarma'
    case 'unknown':
      return 'Cena neuvedena'
    case 'paid':
      return price.toCzk && price.toCzk > price.fromCzk
        ? `od ${formatCzk(price.fromCzk)}`
        : formatCzk(price.fromCzk)
  }
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
