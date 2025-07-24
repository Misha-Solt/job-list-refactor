# Job List Application

A simple application for managing jobs.

## Setup & Quick Start

| Schritt                     | Befehl im Projekt-Root  | Erläuterung                                                                                              |
| --------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Abhängigkeiten installieren | `npm install`           | ein Install-Lauf für Front- & Backend                                                                    |
| Dev-Server starten          | `npm start`             | startet **parallel**:<br>• Backend auf <http://localhost:3001><br>• Frontend auf <http://localhost:3000> |
| Browser öffnen              | <http://localhost:3000> |                                                                                                          |

---

If you encounter an ERESOLVE error during `npm install`, run instead:

`npm install --legacy-peer-deps`

## Nützliche Skripte

| Befehl               | Zweck                |
| -------------------- | -------------------- |
| `npm run lint`       | ESLint-Check         |
| `npm run format`     | Prettier             |
| `npm run type-check` | TypeScript ohne Emit |
| `npm test`           | Jest (aktuell leer)  |

- 🚫 Direkter Push auf **main** || **master** ist blockiert → Workflow via Pull-Request.

---

## Features

- View jobs
- Filter by status
- See job details
- (geplant) Status ändern

## Technologies

- React
- Node.js ( ≥ 18 LTS, empfohlen 20)

- Express

## Notes

Make sure both frontend and backend are running for the application to work properly.
