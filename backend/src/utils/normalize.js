import { parse, format, isValid } from 'date-fns'
import FIELD_MAP from '../services/fieldMap.js'
import { STATUSES } from '../services/constants.js'

/**
 * Konvertiert beliebige Datums­eingaben
 *  (dd.MM.yyyy, ISO, 01-04-2024 …) → 'YYYY-MM-DD' oder ''.
 */
function normalizeDate(input) {
  const d = parse(input, 'dd.MM.yyyy', new Date())
  const date = isValid(d) ? d : new Date(input)
  return isValid(date) ? format(date, 'yyyy-MM-dd') : ''
}

/**
 * Rohobjekt aus auftraege.json → normalisiertes Job-Objekt.
 */
export function normalize(raw) {
  const job = { id: Number(raw.id) }

  for (const [src, target] of Object.entries(FIELD_MAP)) {
    if (raw[src] == null) continue
    let v = raw[src]

    // Sonderfälle vor Zuweisung behandeln
    if (src === 'kundenDaten') v = raw[src].name // Objekt → Name ziehen
    if (target === 'due') v = normalizeDate(v)
    if (target === 'price') v = Number(v) // alle Preis-Aliasse

    job[target] ??= v // erstes Mapping gewinnt
  }

  // Fallback für Status
  if (!STATUSES.includes(job.status)) job.status = STATUSES[0]

  return job
}
