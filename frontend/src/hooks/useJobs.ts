import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchJobs, fetchStats, patchJobStatus } from '../services/JobService'
import { Job, Stats, Status } from '../types/types'
import isEqual from 'lodash.isequal'
import { useToast } from '../ui/ToastProvider'

/** Intervall (ms) für Auto-Refresh */
const UPDATE_INTERVAL = 5_000

const useJobs = () => {
  /* ---------- Basis-States ---------- */
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedFilter, setSelectedFilter] = useState('') // aktiver Status-Filter
  const [lastUpdate, setLastUpdate] = useState(new Date()) // Zeitstempel fürs UI
  const [refreshCount, setRefreshCount] = useState(0) // Anzahl Auto-/Manueller Refreshes
  const [apiCallCount, setApiCallCount] = useState(0) // Anzahl API-Aufrufe (fetchJobs/fetchStats)

  /* ---------- Details-Modal (ersetzt früheren Accordion-State) ---------- */
  const [detailsId, setDetailsId] = useState<number | null>(null)
  const openDetails = (id: number) => setDetailsId(id)
  const closeDetails = () => setDetailsId(null)
  const selectedJob = useMemo<Job | null>(
    () => (detailsId != null ? (jobs.find((j) => j.id === detailsId) ?? null) : null),
    [detailsId, jobs],
  )

  /* ---------- Auto-Refresh: Ein/Aus + Persistenz ---------- */
  // Default = true, wird in localStorage persistiert
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('autoRefreshEnabled')
      return raw == null ? true : JSON.parse(raw)
    } catch {
      return true
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('autoRefreshEnabled', JSON.stringify(autoRefreshEnabled))
    } catch {}
  }, [autoRefreshEnabled])

  /* ---------- Optimismus/Undo: Overlay & Pending ---------- */
  // Overlay hält lokale Statusüberschreibungen bis zur Finalisierung (Undo-Fenster)
  const [overlayStatus, setOverlayStatus] = useState<Record<number, Status>>({})
  const pendingRef = useRef<Record<number, { prev: Status; timer: ReturnType<typeof setTimeout> }>>(
    {},
  )
  const overlayRef = useRef<Record<number, Status>>({})
  useEffect(() => {
    overlayRef.current = overlayStatus
  }, [overlayStatus])

  const { show } = useToast()

  /* ---------- 1) Laden (zentral) ---------- */
  const loadData = useCallback(async () => {
    setLoading(true)
    setApiCallCount((c) => c + 1)
    try {
      const [freshJobs, freshStats] = await Promise.all([fetchJobs(), fetchStats()])

      // Optimistische Overlays in die UI „projizieren“, ohne sie im State umzuschreiben
      const merged = freshJobs.map((j) => {
        const ov = overlayRef.current[j.id]
        return ov ? { ...j, status: ov } : j
      })

      setJobs((prev) => (isEqual(prev, merged) ? prev : merged))
      setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))
      setLastUpdate(new Date())
      setError(null)
    } catch (err: any) {
      setJobs([])
      setStats({})
      setError(err?.message ?? 'Unbekannter Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- Schutz vor Überlappung paralleler Loads ---------- */
  const inFlightRef = useRef(false)

  /* ---------- 2) Initial laden + bedingter Auto-Refresh ---------- */
  useEffect(() => {
    // initial
    loadData()

    // Auto-Refresh pausieren, wenn Modal offen ist
    if (!autoRefreshEnabled || detailsId != null) return
    const tick = async () => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      const y = window.scrollY
      try {
        await loadData()
      } finally {
        inFlightRef.current = false
        window.scrollTo({ top: y, behavior: 'auto' })
        setRefreshCount((c) => c + 1)
      }
    }

    const id = setInterval(tick, UPDATE_INTERVAL)
    return () => clearInterval(id)
  }, [loadData, autoRefreshEnabled, detailsId])

  /* ---------- Auto-Refresh bei versteckter Seite pausieren ----------*/

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) return
      // Nur nachladen, wenn Auto-Refresh aktiv ist und KEINE Modalkarte offen ist
      if (!autoRefreshEnabled || detailsId != null) return
      if (!inFlightRef.current) void loadData()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [loadData, autoRefreshEnabled, detailsId])

  /* ---------- Manuelles Nachladen (für „Jetzt aktualisieren“) ---------- */
  const refreshNow = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      await loadData()
      setRefreshCount((c) => c + 1)
    } finally {
      inFlightRef.current = false
    }
  }, [loadData])

  /* ---------- 3) Abgeleitete Daten ---------- */
  const filteredJobs = useMemo(
    () => (!selectedFilter ? jobs : jobs.filter((j) => j.status === selectedFilter)),
    [jobs, selectedFilter],
  )

  /* ---------- 4) Status-Änderungen ---------- */
  // Nicht-optimistische Variante (Legacy)
  const updateJobStatus = async (id: number, newStatus: Status) => {
    try {
      const updated = await patchJobStatus(id, newStatus)
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: updated.status } : j)))
      const freshStats = await fetchStats()
      setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))
    } catch (err) {
      console.error('Statusupdate fehlgeschlagen:', err)
      setError('Status konnte nicht geändert werden')
    }
  }

  // Optimistische Variante mit Undo-Fenster
  const updateJobStatusOptimistic = async (
    id: number,
    newStatus: Status,
    opts?: { undoWindowMs?: number },
  ) => {
    const undoWindowMs = opts?.undoWindowMs ?? 10_000

    const current = jobs.find((j) => j.id === id)
    if (!current) return
    const prev = current.status
    if (prev === newStatus) return

    // 1) Sofortiges UI-Update (Overlay + lokale Liste) + optimistische Stats-Delta
    setOverlayStatus((m) => ({ ...m, [id]: newStatus }))
    setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: newStatus } : j)))
    setStats((s) => {
      const next = { ...s }
      next[prev] = Math.max(0, (Number(next[prev]) || 0) - 1)
      next[newStatus] = (Number(next[newStatus]) || 0) + 1
      return next
    })

    // 2) Server patchen
    try {
      await patchJobStatus(id, newStatus)
    } catch {
      // 2b) harter Rollback
      setOverlayStatus(({ [id]: _, ...rest }) => rest)
      setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: prev } : j)))
      setStats((s) => {
        const next = { ...s }
        next[prev] = (Number(next[prev]) || 0) + 1
        next[newStatus] = Math.max(0, (Number(next[newStatus]) || 0) - 1)
        return next
      })
      setError('Status konnte nicht geändert werden (Netzwerk/Serverfehler)')
      show({ message: 'Änderung fehlgeschlagen. Rückgängig gemacht.' })
      return
    }

    // 3) Undo-Fenster: Finalisierung nach Ablauf
    const existing = pendingRef.current[id]
    if (existing) clearTimeout(existing.timer)

    const finalize = async () => {
      delete pendingRef.current[id]
      setOverlayStatus(({ [id]: _, ...rest }) => rest)
      try {
        const freshStats = await fetchStats()
        setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))
      } catch {}
    }

    const timer = setTimeout(finalize, undoWindowMs)
    pendingRef.current[id] = { prev, timer }

    // 4) Toast mit Undo-Aktion
    show({
      message: 'Status aktualisiert.',
      actionLabel: 'Rückgängig',
      duration: undoWindowMs,
      onAction: async () => {
        const pending = pendingRef.current[id]
        if (!pending) return
        clearTimeout(pending.timer)
        try {
          await patchJobStatus(id, pending.prev)
        } finally {
          setOverlayStatus(({ [id]: _, ...rest }) => rest)
          setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: pending.prev } : j)))
          delete pendingRef.current[id]
          setStats((s) => {
            const next = { ...s }
            next[newStatus] = Math.max(0, (Number(next[newStatus]) || 0) - 1)
            next[pending.prev] = (Number(next[pending.prev]) || 0) + 1
            return next
          })
          try {
            const freshStats = await fetchStats()
            setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))
          } catch {}
        }
      },
    })
  }

  /* ---------- 5) Rückgabe ---------- */
  return {
    jobs,
    stats,
    loading,
    error,
    selectedFilter,
    setSelectedFilter,
    lastUpdate,
    refreshCount,
    apiCallCount,
    filteredJobs,

    // Modal
    detailsId,
    selectedJob,
    openDetails,
    closeDetails,

    // Auto-Refresh API
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refreshNow,

    // Status-API
    updateJobStatus,
    updateJobStatusOptimistic,
  }
}

export default useJobs
