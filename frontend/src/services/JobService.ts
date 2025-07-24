import axios from 'axios'
import { Job } from '../types/types'

const API_URL = 'http://localhost:3001/api'

export const fetchJobs = async (): Promise<Job[]> => {
  const res = await axios.get(`${API_URL}/jobs`)
  return res.data
}
