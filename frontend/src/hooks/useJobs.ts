import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchJobs, fetchStats, patchJobStatus } from '../services/JobService'
import { Job, Stats, Status } from '../types/types'
import isEqual from 'lodash.isequal'
import { useToast } from '../ui/ToastProvider'

/**
 * Intervall in Millisekunden, nach dem die Daten automatisch aktualisiert werden.
 */
const UPDATE_INTERVAL = 5_000

/**
 * Custom-Hook zum Laden, Filtern und Aktualisieren von Jobs + Statistiken.
 * Alle Seiteneffekte sind „hook-konform“ – eslint:react-hooks/exhaustive-deps bleibt ruhig.
 */
const useJobs = () => {

  /* ---------- States ---------- */
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedFilter, setSelectedFilter] = useState('') // ausgewählter Statusfilter
  const [lastUpdate, setLastUpdate] = useState(new Date()) // Zeitstempel für UI
  const [refreshCount, setRefreshCount] = useState(0) // Anzahl Auto-Refreshs
  const [apiCallCount, setApiCallCount] = useState(0) // Anzahl API-Aufrufe
  const [expandedId, setExpandedId] = useState<number | null>(null) // aufgeklappte Karte

  /* ---------- Optimismus/Undo: Overlay & Pending ---------- */
  // Overlay: lokale Status-Überschreibungen, bis Undo-Fenster abläuft
  const [overlayStatus, setOverlayStatus] = useState<Record<number, Status>>({})
  // Pending: speichert Vorzustand + Timer pro Job
  const pendingRef = useRef<Record<number, { prev: Status; timer: ReturnType<typeof setTimeout> }>>(
    {},
  )
  // Referenz auf Overlay für loadData (keine Hook-Dependencies → stabil)
  const overlayRef = useRef<Record<number, Status>>({})
  useEffect(() => {
    overlayRef.current = overlayStatus
  }, [overlayStatus])

  const { show } = useToast()

  /* ---------- 1. stabile Funktion zum Nachladen der Daten ---------- */
  const loadData = useCallback(async () => {
    setLoading(true)
    setApiCallCount((c) => c + 1)

    try {
       const [freshJobs, freshStats] = await Promise.all([fetchJobs(), fetchStats()])

      // Overlay anwenden, damit Auto-Refresh den Optimismus nicht „wegblinkt“
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

  /* ---------- 2. Effekt: initial + intervallbasiertes Nachladen ---------- */
  useEffect(() => {
    loadData()
    const id = setInterval(async () => {
      const scrollY = window.scrollY // Scroll-Position merken
      await loadData() // ++apiCallCount
      window.scrollTo({ top: scrollY, behavior: 'auto' }) // Position beibehalten
      setRefreshCount((c) => c + 1) // ++refreshCount
    }, UPDATE_INTERVAL)

    return () => clearInterval(id) // Aufräumen
  }, [loadData])

  /* ---------- 3. Abgeleitete Daten: gefilterte Jobs ---------- */
  const filteredJobs = useMemo(
    () => (!selectedFilter ? jobs : jobs.filter((j) => j.status === selectedFilter)),
    [jobs, selectedFilter],
  )

  /* ---------- 4. UI-Callbacks ---------- */
  const handleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  /**
   * Nicht-optimistische Statusänderung (beibehaltener Legacy-Weg).
   * Passt auf neuen Rückgabetyp { id, status, previousStatus } an.
   */
  const updateJobStatus = async (id: number, newStatus: Status) => {
    try {
      const updated = await patchJobStatus(id, newStatus)

      // Jobliste lokal anpassen
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: updated.status } : j)))

      // Statistiken nachziehen
      const freshStats = await fetchStats()
      setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))
    } catch (err) {
      console.error('Statusupdate fehlgeschlagen:', err)
      setError('Status konnte nicht geändert werden')
    }
  }

  /**
   * Optimistische Statusänderung mit Undo-Fenster.
   * - UI wechselt sofort zum neuen Status
   * - Server wird gepatcht
   * - Toast zeigt „Rückgängig“ für undoWindowMs
   * - Auto-Refresh respektiert Overlay bis zur Finalisierung
   */
  const updateJobStatusOptimistic = async (
    id: number,
    newStatus: Status,
    opts?: { undoWindowMs?: number },
  ) => {
    const undoWindowMs = opts?.undoWindowMs ?? 10_000

    // Aktuellen Job + Vorstatus ermitteln
    const current = jobs.find((j) => j.id === id)
    if (!current) return
    const prev = current.status

    // 1) Sofortiges UI-Update (Overlay + lokale Liste)
    setOverlayStatus((m) => ({ ...m, [id]: newStatus }))
    setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: newStatus } : j)))

    try {
      // 2) Server patchen
      await patchJobStatus(id, newStatus)
    } catch (err) {
      // Fehler → harter Rollback
      setOverlayStatus(({ [id]: _, ...rest }) => rest)
      setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: prev } : j)))
      setError('Status konnte nicht geändert werden (Netzwerk/Serverfehler)')
      show({ message: 'Änderung fehlgeschlagen. Rückgängig gemacht.' })
      return
    }

    // 3) Undo-Fenster starten (Finalisierung nach Ablauf)
    const finalize = async () => {
      delete pendingRef.current[id]
      // Overlay entfernen → künftiger Auto-Refresh zeigt Serverzustand
      setOverlayStatus(({ [id]: _, ...rest }) => rest)
      // Statistiken frisch holen (optional, aber sinnvoll)
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
      actionLabel: 'Stornieren',
      duration: undoWindowMs,
      onAction: async () => {
        const pending = pendingRef.current[id]
        if (!pending) return
        clearTimeout(pending.timer)

        try {
          await patchJobStatus(id, pending.prev)
        } finally {
          // Lokalen Zustand sofort zurückdrehen
          setOverlayStatus(({ [id]: _, ...rest }) => rest)
          setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status: pending.prev } : j)))
          delete pendingRef.current[id]
          // Statistiken frisch holen
          try {
            const freshStats = await fetchStats()
            setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))
          } catch {}
        }
      },
    })
  }

  /* ---------- 5. Rückgabeobjekt des Hooks ---------- */
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
    expandedId,
    handleExpand,
    updateJobStatus,
    updateJobStatusOptimistic,
  }
}

export default useJobs
