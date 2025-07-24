import { useEffect, useState } from 'react'
import { fetchJobs } from '../../services/JobService'
import JobCard from '../../components/JobCard/JobCard'
import { Job } from '../../types/types'

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const loadJobs = async () => {
      const data = await fetchJobs()
      setJobs(data)
      setLoading(false)
    }

    loadJobs()
    interval = setInterval(loadJobs, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading) return <p>Lade Daten...</p>

  return (
    <div>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
