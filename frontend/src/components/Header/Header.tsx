import ThemeToggle from '../ThemeToggle/ThemeToggle'
import styles from './header.module.css'
import { FaPause, FaPlay, FaArrowsRotate } from 'react-icons/fa6'

type Props = {
  lastUpdate: Date
  apiCallCount: number
  refreshCount: number
  autoRefreshEnabled: boolean
  setAutoRefreshEnabled: (v: boolean) => void
  onRefreshNow: () => void
}

const Header = ({
  lastUpdate,
  apiCallCount,
  refreshCount,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  onRefreshNow,
}: Props) => {
  const last = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(lastUpdate)

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Aufträge</h1>
      <div className={styles.meta}>
        <span>Letztes Update: {last}</span>
        <span>API Calls: {apiCallCount}</span>
        <span>Refreshes: {refreshCount}</span>
      </div>

      <div className={styles.btnContainer}>
        <button
          type="button"
          className={`${styles.ctrlBtn} ${autoRefreshEnabled ? styles.on : styles.off}`}
          aria-pressed={autoRefreshEnabled}
          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          title={autoRefreshEnabled ? 'Auto-Refresh ausschalten' : 'Auto-Refresh einschalten'}
        >
          {autoRefreshEnabled ? <FaPause aria-hidden /> : <FaPlay aria-hidden />}
          <span className={styles.ctrlLabel}>{autoRefreshEnabled ? 'Auto' : 'Manuell'}</span>
        </button>

        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={onRefreshNow}
          title="Jetzt aktualisieren"
        >
          <FaArrowsRotate aria-hidden />
          <span className={styles.ctrlLabel}>Jetzt</span>
        </button>
      </div>
      <ThemeToggle />
    </header>
  )
}

export default Header
