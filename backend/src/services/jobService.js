import { readJobs, writeJobs } from '../db/jsonStore.js'
import { STATUSES, isValidStatus } from './constants.js'

/**
 * Gibt alle Jobs zurück oder filtert nach Status.
 * @param {'all' | typeof STATUSES[number]} status
 * @returns {Promise<Array>}
 */
export async function getAll(status = 'all') {
  const jobs = await readJobs()
  return status === 'all' ? jobs : jobs.filter((j) => j.status === status)
}

/**
 * Liefert den „nächsten“ Status (pending → in-progress → done).
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
  const job = jobs.find((j) => j.id === id)

  if (!job) {
    const err = new Error('JOB_NOT_FOUND')
    err.statusCode = 404
    throw err
  }

  job.status = newStatus // einheitliches Feld
  await writeJobs(jobs)
  return job
}
