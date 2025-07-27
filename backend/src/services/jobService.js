import { readJobs, writeJobs } from '../db/jsonStore.js'
import { STATUSES, isValidStatus } from './constants.js'
import { normalize } from '../utils/normalize.js'

/**
 * Gibt alle Jobs zurück oder filtert nach Status.
 * @param {'all' | typeof STATUSES[number]} status
 * @returns {Promise<Array>}
 */
export async function getAll(status = 'all') {
  const jobs = await readJobs()
  const normalized = jobs.map(normalize)

  return status === 'all' ? normalized : normalized.filter((j) => j.status === status)
}

/**
 * Liefert den „nächsten“ Status (pending → in_progress → done).
 */
export function nextStatus(current) {
  const idx = STATUSES.indexOf(current)
  return idx === -1 || idx === STATUSES.length - 1 ? current : STATUSES[idx + 1]
}

/**
 * Ändert den Status eines Jobs, inkl. Validierung.
 * @param {number} id
 * @param {string} newStatus
 * @returns {Promise<Object>}
 */
export async function updateStatus(id, newStatus) {
  if (!isValidStatus(newStatus)) {
    const err = new Error(`INVALID_STATUS: ${newStatus}`)
    err.statusCode = 400
    throw err
  }

  const jobs = await readJobs()
  const index = jobs.findIndex((j) => j.id === id)

  if (index === -1) {
    const err = new Error('JOB_NOT_FOUND')
    err.statusCode = 404
    throw err
  }

  jobs[index] = {
    ...jobs[index],
    status: newStatus,
  }

  await writeJobs(jobs)
  return normalize(jobs[index])
}
