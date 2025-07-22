import { Router } from 'express'
import {
  getAll,
  updateStatus,
  nextStatus, // Hilfsfunktion aus Service
} from '../services/jobService.js'

export const jobRoutes = Router()

/**
 * GET /api/jobs?status=[all|pending|in-progress|done]
 * Liefert komplette oder gefilterte Liste.
 */
jobRoutes.get('/', async (req, res, next) => {
  try {
    const status = req.query.status ?? 'all'
    const jobs = await getAll(status)
    res.json(jobs)
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/jobs/:id/status
 * Erwartet { "status": "<gültiger Status>" } im Body.
 */
jobRoutes.patch('/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body // z. B. "in-progress"

    const updated = await updateStatus(id, status)
    res.json(updated)
  } catch (err) {
    next(err) // leitet 400/404 weiter an Error-Handler
  }
})

/**
 * POST /api/jobs/:id/next
 * Convenience-Route: setzt Status automatisch auf den „nächsten“
 * (pending → in-progress → done).
 */
jobRoutes.post('/:id/next', async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const [job] = await getAll('all').then((js) => js.filter((j) => j.id === id))
    if (!job) throw new Error('NOT_FOUND')

    const updated = await updateStatus(id, nextStatus(job.status))
    res.json(updated)
  } catch (err) {
    next(err)
  }
})
