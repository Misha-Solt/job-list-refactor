import { readFile, writeFile, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Pfad aus .env oder Fallback */
const DB_PATH = process.env.DATA_PATH
  ? resolve(process.cwd(), process.env.DATA_PATH) // relativer Pfad via .env
  : resolve(__dirname, '../../data/auftraege.json') // Default im Repo

/* ---------- Atomare Schreiblogik + einfacher Mutex ---------- */

/** Atomarer Schreibvorgang: zuerst in .tmp schreiben, dann per rename ersetzen */
const writeJSONAtomic = async (filePath, dataObj) => {
  const tmpPath = `${filePath}.tmp`
  const payload = JSON.stringify(dataObj, null, 2)
  await writeFile(tmpPath, payload, 'utf-8')
  await rename(tmpPath, filePath)
}

/** Einfacher in-process Mutex zur Serialisierung von Schreibzugriffen */
let writeQueue = Promise.resolve()
const enqueueWrite = (taskFn) => {
  const next = writeQueue.then(() => taskFn())
  // Fehler dürfen die Kette nicht „brechen“
  writeQueue = next.catch(() => {})
  return next
}

/* ---------- CRUD-Funktionen ---------- */

/** Überschreibt komplette Liste (normalisierte Struktur) – atomar & serialisiert */
export const writeJobs = async (jobs) => {
  // Persistentes Format: Objekt mit Schlüssel "auftraege"
  return enqueueWrite(() => writeJSONAtomic(DB_PATH, { auftraege: jobs }))
}

/** Stellt sicher, dass die Datei existiert (legt leere Struktur an, falls nötig) */
export const ensureFile = async () => {
  try {
    await readFile(DB_PATH)
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      // Datei fehlt → leere Struktur initialisieren (atomar)
      await writeJobs([])
    } else {
      throw err
    }
  }
}

/** Liefert normalisierte Liste von Jobs aus der Datei */
export const readJobs = async () => {
  await ensureFile()
  const rawText = await readFile(DB_PATH, 'utf-8')

  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    // Defekte/teilweise geschriebene JSON-Datei
    throw new Error('CORRUPT_DB_JSON')
  }

  // Rückwärtskompatibel: sowohl Array-Root als auch { auftraege: [] } unterstützen
  const rawList = Array.isArray(parsed) ? parsed : (parsed.auftraege ?? [])
  return rawList
}