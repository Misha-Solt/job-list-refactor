import JobCard from '../../components/JobCard/JobCard'
import Header from '../../components/Header/Header'
import Filter from '../../components/Filter/Filter'
import Loader from '../../components/Loader/Loader'
import styles from './jobList.module.css'
import StatsBar from '../../components/StatsBar/StatsBar'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'
import Footer from '../../components/Footer/Footer'
import useJobs from '../../hooks/useJobs'

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
    expandedId,
    handleExpand,
  } = useJobs()

  return (
    <div className={styles.container}>
      <Header lastUpdate={lastUpdate} apiCallCount={apiCallCount} refreshCount={refreshCount} />
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
              expanded={expandedId === job.id}
              onToggle={() => handleExpand(job.id)}
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
    </div>
  )
}
export default JobList
