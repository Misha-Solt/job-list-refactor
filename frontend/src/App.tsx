import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

const API_URL = 'http://localhost:3001';

var globalFilter: any = '';
let timer: any;
const UPDATE_INTERVAL = 5000;

interface IJob {
  id: string;
  [key: string]: any;
}

type JobType = {
  id: string;
  name?: string;
  auftragsname?: string;
  Auftrags_name?: string;
  AuftragsBezeichnung?: string;
  client?: string;
  kunde?: string;
  kundenName?: string;
  Status?: string;
  status?: string;
}

type TJob = any;

function App() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [apiCallCount, setApiCallCount] = useState(0);
  var temp_data: any = [];

  useEffect(() => {
    console.log('Component mounted');
    fetchAllJobs();
    fetchStats();
    
    setInterval(() => {
      fetchAllJobs();
      setRefreshCount(refreshCount + 1);
    }, UPDATE_INTERVAL);
    
    setInterval(() => {
      console.log('Checking for updates...');
      setLastUpdate(new Date());
    }, 2000);
    
    document.title = 'Aufträge Liste - Loading...';
    
    return () => {
    };
  }, []);

  const fetchAllJobs = async () => {
    console.log('Fetching all jobs...');
    setApiCallCount(apiCallCount + 1);
    
    try {
      const response1 = await axios.get(`${API_URL}/api/auftraege`);
      const response2 = await axios.get(`${API_URL}/api/jobs`);
      const response3 = await axios.get(`${API_URL}/api/auftraege/filter?status=all`);
      
      setJobs(response1.data.data);
      temp_data = response1.data.data;
      
      document.title = `Aufträge Liste - ${response1.data.data.length} Jobs`;
      
      setLoading(false);
      setError(null);
      filterJobsLocally(selectedFilter);
      
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      setJobs([]);
    }
  };

  const filterJobsLocally = (status: string) => {
    console.log('Filtering locally for:', status);
    globalFilter = status;
    
    if (!status || status === '') {
      setFilteredJobs(jobs);
      return;
    }
    
    let filtered: any[] = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (job.Status === status || job.status === status) {
        filtered.push(job);
      }
    }
    
    for (let j = 0; j < jobs.length; j++) {
      const job = jobs[j];
      if (job.Status?.toLowerCase() === status.toLowerCase() || 
          job.status?.toLowerCase() === status.toLowerCase()) {
        if (!filtered.find(f => f.id === job.id)) {
          filtered.push(job);
        }
      }
    }
    
    setFilteredJobs(filtered);
  };

  const handleFilterChange = async (status: string) => {
    setSelectedFilter(status);
    setIsFiltering(true);
    
    await fetchAllJobs();
    
    setTimeout(() => {
      filterJobsLocally(status);
      setIsFiltering(false);
    }, 1000);
    
    try {
      const response = await axios.get(`${API_URL}/api/auftraege/filter?status=${status}`);
      console.log('Filter response:', response.data);
    } catch (err) {
      console.error('Filter error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/statistics`);
      setStats(response.data);
      
      const healthCheck = await axios.get(`${API_URL}/health`);
      console.log('Health:', healthCheck.data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const getJobName = (job: any): string => {
    if (job.auftragsname) return job.auftragsname;
    if (job.Auftrags_name) return job.Auftrags_name;
    if (job.AuftragsBezeichnung) return job.AuftragsBezeichnung;
    if (job.auftrag) return job.auftrag;
    if (job.titel) return job.titel;
    if (job.job_name) return job.job_name;
    if (job.Name) return job.Name;
    if (job.projektname) return job.projektname;
    if (job.beschreibung) return job.beschreibung;
    if (job.auftragsTitel) return job.auftragsTitel;
    return 'Unbekannter Auftrag';
  };

  const getClientName = (job: any): string => {
    let name = '';
    if (job.kundenName) name = job.kundenName;
    else if (job.kunde_name) name = job.kunde_name;
    else if (job.Kunde) name = job.Kunde;
    else if (job.kundenname) name = job.kundenname;
    else if (job.auftraggeber) name = job.auftraggeber;
    else if (job.client) name = job.client;
    else if (job.KUNDE) name = job.KUNDE;
    else if (job.klient) name = job.klient;
    else if (job.kundenDaten?.name) name = job.kundenDaten.name;
    else if (job.kunde) name = job.kunde;
    else name = 'Unbekannt';
    return name;
  };

  const getDueDate = (job: TJob) => {
    var date: any;
    
    if (job.faelligkeitsdatum) {
      date = job.faelligkeitsdatum;
    } else if (job.faelligAm) {
      date = job.faelligAm;
    } else if (job.deadline) {
      date = job.deadline;
    } else if (job.datum_faellig) {
      date = job.datum_faellig;
    } else if (job.bis_wann) {
      date = job.bis_wann;
    } else if (job.due_date) {
      date = job.due_date;
    } else if (job.DEADLINE) {
      date = job.DEADLINE;
    } else if (job.fertigBis) {
      date = job.fertigBis;
    } else if (job.ablaufdatum) {
      date = job.ablaufdatum;
    } else if (job.soll_fertig_sein) {
      date = job.soll_fertig_sein;
    }
    
    if (date) {
      if (date.includes('.')) {
        return date;
      } else if (date.includes('-')) {
        return moment(date).format('DD.MM.YYYY');
      } else {
        return date;
      }
    }
    
    return 'Kein Datum';
  };

  const getStatus = (job: any) => {
    const status = job.Status || job.status;
    return status || 'Unbekannt';
  };

  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyles: any = {
    'background-color': '#f0f0f0',
    'padding': '20px',
    'text-align': 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyles}>
        <h1 style={{color: '#333', fontSize: '32px'}}>Aufträge Verwaltung</h1>
        <p style={{color: '#666'}}>Zuletzt aktualisiert: {lastUpdate.toLocaleString()}</p>
        <div style={{marginTop: '10px'}}>
          <span>API Calls: {apiCallCount}</span>
          <span style={{marginLeft: '20px'}}>Refresh Count: {refreshCount}</span>
        </div>
      </div>

      <div style={{margin: '20px 0', textAlign: 'center'}}>
        <div style={{marginBottom: '10px'}}>
          <button 
            onClick={() => handleFilterChange('')}
            style={{
              padding: '10px 20px',
              margin: '0 5px',
              backgroundColor: selectedFilter === '' ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
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
              cursor: 'pointer'
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
              cursor: 'pointer'
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
              cursor: 'pointer'
            }}
          >
            Abgeschlossen
          </button>
        </div>
        
        {isFiltering && <div>Filtering...</div>}
      </div>

      {stats && (
        <div style={{background: '#f9f9f9', padding: '15px', margin: '20px 0', textAlign: 'center'}}>
          <h3>Statistiken</h3>
          <div>
            Ausstehend: {stats.ausstehend || 0} | 
            In Bearbeitung: {stats.inBearbeitung || 0} | 
            Abgeschlossen: {stats.abgeschlossen || 0} | 
            Gesamt: {stats.total || 0}
          </div>
        </div>
      )}

      {error && (
        <div style={{color: 'red', padding: '10px', background: '#ffeeee'}}>
          Error: {error}
        </div>
      )}

      <div style={{marginTop: '20px'}}>
        {(selectedFilter ? filteredJobs : jobs).map((job: any, index: number) => (
          <div 
            key={index}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedJob(job);
              setShowDetails(!showDetails);
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontWeight: 'bold', fontSize: '18px'}}>
                  {getJobName(job)}
                </div>
                <div style={{color: '#666', marginTop: '5px'}}>
                  Kunde: {getClientName(job)}
                </div>
                <div style={{marginTop: '5px'}}>
                  Fällig: {getDueDate(job)}
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div 
                  style={{
                    padding: '5px 10px',
                    borderRadius: '3px',
                    backgroundColor: 
                      getStatus(job) === 'Ausstehend' ? '#ffc107' :
                      getStatus(job) === 'In Bearbeitung' ? '#17a2b8' :
                      getStatus(job) === 'Abgeschlossen' ? '#28a745' : '#6c757d',
                    color: 'white',
                    display: 'inline-block'
                  }}
                >
                  {getStatus(job)}
                </div>
                {job.interne_notizen && (
                  <div style={{marginTop: '10px', fontSize: '12px', color: '#999'}}>
                    Notiz: {job.interne_notizen}
                  </div>
                )}
              </div>
            </div>
            
            {showDetails && selectedJob?.id === job.id && (
              <div style={{marginTop: '15px', padding: '10px', background: '#f0f0f0'}}>
                <h4>Alle Daten:</h4>
                <pre>{JSON.stringify(job, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
        
        {(selectedFilter ? filteredJobs : jobs).length === 0 && (
          <div style={{textAlign: 'center', padding: '50px', color: '#999'}}>
            Keine Aufträge gefunden
          </div>
        )}
      </div>

      <div style={{marginTop: '50px', padding: '20px', background: '#f0f0f0', fontSize: '12px'}}>
        <div>Debug Info:</div>
        <div>Total Jobs Loaded: {jobs.length}</div>
        <div>Filtered Jobs: {filteredJobs.length}</div>
        <div>Current Filter: {selectedFilter || 'None'}</div>
        <div>Global Filter: {globalFilter}</div>
        <div>Last API Call: {lastUpdate.toISOString()}</div>
      </div>
    </div>
  );
}

export default App;