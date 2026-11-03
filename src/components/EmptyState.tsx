import styles from './EmptyState.module.css'

interface Props {
  onReset: () => void
}

export function EmptyState({ onReset }: Props) {
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>Žádné akce neodpovídají výběru</h2>
      <p>Zkuste vybrat jiné kategorie, nebo zobrazte všechny akce.</p>
      <button type="button" className={styles.button} onClick={onReset}>
        Zobrazit všechny akce
      </button>
    </div>
  )
}
