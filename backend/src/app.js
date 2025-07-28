import express from 'express'
import cors from 'cors'
import pino from 'pino'
import path from 'path'
import { fileURLToPath } from 'url'
import { jobRoutes } from './routes/jobRoutes.js'

const log = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } })
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Absoluter Pfad zum Vite-Build-Ordner
const distPath = path.resolve(__dirname, '../../../frontend/dist')

export const app = express()

/* ────────────── Middlewares ────────────── */
app.use(cors())
app.use(express.json())

/* ────────────── Routes ────────────── */
app.use('/api/jobs', jobRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

/* ────────────── Statische Dateien ausliefern ────────────── */
app.use(express.static(distPath))

/* ────────────── Fallback für Single-Page-Application ────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

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
