import { Router } from 'express'
import { getAll, updateStatus, advanceStatus } from '../services/jobService.js'
import { getStats } from '../services/statsService.js'
import { STATUSES, isValidStatus } from '../services/constants.js'

export const jobRoutes = Router()

/* ---------- Hilfsfunktionen ---------- */

/** Liest numerische :id; gibt 400 zurück, wenn ungültig. */
const getNumericIdOr400 = (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'INVALID_ID' })
    return null
  }
  return id
}

/** Prüft den Status-Filter (?status=...), erlaubt auch "all". */
const assertValidStatusFilterOr400 = (req, res) => {
  const v = req.query.status ?? 'all'
  if (v === 'all' || isValidStatus(v)) return v
  res.status(400).json({ error: 'INVALID_STATUS_PARAM', allowed: ['all', ...STATUSES] })
  return null
}

/* ---------- Routen ---------- */

/**
 * GET /api/jobs?status=[all|pending|in_progress|done]
 * Liefert komplette oder gefilterte Liste.
 * Hinweis: KEINE Normalisierung – es werden nur exakt obige Werte akzeptiert.
 */
jobRoutes.get('/', async (req, res, next) => {
  try {
    const status = assertValidStatusFilterOr400(req, res)
    if (status == null) return
    const jobs = await getAll(status)
    res.json(jobs)
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/jobs/:id/status
 * Erwartet Body: { "status": "<gültiger Status>" }
 * Antwort: { id, status, previousStatus }
 * Hinweis: KEINE Normalisierung – Body muss exakt einen gültigen Status liefern.
 */
jobRoutes.patch('/:id/status', async (req, res, next) => {
  try {
    const id = getNumericIdOr400(req, res)
    if (id == null) return

    const status = req.body?.status
    if (!isValidStatus(status)) {
      return res.status(400).json({ error: 'INVALID_STATUS', allowed: STATUSES })
    }

    const updated = await updateStatus(id, status)
    res.json(updated)
  } catch (err) {
    next(err) // leitet 400/404 usw. an den zentralen Error-Handler weiter
  }
})

/**
 * POST /api/jobs/:id/next
 * Convenience-Route: setzt Status automatisch auf den „nächsten“
 * (pending → in_progress → done).
 * Antwort: { id, status, previousStatus }
 */
jobRoutes.post('/:id/next', async (req, res, next) => {
  try {
    const id = getNumericIdOr400(req, res)
    if (id == null) return

    const updated = await advanceStatus(id)
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/jobs/stats
 * Liefert Objekt mit Anzahl pro Status.
 */
jobRoutes.get('/stats', async (_req, res, next) => {
  try {
    const stats = await getStats()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})
