import { Router } from 'express'
import { getAll, updateStatus, nextStatus } from '../services/jobService.js'

export const jobRoutes = Router()

/**
 * GET /api/jobs?status=[all|pending|in-progress|done]
 * Liefert Liste gefiltert nach Status (default: all).
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
 * Erwartet { "status": "in-progress" } im Body.
 */
jobRoutes.patch('/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body
    const result = await updateStatus(id, status)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * Optional Convenience-Route:
 * POST /api/jobs/:id/next – setzt Status automatisch auf den „nächsten“
 * (pending → in-progress → done)
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
