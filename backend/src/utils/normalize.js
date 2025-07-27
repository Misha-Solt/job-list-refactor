import { parse, format, isValid } from 'date-fns'
import FIELD_MAP from '../services/fieldMap.js'

/**
 * Konvertiert beliebige Datumseingaben
 * (dd.MM.yyyy, ISO, 01-04-2024 …) → 'YYYY-MM-DD' oder ''.
 */
const normalizeDate = (input) => {
  const d = parse(input, 'dd.MM.yyyy', new Date())
  const date = isValid(d) ? d : new Date(input)
  return isValid(date) ? format(date, 'yyyy-MM-dd') : ''
}

/**
 * Rohobjekt aus auftraege.json → normalisiertes Job-Objekt.
 */
const normalize = (raw) => {
  const job = {
    id: raw.id,
    status: raw.status,
  }

  for (const [src, target] of Object.entries(FIELD_MAP)) {
    if (raw[src] == null) continue
    if (target === 'id' || target === 'status') continue
    let v = raw[src]

    // Sonderfälle vor Zuweisung behandeln
    if (src === 'kundenDaten') v = raw[src].name // Objekt → Name ziehen
    if (target === 'due') v = normalizeDate(v) // Datum formatieren
    if (target === 'price') v = Number(v) // Preis als Zahl

    job[target] ??= v // erstes gültiges Mapping gewinnt
  }

  return job
}
export { normalize }
