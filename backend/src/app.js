import express from 'express'
import cors from 'cors'
import pino from 'pino'
import { getStats } from './services/statsService.js'
import { jobRoutes } from './routes/jobRoutes.js'

const log = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } })

export const app = express()

/* ────────────── Middlewares ────────────── */
app.use(cors())
app.use(express.json())

/* ────────────── Routes ────────────── */
app.use('/api/jobs', jobRoutes)
app.use('/api/auftraege', (req, res) => res.redirect(301, '/api/jobs'))

// ------------------- Delete later-------------------------------------
app.get('/api/statistics', async (req, res, next) => {
  try {
    const stats = await getStats()
    // legacy keys, damit Frontend nichts anpassen muss
    res.json({
      ausstehend: stats['Ausstehend'],
      inBearbeitung: stats['In Bearbeitung'],
      abgeschlossen: stats['Abgeschlossen'],
      total: stats.total,
      serverTime: new Date(),
    })
  } catch (err) {
    next(err)
  }
})
// --------------------------------------------------------

/* ────────────── 404-Fallback ────────────── */
app.use((req, _res, next) => {
  const err = new Error(`Route ${req.method} ${req.originalUrl} not found`)
  err.statusCode = 404
  next(err)
})

/* ────────────── Central Error-Handler ────────────── */
app.use((err, _req, res, _next) => {
  const code =
    err.statusCode ??
    (err.message === 'NOT_FOUND' ? 404 : err.message === 'INVALID_STATUS' ? 400 : 500)

  log.error({ err }, err.message)
  res.status(code).json({ error: err.message })
})
