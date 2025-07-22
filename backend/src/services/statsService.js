import { readJobs } from '../db/jsonStore.js'
import { STATUSES } from './constants.js'

/**
 * Zählt Aufträge pro Status und liefert Objekt:
 * { total: 10, Ausstehend: 4, 'In Bearbeitung': 3, Abgeschlossen: 3 }
 */
export const getStats = async () => {
  const jobs = await readJobs()
  const counts = { total: jobs.length }

  for (const s of STATUSES) {
    counts[s] = jobs.filter((j) => j.status === s).length
  }
  return counts
}
