import styles from './footer.module.css'
import moment from 'moment'

interface Props {
  totalJobs: number
  filteredJobs: number
  selectedFilter: string
  lastUpdate: Date
}

const Footer = ({ totalJobs, filteredJobs, selectedFilter, lastUpdate }: Props) => {
  return (
    <footer className={styles.footer}>
      <div>Debug Info:</div>
      <div>Total Jobs Loaded: {totalJobs}</div>
      <div>Filtered Jobs: {filteredJobs}</div>
      <div>Current Filter: {selectedFilter || 'None'}</div>
      <div>Last API Call: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss Z')}</div>
    </footer>
  )
}

export default Footer
