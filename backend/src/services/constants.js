export const STATUSES = ['pending', 'in_progress', 'done']

/** true, wenn status exakt einem der erlaubten Werte entspricht */
export function isValidStatus(status) {
  return STATUSES.includes(status)
}
