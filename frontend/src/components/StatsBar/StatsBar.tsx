import styles from './statsBar.module.css'
import { Stats } from '../../types/types'

interface StatsProps {
  stats: Stats
}

const StatsBar = ({ stats }: StatsProps) => {
  return (
    <section className={styles.statsContainer}>
      <h3 className={styles.title}>Statistiken</h3>
      <div className={styles.row}>
        <span>Ausstehend: {stats['pending'] || 0}</span>
        <span>In Bearbeitung: {stats['in_progress'] || 0}</span>
        <span>Abgeschlossen: {stats['done'] || 0}</span>
        <span>Gesamt: {stats.total || 0}</span>
      </div>
    </section>
  )
}

export default StatsBar
