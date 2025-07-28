import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchJobs, fetchStats, patchJobStatus } from '../services/JobService'
import { Job, Stats, Status } from '../types/types'
import isEqual from 'lodash.isequal'

/**
 * Intervall in Millisekunden, nach dem die Daten automatisch aktualisiert werden.
 */
const UPDATE_INTERVAL = 5_000

/**
 * Custom-Hook zum Laden, Filtern und Aktualisieren von Jobs + Statistiken.
 * Alle Seiteneffekte sind „hook-konform“ – eslint:react-hooks/exhaustive-deps bleibt ruhig.
 */
const useJobs = () => {
  /* ---------- State ---------- */
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedFilter, setSelectedFilter] = useState('') // ausgewählter Statusfilter
  const [lastUpdate, setLastUpdate] = useState(new Date()) // Zeitstempel für UI
  const [refreshCount, setRefreshCount] = useState(0) // Anzahl Auto-Refreshs
  const [apiCallCount, setApiCallCount] = useState(0) // Anzahl API-Aufrufe
  const [expandedId, setExpandedId] = useState<number | null>(null) // aufgeklappte Karte

  /* ---------- 1. stabile Funktion zum Nachladen der Daten ---------- */
  const loadData = useCallback(async () => {
    setLoading(true)
    setApiCallCount((c) => c + 1)

    try {
      // beide Requests parallel, spart Zeit
      const [freshJobs, freshStats] = await Promise.all([fetchJobs(), fetchStats()])

      // nur setzen, wenn sich etwas wirklich geändert hat
      setJobs((prev) => (isEqual(prev, freshJobs) ? prev : freshJobs))
      setStats((prev) => (isEqual(prev, freshStats) ? prev : freshStats))

      setLastUpdate(new Date())
      setError(null)
    } catch (err: any) {
      setJobs([])
      setStats({})
      setError(err.message ?? 'Unbekannter Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, []) // ← kein Dependency-Eintrag → Funktion bleibt stabil

  /* ---------- 2. Effekt: initial + intervallbasiertes Nachladen ---------- */
  useEffect(() => {
    const tick = async () => {
      const scrollY = window.scrollY // Scroll-Position merken
      await loadData()
      window.scrollTo({ top: scrollY, behavior: 'auto' }) // Position beibehalten
      setRefreshCount((c) => c + 1)
    }

    tick() // einmal direkt beim Mounten
    const id = setInterval(tick, UPDATE_INTERVAL) // danach alle X Sekunden
    return () => clearInterval(id) // Aufräumen
  }, [loadData]) // eslint zufrieden

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
   * Status eines Jobs via API ändern und lokales State aktualisieren.
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
  }
}

export default useJobs
