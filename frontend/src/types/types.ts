export type Status = 'Ausstehend' | 'In Bearbeitung' | 'Abgeschlossen'

export interface Job {
  id: number
  title: string
  customer: string
  due: string
  price: number
  status: Status
}
