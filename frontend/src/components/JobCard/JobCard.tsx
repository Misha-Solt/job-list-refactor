import styles from './jobCard.module.css'
import { Job } from '../../types/types'
import { getStatusColor } from '../../utils/StatUtil'
import moment from 'moment'

interface Props {
  job: Job
  expanded: boolean
  onToggle: () => void
}

const JobCard = ({ job, expanded, onToggle }: Props) => {
  const formatGermanDate = (dateStr: string) => moment(dateStr).format('DD.MM.YYYY')

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

        <div className={styles.status} style={{ backgroundColor: getStatusColor(job.status) }}>
          {job.status}
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
