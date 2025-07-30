export type Status = 'pending' | 'in_progress' | 'done'

export interface Job {
  id: number
  title: string
  customer: string
  due: string
  price: number
  status: Status
  notes?: string
}
export interface Stats {
  pending?: number
  in_progress?: number
  done?: number
  total?: number
}

