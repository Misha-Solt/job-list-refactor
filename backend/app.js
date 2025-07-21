// backend/src/app.js   (ESM)

import express from 'express'
import cors from 'cors'
import pino from 'pino'

import { jobRoutes } from './src/routes/jobRoutes.js'

const log = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } })

export const app = express()

/* ────────────── Middlewares ────────────── */
app.use(cors())
app.use(express.json())

/* ────────────── Routes ────────────── */
app.use('/api/jobs', jobRoutes)

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
