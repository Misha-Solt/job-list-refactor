import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Absoluter Pfad zur Daten­datei */
const DB_PATH = resolve(__dirname, '../../data/auftraege.json')

async function ensureFile() {
  try {
    await readFile(DB_PATH)
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeFile(DB_PATH, '[]')
    } else {
      throw err
    }
  }
}

/* Alle Jobs lesen (Array zurückgeben) */
export async function readJobs() {
  await ensureFile()
  const raw = await readFile(DB_PATH, 'utf-8')

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('CORRUPT_DB_JSON')
  }
}

/* Komplettes Array zurückschreiben */
export async function writeJobs(jobs) {
  await writeFile(DB_PATH, JSON.stringify(jobs, null, 2))
}
