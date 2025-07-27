import { useEffect, useMemo, useState, useCallback } from 'react'
import { fetchJobs, fetchStats } from '../services/JobService'
import { Job, Stats, Status } from '../types/types'
import isEqual from 'lodash.isequal'
import { patchJobStatus } from '../services/JobService'

const UPDATE_INTERVAL = 5000

const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [refreshCount, setRefreshCount] = useState(0)
  const [apiCallCount, setApiCallCount] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      const scrollY = window.scrollY
      loadData()
      window.scrollTo({ top: scrollY, behavior: 'auto' })
      setRefreshCount((c) => c + 1)
    }, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setApiCallCount((c) => c + 1)
    try {
      const freshJobs = await fetchJobs()
      if (!isEqual(jobs, freshJobs)) setJobs(freshJobs)
      const freshStats = await fetchStats()
      if (!isEqual(stats, freshStats)) setStats(freshStats)
      setLastUpdate(new Date())
      setError(null)
    } catch (err: any) {
      setJobs([])
      setStats({})
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [jobs, stats])

  const filteredJobs = useMemo(() => {
    return !selectedFilter ? jobs : jobs.filter((j) => j.status === selectedFilter)
  }, [jobs, selectedFilter])

  const handleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const updateJobStatus = async (id: number, newStatus: Status) => {
    try {
      const updated = await patchJobStatus(id, newStatus)

      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, status: updated.status } : job)),
      )

      const freshStats = await fetchStats()
      setStats(freshStats)
    } catch (err) {
      console.error('Status update failed:', err)
      setError('Status konnte nicht geändert werden')
    }
  }

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
