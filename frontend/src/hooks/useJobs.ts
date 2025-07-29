import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchJobs, fetchStats, patchJobStatus } from '../services/JobService'
import { Job, Stats, Status } from '../types/types'
import isEqual from 'lodash.isequal'
import { useToast } from '../ui/ToastProvider'

const UPDATE_INTERVAL = 5_000

const useJobs = () => {
  /* ---------- States ---------- */
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedFilter, setSelectedFilter] = useState('') // aktiver Statusfilter
  const [lastUpdate, setLastUpdate] = useState(new Date()) // Zeitstempel fürs UI
  const [refreshCount, setRefreshCount] = useState(0) // Auto-Refresh-Zähler
  const [apiCallCount, setApiCallCount] = useState(0) // API-Call-Zähler

  /* ---------- Modal-Steuerung  ---------- */
  const [detailsId, setDetailsId] = useState<number | null>(null) // aktuell geöffneter Job im Modal
  const openDetails = (id: number) => setDetailsId(id)
  const closeDetails = () => setDetailsId(null)
  const selectedJob = useMemo<Job | null>(
    () => (detailsId != null ? (jobs.find((j) => j.id === detailsId) ?? null) : null),
    [detailsId, jobs],
  )

  /* ---------- Optimismus/Undo: Overlay & Pending ---------- */
  const [overlayStatus, setOverlayStatus] = useState<Record<number, Status>>({})
  const pendingRef = useRef<Record<number, { prev: Status; timer: ReturnType<typeof setTimeout> }>>(
    {},
  )
  const overlayRef = useRef<Record<number, Status>>({})
  useEffect(() => {
    overlayRef.current = overlayStatus
  }, [overlayStatus])

  const { show } = useToast()

  /* ---------- 1) Laden ---------- */
  const loadData = useCallback(async () => {
    setLoading(true)
    setApiCallCount((c) => c + 1)

    try {
      const [freshJobs, freshStats] = await Promise.all([fetchJobs(), fetchStats()])
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

  /* ---------- 2) Auto-Refresh ---------- */
  useEffect(() => {
    loadData()
    const id = setInterval(async () => {
      const y = window.scrollY
      await loadData()
      window.scrollTo({ top: y, behavior: 'auto' })
      setRefreshCount((c) => c + 1)
    }, UPDATE_INTERVAL)
    return () => clearInterval(id)
  }, [loadData])

  /* ---------- 3) Abgeleitete Daten ---------- */
  const filteredJobs = useMemo(
    () => (!selectedFilter ? jobs : jobs.filter((j) => j.status === selectedFilter)),
    [jobs, selectedFilter],
  )

  /* ---------- 4) Status-Änderungen ---------- */
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

    // Sofortiges UI-Update
    setOverlayStatus((m) => ({ ...m, [id]: newStatus }))
    setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: newStatus } : j)))
    // Optimistische Stats-Delta
    setStats((s) => {
      const next = { ...s }
      next[prev] = Math.max(0, (Number(next[prev]) || 0) - 1)
      next[newStatus] = (Number(next[newStatus]) || 0) + 1
      return next
    })

    try {
      await patchJobStatus(id, newStatus)
    } catch {
      // harter Rollback
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

    // Status-API
    updateJobStatus,
    updateJobStatusOptimistic,
  }
}

export default useJobs
