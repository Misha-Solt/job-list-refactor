# Job-List Application

A simple application for managing jobs.

---

## 1 Setup & Quick-Start

| Schritt                     | Befehl (Projekt-Root) | Was passiert                                                                                                                                      |
| --------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Abhängigkeiten installieren | `npm install`         | Installiert **einmal** alle Pakete aller Workspaces (`frontend`, `backend`)                                                                       |
| **Dev-Modus**               | `npm run dev`         | startet parallel<br>• **Backend** auf <http://localhost:3001><br>• **Vite** auf <http://localhost:5173>                                           |
| **Prod-Vorschau**           | `npm start`           | baut das Frontend und startet:<br>• Express-API unter <http://localhost:3001><br>• Vite-Preview der Build-Artefakte unter <http://localhost:5000> |

---

> _Hinweis:_ Für lokale Entwicklung immer `npm run dev` verwenden  
> (`nodemon` + `Vite`-HMR). `npm start` ist nur für Prod-Smoke-Tests

## 2 Nützliche Skripte

| Befehl               | Zweck                                                  |
| -------------------- | ------------------------------------------------------ |
| `npm run lint`       | ESLint-Analyse aller Workspaces                        |
| `npm run format`     | Prettier – Auto-Format                                 |
| `npm run type-check` | TypeScript ohne Emit                                   |
| `npm test`           | Jest + Supertest                                       |
| `npm run build`      | Frontend-Build (wird von `npm start` implizit gerufen) |

---

## 3 Environment-Variablen

### Frontend (`frontend/.env`)

| Schlüssel      | Beispielwert                | Beschreibung                    |
| -------------- | --------------------------- | ------------------------------- |
| `VITE_API_URL` | `http://localhost:3001/api` | Basis-URL für alle REST-Aufrufe |

### Backend (`backend/.env`)

| Schlüssel      | Standard                | Beschreibung                                                  |
| -------------- | ----------------------- | ------------------------------------------------------------- |
| `PORT_BACKEND` | `3001`                  | Port, den Express nutzt (Render setzt `PORT`)                 |
| `DATA_PATH`    | `./data/auftraege.json` | Pfad zur lokalen JSON-Datei, die als einfache Datenbank dient |
| `CORS_ORIGIN`  | `http://localhost:5173` | Erlaubte Front-Origin im Dev-Modus                            |

---

## 4 Git-Workflow

- Husky-Hook blockiert **direct push** auf `main`/`master` → Feature-Branch & Pull-Request.

---

## 5 Tech-Stack

| Ebene        | Bibliotheken                                                |
| ------------ | ----------------------------------------------------------- |
| Frontend     | React 18 · React-Router 6/7 · Vite 5 · TypeScript 5 · axios |
| Backend      | Express 4 · cors · pino · date-fns                          |
| Tools        | ESLint 9 · Prettier 3 · Jest 29 · Supertest 7 · Husky 9     |
| Mindest-Node | **22 LTS** (lokal auch ≥ 20 möglich)                        |

---

## 6 Live-Demo (Render)

**UI (Static Site):** https://job-list-refactor.onrender.com/
**API (Express):** https://job-list-87ft.onrender.com/

> ⚠️ **Free Tier / Cold Start:** Nach Inaktivität schlafen die Dienste ein.
> Der **erste Aufruf kann 20–60 Sekunden dauern**, bis UI/API wieder „aufwachen“.

**Deploy-Branch:** Die Live-Seite wird aktuell aus **`feature/change-job-status`** gebaut (nicht `main`).
Für lokale Reproduktion bitte diesen Branch auschecken.
