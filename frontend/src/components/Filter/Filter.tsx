import styles from './filter.module.css'
import { getStatusColor } from '../../utils/StatUtil'

interface FilterProps {
  selectedFilter: string
  onFilterChange: (status: string) => void
}

const FILTERS = [
  { label: 'Alle', value: '' },
  { label: 'Ausstehend', value: 'Ausstehend' },
  { label: 'In Bearbeitung', value: 'In Bearbeitung' },
  { label: 'Abgeschlossen', value: 'Abgeschlossen' },
]

const Filter = ({ selectedFilter, onFilterChange }: FilterProps) => {
  return (
    <div className={styles.filterWrapper}>
      {FILTERS.map(({ label, value }) => {
        const isSelected = selectedFilter === value
        const backgroundColor = isSelected
          ? getStatusColor(value as any)
          : 'var(--color-muted)'

        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={styles.button}
            style={{ backgroundColor }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default Filter