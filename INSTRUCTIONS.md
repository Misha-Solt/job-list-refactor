# Coding-Test: Job-List-Anwendung

## Überblick
Sie haben eine funktionsfähige, aber schlecht geschriebene Full-Stack-Anwendung für die "Auftrags-Liste" eines Schreinerei-ERP-Systems erhalten. Ihre Aufgabe ist es, die Anwendung zu analysieren, zu verbessern und zu erweitern. Design-Änderungen nach Ihrem Ermessen sind ebenfalls gern gesehen.

**Anmerkung**: Verwenden Sie so viel Zeit wie sie erübrigen wollen, um die Anwendung zu analysieren und zu verbessern. Wenn nicht alle Schritte abgearbeitet werden können, ist das kein Problem. Wichtig sind Code-Qualität, Architektur, Git-Disziplin und gute Dokumentation.

## Ihre Aufgaben

### 1. Code-Review und Dokumentation (REVIEW.md)
- Erstellen Sie eine detaillierte Datei `REVIEW.md` im Hauptverzeichnis
- Dokumentieren Sie alle gefundenen Bugs und Code-Smell-Kategorien
- Erklären Sie **was** das Problem ist und **warum** es problematisch ist
- Beschreiben Sie Ihre geplante Lösung für jedes Problem bzw. Debugging-Schritte

### 2. Code-Refactoring mit Git-Disziplin
- Überarbeiten Sie den Code systematisch
- Verwenden Sie aussagekräftige Git-Commits für jeden Refactoring-Schritt
- Strukturieren Sie Ihre Commits logisch
- Dokumentieren Sie jeden Refactoring-Schritt in der `REVIEW.md` mit:
  - Was wurde geändert
  - Warum es geändert wurde
  - Wie es die Codebase verbessert

### 3. Neue Funktionalität hinzufügen
- Erstellen Sie einen neuen Git-Branch für die Entwicklung
- Implementieren Sie die Möglichkeit, den Status von Aufträgen zu ändern
- Die Funktion sollte folgende Anforderungen erfüllen:
  - Benutzer können den Status eines Auftrags ändern (Ausstehend → In Bearbeitung → Abgeschlossen)
  - Änderungen werden im Backend gespeichert
  - Die UI wird entsprechend aktualisiert
  - Verwenden Sie saubere, gut strukturierte Code-Patterns
- Integrieren Sie den Branch in den master-Branch

## Technische Anforderungen

### Stack
- **Frontend**: React mit TypeScript
- **Backend**: Node.js mit Express
- **Daten**: JSON-Datei (kein Datenbankwechsel erforderlich)

### Bewertungskriterien
- **Code-Qualität**: Sauberer, wartbarer Code mit guten Coding-Patterns
- **Architektur**: Modulare und skalierbare Architektur
- **Performance**: Effiziente Datenverarbeitung
- **Sicherheit**: Grundlegende Sicherheitsmaßnahmen
- **Git-Nutzung**: Sinnvolle Commit-Struktur
- **Dokumentation**: Ausführliche und klare REVIEW.md

## AI-Unterstützung

**AI-Tools sind ausdrücklich erlaubt und erwünscht!**

Sie dürfen gerne AI-Assistenten (ChatGPT, Claude (Code), Github Copilot, etc.) zur Unterstützung verwenden. **Wichtig**: Dokumentieren Sie in der `REVIEW.md` ausführlich:

- Welche AI-Tools Sie verwendet haben
- Für welche spezifischen Probleme Sie AI-Unterstützung genutzt haben
- Wie Sie die AI-Vorschläge bewertet und angepasst haben
- Warum Sie bestimmte AI-Vorschläge übernommen oder abgelehnt haben

## Abgabe

1. **Refactored Code**: Alle Verbesserungen in der bestehenden Struktur
2. **REVIEW.md**: Detaillierte Dokumentation aller Probleme und Lösungen
3. **Git-Historie**: Saubere, nachvollziehbare Commits
4. **Neuer Branch**: Mit Status-Update-Funktionalität
5. **AI-Dokumentation**: Transparente Darstellung der AI-Nutzung

## Hinweise

- Die Anwendung sollte nach dem Refactoring weiterhin funktionieren
- Bestehende Features dürfen nicht kaputt gehen
- Code-Stil und Konsistenz sind wichtig
- Kommentieren Sie komplexe Lösungen angemessen

## Setup

Siehe `README.md` für grundlegende Setup-Anweisungen.

Viel Erfolg bei der Bearbeitung!