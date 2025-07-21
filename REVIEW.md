# Statisches Code-Review (v0.0)

## Legende

| Tag        | Bedeutung                                     | Priorität |
| ---------- | --------------------------------------------- | --------- |
| **B-Nr**   | ❌ **Bug** – Laufzeit- oder Logikfehler       | Hoch      |
| **S-Nr**   | ⚠️ **Smell** – erschwert Wartung / Lesbarkeit | Mittel    |
| **SEC-Nr** | 🔒 **Security** – Sicherheitsrisiko           | Kritisch  |

---

## Kritischste Punkte (Top 5)

1. **B-1** Backend-JSON-I/O ohne Fehlerbehandlung ⇒ Server-Crash
2. **SEC-1** Pfad wird ungeprüft aus Request übernommen ⇒ Path-Traversal
3. **B-3** Endlosschleife `setInterval` in `server.js` ⇒ CPU-Last, Log-Spam
4. **S-4** Frontend hat >10 ungenutzte States/Typen ⇒ schwer lesbar
5. **SEC-2** WebSocket versucht Verbindung ohne Origin-Check ⇒ Hijacking-Risiko

---

## 1 Backend (`backend/server.js` u. a.)

| ID        | Typ   | Datei / Zeile         | **Was** (Problem)                                          | **Warum** (Impact)                              | Geplante Lösung / Debug-Schritt                        |
| --------- | ----- | --------------------- | ---------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| **B-1**   | bug   | `server.js:95`        | `fs.readFileSync` ohne `try/catch`                         | defekte JSON ⇒ Prozess-Abbruch (gesehen im Log) | Async `fs.promises.readFile` + zentraler Error-Handler |
| **S-1**   | smell | `server.js:13`        | Variable `currentFilter` nie genutzt                       | Dead-Code verwirrt                              | Entfernen                                              |
| **S-2**   | smell | global                | >15 `console.log` im Prod-Code                             | Log-Spam / evtl. sensible Daten                 | pino/winston + Level logging                           |
| **S-3**   | smell | Datei-Größe           | Routing + Business-Logik in 1 Datei (~200 Zeilen)          | Monolith schwer test- & wartbar                 | Aufsplitten: `routes/`, `services/`, `app.js`          |
| **B-3**   | bug   | `server.js:170`       | Endlos-`setInterval` (1 s) ruft _„Getting all auftraege…“_ | Dauerhafte CPU-Last, Log-Flood                  | Polling entfernen → Websocket/Events nutzen            |
| **SEC-1** | sec   | `server.js:140`       | Request-Pfad ungeprüft in `readFile`                       | Path-Traversal möglich                          | Whitelist/Schema validieren                            |
| **SEC-2** | sec   | `ws`-Init             | Kein Origin-/Token-Check                                   | Fremd-Client kann Socket öffnen                 | Auth-Middleware oder WS-JWT einbauen                   |
| **S-6**   | smell | `server.js:0` (Start) | Fehlende `.env`-Config → Port & Datei-Pfad hart codiert    | Keine Konfig-Trennung Dev/Prod                  | dotenv + defaults                                      |

---

## 2 Frontend (`frontend/src`)

| ID      | Typ   | Datei / Zeile   | **Was**                                                  | **Warum problematisch**                                  | Plan / Fix                                   |
| ------- | ----- | --------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| **S-4** | smell | `App.tsx` Kopf  | 20 `useState`, Hälfte ungenutzt                          | Noise, erschwert Refactor                                | Aufräumen / in eigene Hooks auslagern        |
| **B-2** | bug   | `App.tsx:56`    | `setInterval` ohne Cleanup                               | Memory-Leak bei Route-Wechsel                            | `useEffect` + `return clearInterval(id)`     |
| **B-4** | bug   | `App.tsx:78–84` | Deprecation-Warnung _moment(js-Date)_                    | Nicht deterministic auf versch. Browsern                 | ISO-8601 Datum verwenden / dayjs ersetzen    |
| **S-5** | smell | `index.tsx:6`   | Direktes DOM-Access (`document.*`)                       | Bricht React-Paradigma                                   | `ReactDOM.createRoot` nutzen                 |
| **B-5** | bug   | Network-Log     | Axios `ERR_CONNECTION_REFUSED` bei Backend-Restart       | Frontend zeigt keine Fehlermeldung, Polling läuft weiter | Global Axios-Error-Handler + Retry-Strategie |
| **S-7** | smell | `socket.js`     | Reconnect-Loop auf `ws://localhost:3000/ws` ohne Backoff | Spam im Log, unnötige Verbindungen                       | Exponential-Backoff + Abort nach X Versuchen |

---

## 3 Dokumentation / Tooling

| ID       | Typ   | Datei             | Was                                  | Warum schlecht                     | Lösung                             |
| -------- | ----- | ----------------- | ------------------------------------ | ---------------------------------- | ---------------------------------- |
| **S-8**  | smell | `README.md`       | Keine Info zu `.env` / Ports         | Onboarding bremst                  | Beispiel-.env + Tabelle Ports      |
| **S-9**  | smell | `CHANGELOG` fehlt | Historie nicht nachvollziehbar       | Review/Debug schwieriger           | SemVer + Keep a Changelog          |
| **S-10** | smell | Husky-Hook        | Bisher nur Pre-Push, kein Pre-Commit | Lint/Tests laufen erst nach Commit | Optional: `lint-staged` hinzufügen |

---

## Einsatz von KI-Tools

| Wo genutzt                                                   | Aufgabe / Prompt                                                                                                                             | Eigenleistung / Anpassung                         |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Plan 1.0 → 2.0**                                           | Ursprünglicher Zeit- & Aufgabenplan manuell erstellt; anschließend mithilfe von ChatGPT o3 in klarere Meilensteine (Plan 2.0) umstrukturiert | Prioritäten selbst gesetzt, Deadlines verifiziert |
| **Cursor / Claude / Copilot** – **bewusst NICHT eingesetzt** | Vermeidung zusätzlicher Abhängigkeiten & Config-Overhead; Fokus auf nachvollziehbare Commits                                                 | Alle Code-Änderungen in VS Code + CLI             |
| ESLint-Konfiguration                                         | Basiskonfig generiert                                                                                                                        | Regeln manuell gestrafft                          |
| REVIEW.md-Tabellen                                           | Grundstruktur & Markdown-Tabellen                                                                                                            | Inhalte selbst ausgefüllt                         |

---

### Nächste Schritte (Sprint 1)

1. **Backend Refactor** (B-1, S-1 bis S-3, B-3).
2. **Security-Fix** Path-Traversal (SEC-1).
3. **Smoke-Tests** einführen ⇒ `npm test` ohne `--passWithNoTests`.
4. REVIEW.md auf **v1** aktualisieren; fixe Einträge abhaken.
