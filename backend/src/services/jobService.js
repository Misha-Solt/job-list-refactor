// backend/src/services/jobService.js
import { readJobs, writeJobs } from '../db/jsonStore.js'
import { STATUSES, isValidStatus } from './constants.js'
import { normalize } from '../utils/normalize.js'

/* ---------- Hilfsfunktionen ---------- */

/** Ermittelt den nächsten Status (pending → in_progress → done) oder gibt current zurück, wenn bereits final. */
export const nextStatus = (current) => {
  const idx = STATUSES.indexOf(current)
  return idx === -1 || idx === STATUSES.length - 1 ? current : STATUSES[idx + 1]
}

/** Sucht einen Job-Index per numerischer ID (keine String-Koerzierung). */
const findIndexById = (jobs, id) => jobs.findIndex((j) => j.id === id)

/* ---------- Lese-API ---------- */

/**
 * Gibt alle Jobs zurück oder filtert nach Status.
 * @param {'all' | typeof STATUSES[number]} status
 * @returns {Promise<Array>}
 */
export const getAll = async (status = 'all') => {
  const jobs = await readJobs()
  const normalized = jobs.map(normalize)
  return status === 'all' ? normalized : normalized.filter((j) => j.status === status)
}

/* ---------- Schreib-API ---------- */

/**
 * Ändert den Status eines Jobs, inkl. Validierung.
 * Gibt DTO für PATCH-Response zurück (inkl. previousStatus).
 * @param {number} id
 * @param {string} newStatus
 * @returns {Promise<{ id: number, status: string, previousStatus: string }>}
 */
export const updateStatus = async (id, newStatus) => {
  if (!isValidStatus(newStatus)) {
    const err = new Error(`INVALID_STATUS: ${newStatus}`)
    err.statusCode = 400
    throw err
  }

  const jobs = await readJobs()
  const index = findIndexById(jobs, id)
  if (index === -1) {
    const err = new Error('JOB_NOT_FOUND')
    err.statusCode = 404
    throw err
  }

  const prev = jobs[index].status
  if (prev === newStatus) {
    // Keine inhaltliche Änderung – konsistente Antwort liefern
    return { id: jobs[index].id, status: newStatus, previousStatus: prev }
  }

  jobs[index] = { ...jobs[index], status: newStatus }
  await writeJobs(jobs)
  return { id: jobs[index].id, status: newStatus, previousStatus: prev }
}

/**
 * Setzt den Job-Status auf den „nächsten“ Wert (pending → in_progress → done).
 * @param {number} id
 * @returns {Promise<{ id: number, status: string, previousStatus: string }>}
 */
export const advanceStatus = async (id) => {
  const jobs = await readJobs()
  const index = findIndexById(jobs, id)
  if (index === -1) {
    const err = new Error('JOB_NOT_FOUND')
    err.statusCode = 404
    throw err
  }

  const prev = jobs[index].status
  const next = nextStatus(prev)
  if (next === prev) {
    // Bereits final – nichts zu tun
    return { id: jobs[index].id, status: prev, previousStatus: prev }
  }

  jobs[index] = { ...jobs[index], status: next }
  await writeJobs(jobs)
  return { id: jobs[index].id, status: next, previousStatus: prev }
}
