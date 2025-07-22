export const STATUSES = ['Ausstehend', 'In Bearbeitung', 'Abgeschlossen']

/** true, wenn status exakt einem der erlaubten Werte entspricht */
export function isValidStatus(status) {
  return STATUSES.includes(status)
}
