import JobCard from '../../components/JobCard/JobCard'
import Header from '../../components/Header/Header'
import Filter from '../../components/Filter/Filter'
import Loader from '../../components/Loader/Loader'
import styles from './jobList.module.css'
import StatsBar from '../../components/StatsBar/StatsBar'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'
import Footer from '../../components/Footer/Footer'
import useJobs from '../../hooks/useJobs'
import { useCallback } from 'react'
import type { Status } from '../../types/types'
import JobDetailsModal from '../../components/JobDetailsModal/JobDetailsModal'

const JobList = () => {
  const {
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

    // Modal aus useJobs
    detailsId,
    selectedJob,
    openDetails,
    closeDetails,

    // Status API
    updateJobStatusOptimistic,

    // Autorefresh
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refreshNow,
  } = useJobs()

  // Nächster Status bestimmen
  const getNext = (current: Status) =>
    current === 'pending' ? 'in_progress' : current === 'in_progress' ? 'done' : null

  const onNext = useCallback(
    (id: number, current: Status) => {
      const next = getNext(current)
      if (next) updateJobStatusOptimistic(id, next, { undoWindowMs: 10_000 })
    },
    [updateJobStatusOptimistic],
  )

  const onReset = useCallback(
    (id: number) => {
      updateJobStatusOptimistic(id, 'pending', { undoWindowMs: 10_000 })
    },
    [updateJobStatusOptimistic],
  )

  return (
    <div className={styles.container}>
      <Header
        lastUpdate={lastUpdate}
        apiCallCount={apiCallCount}
        refreshCount={refreshCount}
        autoRefreshEnabled={autoRefreshEnabled}
        setAutoRefreshEnabled={setAutoRefreshEnabled}
        onRefreshNow={refreshNow}
      />
      <Filter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
      <StatsBar stats={stats} />
      {error && <ErrorMessage message={error} />}
      <Loader loading={loading} />
      {/* JOB LIST */}
      <section className={styles.jobSection}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onOpenDetails={openDetails}
              onNext={onNext}
              onReset={onReset}
            />
          ))
        ) : (
          <div className={styles.emptyMessage}>Keine Aufträge gefunden</div>
        )}
      </section>
      <Footer
        totalJobs={jobs.length}
        filteredJobs={jobs.length - filteredJobs.length}
        selectedFilter={selectedFilter}
        lastUpdate={lastUpdate}
      />
      {/* Eine einzige Modal-Instanz */}
      {detailsId != null && selectedJob && (
        <JobDetailsModal isOpen={true} onRequestClose={closeDetails} job={selectedJob} />
      )}
    </div>
  )
}

export default JobList
