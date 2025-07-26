export type Status = 'Ausstehend' | 'In Bearbeitung' | 'Abgeschlossen'

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
  Ausstehend?: number
  'In Bearbeitung'?: number
  Abgeschlossen?: number
  total?: number
}
