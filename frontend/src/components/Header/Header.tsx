import styles from './header.module.css'

interface HeaderProps {
  lastUpdate: Date
  apiCallCount: number
  refreshCount: number
}

const Header: React.FC<HeaderProps> = ({ lastUpdate, apiCallCount, refreshCount }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Aufträge Verwaltung</h1>
      <p className={styles.updated}>
        Zuletzt aktualisiert: {lastUpdate.toLocaleString()}
      </p>
      <div className={styles.stats}>
        <span>API Calls: {apiCallCount}</span>
        <span>Refresh Count: {refreshCount}</span>
      </div>
    </header>
  )
}

export default Header