import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalize } from '../utils/normalize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Pfad aus .env oder Fallback */
const DB_PATH = process.env.DATA_PATH
  ? resolve(process.cwd(), process.env.DATA_PATH) // relativer Pfad via .env
  : resolve(__dirname, '../../data/auftraege.json') // Default im Repo

/* ---------- Helper ---------- */
async function ensureFile() {
  try {
    await readFile(DB_PATH)
  } catch (err) {
    if (err.code === 'ENOENT') {
      // falls Datei fehlt – leere Struktur anlegen
      await writeFile(DB_PATH, JSON.stringify({ auftraege: [] }, null, 2))
    } else {
      throw err
    }
  }
}

/* ---------- CRUD-Funktionen ---------- */
/** Liefert normalisierte Liste von Jobs */

export async function readJobs() {
  await ensureFile()
  const rawText = await readFile(DB_PATH, 'utf-8')
  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('CORRUPT_DB_JSON')
  }
  // Datei kann entweder reines Array sein oder { auftraege: [...] }
  const rawList = Array.isArray(parsed) ? parsed : (parsed.auftraege ?? [])
  return rawList.map(normalize)
}

/** Überschreibt komplette Liste (normalisierte Struktur) */

export async function writeJobs(jobs) {
  // Speichern weiterhin im Wrapper-Objekt → kompatibel mit ursprünglichem Format
  await writeFile(DB_PATH, JSON.stringify({ auftraege: jobs }, null, 2))
}
