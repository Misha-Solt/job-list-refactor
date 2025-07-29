import styles from './jobCard.module.css'
import { Job, Status } from '../../types/types'
import { getStatusColor } from '../../utils/StatUtil'
import moment from 'moment'
import { FaArrowRight, FaArrowRotateLeft } from 'react-icons/fa6'

interface Props {
  job: Job
  onOpenDetails: (id: number) => void
  onNext: (id: number, current: Status) => void
  onReset: (id: number) => void
}

const JobCard = ({ job, onOpenDetails, onNext, onReset }: Props) => {
  const formatGermanDate = (dateStr: string) => moment(dateStr).format('DD.MM.YYYY')

  const statusLabels: Record<Status, string> = {
    pending: 'Ausstehend',
    in_progress: 'In Bearbeitung',
    done: 'Abgeschlossen',
  }

  const hasNext = job.status === 'pending' || job.status === 'in_progress'
  const canReset = job.status !== 'pending'

  const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // verhindert Öffnen des Modals
    onNext(job.id, job.status)
  }

  const handleResetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // verhindert Öffnen des Modals
    onReset(job.id)
  }

  const handleOpen = () => onOpenDetails(job.id)

  return (
    <div className={styles.cardContainer} onClick={handleOpen}>
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

        <div className={styles.statusRow}>
          {canReset && (
            <button
              className={`${styles.iconBtn} ${styles.iconBtnReset}`}
              onClick={handleResetClick}
              title="Auf Ausstehend zurücksetzen"
              aria-label="Status zurücksetzen auf Ausstehend"
            >
              <FaArrowRotateLeft aria-hidden size={18} />
            </button>
          )}

          <div className={styles.status} style={{ backgroundColor: getStatusColor(job.status) }}>
            {statusLabels[job.status]}
          </div>

          {hasNext && (
            <button
              className={`${styles.iconBtn} ${styles.iconBtnNext}`}
              onClick={handleNextClick}
              title="Next Status"
              aria-label="Next Status"
            >
              <FaArrowRight aria-hidden size={18} />
            </button>
          )}
        </div>

        {job.notes && (
          <div className={styles.notes}>
            <strong>Notiz: </strong>
            {job.notes}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobCard
