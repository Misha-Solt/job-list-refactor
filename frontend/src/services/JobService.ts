/**
 * Zentraler Wrapper für alle HTTP-Aufrufe rund um Jobs.
 * Alle Funktionen liefern Promises und reichen Fehler nach oben weiter.
 *
 * Endpunkte (dev):
 *   GET  /api/jobs           – komplette Liste aller Jobs
 *   GET  /api/jobs/stats     – aggregierte Kennzahlen
 *   PATCH /api/jobs/:id/status { status } – Status eines Jobs ändern
 */

import axios from 'axios'
import { Job, Stats, Status } from '../types/types'

/** Basisadresse für den Backend-API-Server. */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Lädt die komplette Job-Liste.
 *
 * @returns Promise<Job[]>  – Array mit Job-Objekten vom Server
 * @throws  AxiosError      – wird an Aufrufer weitergereicht
 */
export const fetchJobs = async (): Promise<Job[]> => {
  const res = await axios.get<Job[]>(`${API_URL}/jobs`)
  return res.data
}

/**
 * Ruft aggregierte Statistiken ab (z. B. Anzahl pro Status).
 *
 * @returns Promise<Stats>  – Statistiken als Key-Value-Map
 * @throws  AxiosError
 */
export const fetchStats = async (): Promise<Stats> => {
  const res = await axios.get<Stats>(`${API_URL}/jobs/stats`)
  return res.data
}

/**
 * Ändert den Status eines einzelnen Jobs.
 *
 * @param id      – ID des Jobs
 * @param status  – neuer Status (Enum `Status`)
 * @returns Promise<Job> – aktualisiertes Job-Objekt vom Server
 *
 * @throws Error – wenn die HTTP-Antwort kein 2xx liefert
 */
export const patchJobStatus = async (id: number, status: Status): Promise<Job> => {
  const res = await fetch(`${API_URL}/jobs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    // Fehlermeldung bewusst deutlich, damit sie im UI angezeigt werden kann
    throw new Error(`PATCH /jobs/${id}/status failed – HTTP ${res.status}`)
  }

  return res.json() as Promise<Job>
}
