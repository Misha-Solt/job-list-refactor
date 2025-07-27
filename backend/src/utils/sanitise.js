import FIELD_MAP from '../services/fieldMap.js'
import { statusMap } from '../services/statusMap.js'
import { isValidStatus } from '../services/constants.js'
import { readJobs, writeJobs } from '../db/jsonStore.js'

/**
 * Vereinheitlicht ID und Status eines einzelnen Jobs.
 * Gibt null zurück, wenn Eintrag ungültig ist.
 */
const sanitizeJob = (raw) => {
  const job = {}

  // 1. ID extrahieren und casten
  job.id =
    typeof raw.id === 'number' ? raw.id : typeof raw.id === 'string' ? parseInt(raw.id, 10) : null

  if (!Number.isInteger(job.id)) return null

  // 2. Statusfeld anhand FIELD_MAP finden
  for (const [src, target] of Object.entries(FIELD_MAP)) {
    if (raw[src] == null) continue
    if (target === 'status') {
      job.status ??= raw[src]
    }
  }

  // 3. Status normalisieren
  if (typeof job.status === 'string') {
    const rawStatus = job.status.trim().toLowerCase()
    job.status = statusMap[rawStatus] ?? null
  } else {
    job.status = null
  }

  // 4. Validierung
  if (isValidStatus(job.status)) {
    const { id, Status, status, ...rest } = raw
    return {
      id: job.id,
      status: job.status,
      ...rest,
    }
  }

  return null
}

/**
 * Liest, saniert und speichert die bereinigte Datenbank.
 */
const sanitizeDB = async () => {
  const jobs = await readJobs()
  const cleaned = jobs.map(sanitizeJob).filter((j) => j !== null)
  await writeJobs(cleaned)
}

export { sanitizeDB }
