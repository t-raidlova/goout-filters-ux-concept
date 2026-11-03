import styles from './FilterPanel.module.css'

interface Props {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  icon: string
  label: string
  type?: 'checkbox' | 'radio'
}

/** One round GoOut-style option backed by a native input. */
export function FilterOption({ type = 'checkbox', name, value, checked, onChange, icon, label }: Props) {
  return (
    <li>
      <label className={styles.option}>
        <input
          type={type}
          className={styles.input}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
        />
        <OptionVisual icon={icon} label={label} />
      </label>
    </li>
  )
}

/** Circle + checkmark + label; shared with the "Všechny akce" button. */
export function OptionVisual({ icon, label }: { icon: string; label: string }) {
  return (
    <>
      <span className={styles.circle} aria-hidden="true">
        {icon}
        <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="8" />
          <path
            d="m4.5 8.2 2.3 2.3 4.7-4.9"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
    </>
  )
}
