// src/services/JobService.ts
/**
 * Zentraler Wrapper für alle HTTP-Aufrufe rund um Jobs.
 *
 * Endpunkte:
 *   GET   /api/jobs?status=…        – komplette oder gefilterte Liste
 *   GET   /api/jobs/stats           – aggregierte Kennzahlen
 *   PATCH /api/jobs/:id/status      – Status eines Jobs ändern
 */

import axios, { AxiosError } from 'axios'
import { Job, Stats, Status } from '../types/types'

/** Basis-URL des API-Servers (Vite-Env oder Fallback). */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

/* ---------- Typen ---------- */

/** Rückgabe von PATCH /jobs/:id/status – wichtig fürs Undo. */
export interface PatchStatusResponse {
  id: number
  status: Status
  previousStatus: Status
}

/* ---------- Helper ---------- */

/** Axios-Instanz mit Basis-URL – vereinfacht die Aufrufe. */
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

/* ---------- API-Funktionen ---------- */

/**
 * Lädt die Job-Liste (optional gefiltert nach Status).
 * @param status – 'all' | 'pending' | 'in_progress' | 'done'
 */
export const fetchJobs = async (status: 'all' | Status = 'all'): Promise<Job[]> => {
  const res = await api.get<Job[]>('/jobs', {
    params: status === 'all' ? undefined : { status },
  })
  return res.data
}

/** Ruft aggregierte Statistiken ab. */
export const fetchStats = async (): Promise<Stats> => {
  const res = await api.get<Stats>('/jobs/stats')
  return res.data
}

/**
 * Ändert den Status eines Jobs.
 * Liefert `{ id, status, previousStatus }`, womit das UI ein Undo anbieten kann.
 */
export const patchJobStatus = async (id: number, status: Status): Promise<PatchStatusResponse> => {
  try {
    const res = await api.patch<PatchStatusResponse>(`/jobs/${id}/status`, { status })
    return res.data
  } catch (err) {
    const axiosErr = err as AxiosError
    const code = axiosErr.response?.status ?? 'NETWORK'
    // Fehlertext bewusst kurz – UI zeigt ihn in einem Toast an
    throw new Error(`Status-Update fehlgeschlagen (Code: ${code})`)
  }
}
