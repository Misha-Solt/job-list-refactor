import styles from './jobCard.module.css'
import { Job } from '../../types/types'
import { getStatusColor } from '../../utils/StatUtil'
import { Status } from '../../types/types'
import useJobs from '../../hooks/useJobs'
import moment from 'moment'

interface Props {
  job: Job
  expanded: boolean
  onToggle: () => void
}

const JobCard = ({ job, expanded, onToggle }: Props) => {
  const formatGermanDate = (dateStr: string) => moment(dateStr).format('DD.MM.YYYY')

  const statusLabels: Record<Status, string> = {
    pending: 'Ausstehend',
    in_progress: 'In Bearbeitung',
    done: 'Abgeschlossen',
  }

  // Liefert den nächsten Status in der Pipeline oder `null`, wenn Ende erreicht.
  const nextStatus = (current: Status): Status | null => {
    switch (current) {
      case 'pending':
        return 'in_progress'
      case 'in_progress':
        return 'done'
      default:
        return null
    }
  }

  const { updateJobStatus } = useJobs()

  /**
   * Klick auf „Status ändern“ → nächster Status → API-Patch.
   * `stopPropagation()` verhindert, dass der Klick gleichzeitig die Card auf- oder zuklappt.
   */
  const handleStatusClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const next = nextStatus(job.status)
    if (next) updateJobStatus(job.id, next)
  }

  return (
    <div className={styles.cardContainer} onClick={onToggle}>
      <div className={styles.card}>
        <div className={styles.info}>
          <h3 className={styles.title}>{job.title}</h3>
          <p className={styles.name}>
            <strong>Kunde:</strong> {job.customer}
          </p>
          <p className={styles.date}>
            <strong>Fällig:</strong> {formatGermanDate(job.due)}
          </p>
        </div>

        <div className={styles.statusContainer}>
          <div className={styles.status} style={{ backgroundColor: getStatusColor(job.status) }}>
            {statusLabels[job.status]}
          </div>
          {nextStatus(job.status) && (
            <button className={styles.advanceBtn} onClick={handleStatusClick}>
              Status ändern
            </button>
          )}
        </div>

        {job.notes && (
          <div className={styles.notes}>
            <strong>Notiz: </strong>
            {job.notes}
          </div>
        )}

        {expanded && (
          <div className={styles.details}>
            <h4>Alle Daten:</h4>
            <pre>{JSON.stringify(job, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobCard
