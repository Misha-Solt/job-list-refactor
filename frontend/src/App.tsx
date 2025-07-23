import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import moment from 'moment'
import isEqual from 'lodash.isequal'

const API_URL = 'http://localhost:3001'

const UPDATE_INTERVAL = 5000

function App() {
  //------------------States-----------------------------------
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [visibleLoading, setVisibleLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [stats, setStats] = useState<any>({})
  // const [searchTerm, setSearchTerm] = useState('')
  // const [sortOrder, setSortOrder] = useState('asc')
  // const [currentPage, setCurrentPage] = useState(1)
  // const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [apiCallCount, setApiCallCount] = useState(0)

  //-----------------------------------------------------------

  useEffect(() => {
    // console.log('Component mounted')
    fetchAllJobs()
    fetchStats()
    document.title = 'Aufträge Liste - Loading...'

    const interval = setInterval(async () => {
      // console.log('Auto-refreshing jobs...')

      const scrollY = window.scrollY //fix scroll

      await fetchAllJobs()
      await fetchStats()

      window.scrollTo({ top: scrollY, behavior: 'auto' }) //fix scroll

      setRefreshCount((prev) => prev + 1)
    }, UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
      // console.log('Auto-refresh stopped')
    }
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (loading) {
      timer = setTimeout(() => {
        setVisibleLoading(true)
      }, 300)
    } else {
      setVisibleLoading(false)
    }

    return () => clearTimeout(timer)
  }, [loading])

  //-----------------------------------------------------------

  const filteredJobs = useMemo(() => {
    return !selectedFilter ? jobs : jobs.filter((i) => i.status === selectedFilter)
  }, [jobs, selectedFilter])

  //-----------------------------------------------------------

  const fetchAllJobs = async () => {
    setLoading(true)
    // console.log('Fetching all jobs...')
    setApiCallCount((prev) => prev + 1)
    try {
      const response = await axios.get(`${API_URL}/api/jobs`)
      const freshJobs = response.data
      if (!isEqual(jobs, freshJobs)) {
        setJobs(freshJobs)
      }
      setLastUpdate(new Date())
      document.title = `Aufträge Liste - ${response.data.length} Jobs`
      setLoading(false)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      setError(err.message)
      setJobs([])
    }
  }

  const handleFilterChange = async (status: string) => {
    setSelectedFilter(status)
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/stats`)
      if (!isEqual(stats, response.data)) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Stats error:', err)
    }
  }

  const getJobName = (job: any): string => job.title
  const getClientName = (job: any): string => job.customer
  const getDueDate = (job: any): string => {
    const date = job.due
    if (!date) return 'Kein Datum'
    return date.includes('-') ? moment(date).format('DD.MM.YYYY') : date
  }
  const getStatus = (job: any): string => job.status

  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  }

  const headerStyles: any = {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    textAlign: 'center',
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyles}>
        <h1 style={{ color: '#333', fontSize: '32px' }}>Aufträge Verwaltung</h1>
        <p style={{ color: '#666' }}>Zuletzt aktualisiert: {lastUpdate.toLocaleString()}</p>
        <div style={{ marginTop: '10px' }}>
          <span>API Calls: {apiCallCount}</span>
          <span style={{ marginLeft: '20px' }}>Refresh Count: {refreshCount}</span>
        </div>
      </div>

      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => handleFilterChange('')}
            style={{
              padding: '10px 20px',
              margin: '0 5px',
              backgroundColor: selectedFilter === '' ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Alle ({jobs.length})
          </button>
          <button
            onClick={() => handleFilterChange('Ausstehend')}
            style={{
              padding: '10px 20px',
              margin: '0 5px',
              backgroundColor: selectedFilter === 'Ausstehend' ? '#ffc107' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Ausstehend
          </button>
          <button
            onClick={() => handleFilterChange('In Bearbeitung')}
            style={{
              padding: '10px 20px',
              margin: '0 5px',
              backgroundColor: selectedFilter === 'In Bearbeitung' ? '#17a2b8' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            In Bearbeitung
          </button>
          <button
            onClick={() => handleFilterChange('Abgeschlossen')}
            style={{
              padding: '10px 20px',
              margin: '0 5px',
              backgroundColor: selectedFilter === 'Abgeschlossen' ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Abgeschlossen
          </button>
        </div>
      </div>

      {stats && (
        <div
          style={{ background: '#f9f9f9', padding: '15px', margin: '20px 0', textAlign: 'center' }}
        >
          <h3>Statistiken</h3>
          <div>
            Ausstehend: {stats['Ausstehend'] || 0} | In Bearbeitung: {stats['In Bearbeitung'] || 0}{' '}
            | Abgeschlossen: {stats['Abgeschlossen'] || 0} | Gesamt: {stats.total || 0}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffeeee' }}>Error: {error}</div>
      )}

      <div style={{ marginTop: '20px' }}>
        {visibleLoading && (
          <div style={{ textAlign: 'center', color: '#999' }}>Aktualisiere Daten...</div>
        )}
        {(selectedFilter ? filteredJobs : jobs).map((job: any, index: number) => (
          <div
            key={job.id}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSelectedJob(job)
              setShowDetails(!showDetails)
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{getJobName(job)}</div>
                <div style={{ color: '#666', marginTop: '5px' }}>Kunde: {getClientName(job)}</div>
                <div style={{ marginTop: '5px' }}>Fällig: {getDueDate(job)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    padding: '5px 10px',
                    borderRadius: '3px',
                    backgroundColor:
                      getStatus(job) === 'Ausstehend'
                        ? '#ffc107'
                        : getStatus(job) === 'In Bearbeitung'
                          ? '#17a2b8'
                          : getStatus(job) === 'Abgeschlossen'
                            ? '#28a745'
                            : '#6c757d',
                    color: 'white',
                    display: 'inline-block',
                  }}
                >
                  {getStatus(job)}
                </div>
                {job.notes && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                    Notiz: {job.notes}
                  </div>
                )}
              </div>
            </div>

            {showDetails && selectedJob?.id === job.id && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#f0f0f0' }}>
                <h4>Alle Daten:</h4>
                <pre>{JSON.stringify(job, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}

        {(selectedFilter ? filteredJobs : jobs).length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            Keine Aufträge gefunden
          </div>
        )}
      </div>

      <div style={{ marginTop: '50px', padding: '20px', background: '#f0f0f0', fontSize: '12px' }}>
        <div>Debug Info:</div>
        <div>Total Jobs Loaded: {jobs.length}</div>
        <div>Filtered Jobs: {filteredJobs.length}</div>
        <div>Current Filter: {selectedFilter || 'None'}</div>
        <div>Last API Call: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss Z')}</div>
      </div>
    </div>
  )
}

export default App
