const PATHS = {
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm9.5 16-4.8-4.8',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.5 3.6 5.5 3.6 9S14.5 18.5 12 21c-2.5-2.5-3.6-5.5-3.6-9S9.5 5.5 12 3Z',
  ticket:
    'M13 3.5 20.5 11 11 20.5 3.5 13l1.8-1.8a2 2 0 0 0 2.8-2.8L9.9 6.6a2 2 0 0 0 2.8-2.8L13 3.5Zm-1.5 5 4 4',
  bell: 'M6 10a6 6 0 1 1 12 0c0 4 1.5 6 2.5 7h-17C4.5 16 6 14 6 10Zm4 10a2 2 0 0 0 4 0',
  user: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-5.5 10.5c1.2-1.8 3.2-2.8 5.5-2.8s4.3 1 5.5 2.8',
  chevronDown: 'm7 10 5 5 5-5',
} as const

export type IconName = keyof typeof PATHS

interface Props {
  name: IconName
  size?: number
  className?: string
}

/** Decorative line icon. Always hidden from assistive tech; give the parent a text label. */
export function Icon({ name, size = 20, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
