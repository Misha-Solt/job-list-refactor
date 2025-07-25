import { Status } from '../types/types'

export const getStatusColor = (status: Status | ''): string => {
  switch (status) {
    case '':
      return 'var(--color-all)'
    case 'Ausstehend':
      return 'var(--color-ausstehend)'
    case 'In Bearbeitung':
      return 'var(--color-inBearbeitung)'
    case 'Abgeschlossen':
      return 'var(--color-abgeschlossen)'
    default:
      return 'var(--color-muted)'
  }
}
