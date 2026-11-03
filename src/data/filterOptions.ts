import type { DatePreset } from '../types'

export const DATE_OPTIONS: ReadonlyArray<{ key: DatePreset; label: string }> = [
  { key: 'any', label: 'Kdykoliv' },
  { key: 'today', label: 'Dnes' },
  { key: 'tomorrow', label: 'Zítra' },
  { key: 'weekend', label: 'Tento víkend' },
]

export function dateLabel(preset: DatePreset): string {
  return DATE_OPTIONS.find((o) => o.key === preset)?.label ?? preset
}
