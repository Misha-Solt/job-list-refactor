# Job List Application

A simple application for managing jobs.

## Setup & Quick Start

| Schritt                     | Befehl im Projekt-Root  | Erläuterung                                                                                              |
| --------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Abhängigkeiten installieren | `npm install`           | ein Install-Lauf für Front- & Backend                                                                    |
| Dev-Server starten          | `npm start`             | startet **parallel**:<br>• Backend auf <http://localhost:3001><br>• Frontend auf <http://localhost:3000> |
| Browser öffnen              | <http://localhost:3000> |                                                                                                          |

---

❗️ Falls beim Ausführen von npm install ein ERESOLVE-Fehler auftritt, verwende stattdessen folgenden Befehl:

`npm install --legacy-peer-deps`

## Nützliche Skripte

| Befehl               | Zweck                           |
| -------------------- | ------------------------------- |
| `npm run lint`       | ESLint-Check                    |
| `npm run format`     | Prettier                        |
| `npm run type-check` | TypeScript ohne Emit            |
| `npm test`           | Führt vorhandene Jest-Tests aus |

- 🚫 Direkter Push auf **main** || **master** ist blockiert → Workflow via Pull-Request.

---

## `.env` Konfiguration (Backend)

Das Backend liest optionale Einstellungen aus einer `.env`-Datei im Projekt-Root. Beispiel:

```env
# Port für den Backend-Server (default: 3001)
PORT_BACKEND=3001

# Pfad zur JSON-Datenquelle (default: ./data/auftraege.json)
DATA_PATH=./data/auftraege.json
```

ℹ️ Die Frontend-URL ist aktuell hart codiert in den Service-Files. Falls nötig, kann später REACT_APP_API_URL ergänzt werden.

⸻

Features
	•	View jobs
	•	Filter by status
	•	See job details
	•	(geplant) Status ändern

Technologies
	•	React
	•	Node.js ( ≥ 18 LTS, empfohlen 20)
	•	Express

Notes

Make sure both frontend and backend are running for the application to work properly.

