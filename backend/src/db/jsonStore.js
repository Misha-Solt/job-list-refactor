import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Pfad aus .env oder Fallback */
const DB_PATH = process.env.DATA_PATH
  ? resolve(process.cwd(), process.env.DATA_PATH) // relativer Pfad in .env
  : resolve(__dirname, '../../data/auftraege.json') // Default

/* ---------- Helper ---------- */
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

/* ---------- CRUD-Funktionen ---------- */
export async function readJobs() {
  await ensureFile()
  const raw = await readFile(DB_PATH, 'utf-8')

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('CORRUPT_DB_JSON')
  }
}

export async function writeJobs(jobs) {
  await writeFile(DB_PATH, JSON.stringify(jobs, null, 2))
}
