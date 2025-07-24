import { Job } from '../../types/types'
import styles from './jobCard.module.css'

interface Props {
  job: Job
}

export default function JobCard({ job }: Props) {
  return (
    <div className={styles.card}>
      <h3>{job.title}</h3>
      <p>Kunde: {job.customer}</p>
      <p>Fällig bis: {job.due}</p>
      <p>Status: {job.status}</p>
    </div>
  )
}
