import { readJobs, writeJobs } from '../db/jsonStore.js'

const STATUSES = ['pending', 'in-progress', 'done']

/**
 * Holt alle Jobs oder filtert nach Status.
 * @param {string} status –  'all' | 'pending' | 'in-progress' | 'done'
 * @returns {Promise<Array>} Liste der Jobs
 */

export async function getAll(status = 'all') {
  const jobs = await readJobs()
  return status === 'all' ? jobs : jobs.filter((j) => j.status === status)
}

/**
 * Ändert den Status eines Jobs.
 * @param {number} id          – Job-ID
 * @param {string} nextStatus  – neuer Status
 * @returns {Promise<Object>}  – aktualisierter Job
 */

export async function updateStatus(id, nextStatus) {
  if (!STATUSES.includes(nextStatus)) {
    throw new Error('INVALID_STATUS')
  }

  const jobs = await readJobs()
  const job = jobs.find((j) => j.id === id)

  if (!job) {
    throw new Error('NOT_FOUND')
  }

  job.status = nextStatus
  await writeJobs(jobs)
  return job
}

/**
 * Liefert den „nächsten“ Status (optional verwendbar im Router).
 * pending  -> in-progress
 * in-progress -> done
 * done -> done
 */
export function nextStatus(current) {
  const idx = STATUSES.indexOf(current)
  return idx === -1 || idx === STATUSES.length - 1 ? current : STATUSES[idx + 1]
}
