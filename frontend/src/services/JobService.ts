import axios from 'axios'
import { Job, Stats, Status } from '../types/types'

const API_URL = 'http://localhost:3001/api'

export const fetchJobs = async (): Promise<Job[]> => {
  const res = await axios.get(`${API_URL}/jobs`)
  return res.data
}

export const fetchStats = async (): Promise<Stats> => {
  const res = await axios.get(`${API_URL}/jobs/stats`)
  return res.data
}

export const patchJobStatus = async (id: number, status: Status): Promise<Job> => {
  const res = await fetch(`${API_URL}/jobs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) throw new Error(`PATCH failed for job ${id}`)
  return res.json()
}
