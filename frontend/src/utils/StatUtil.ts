import { Status } from '../types/types'

export const getStatusColor = (status: Status | ''): string => {
  switch (status) {
    case '':
      return 'var(--color-all)'
    case 'pending':
      return 'var(--color-ausstehend)'
    case 'in_progress':
      return 'var(--color-inBearbeitung)'
    case 'done':
      return 'var(--color-abgeschlossen)'
    default:
      return 'var(--color-muted)'
  }
}
