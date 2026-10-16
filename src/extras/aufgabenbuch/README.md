# Aufgabenbuch (ausgebaut)

Kapitel mit Aufgaben, Haken und Sternen, die das Spiel Schritt für Schritt beibringen. Im Oktober 2026 durch das Auftragshaus ersetzt (siehe `docs/SPIELPRINZIP.md`), hier als mögliche Erweiterung aufgehoben. `npm test` prüft die Logik weiter (`tests/unit/aufgabenbuch.test.js`), `npm run lint` die Importe.

| Datei | Inhalt |
|---|---|
| `logik.js` | zählt Ereignisse, Sterne, Kapitel (Speicher: `cubos-aufgaben`) |
| `buch.js` | Stern-Knopf, Leiste mit nächster Aufgabe, Buch, Feier |
| `kapitel/` | ein Kapitel je Datei |
| `markup.html` | HTML für `src/index.html` |
| `styles.css` | CSS für `src/styles.css` |

## Wieder einbauen

1. `markup.html` in `src/index.html` direkt nach `<canvas id="c"></canvas>` einfügen, `styles.css` an `src/styles.css` anhängen.
2. In `src/main.js`: `import './extras/aufgabenbuch/buch.js';`
3. Platz oben links: Rucksack-Anzeige (`#hud`) und Stern-Knopf (`#questDock`) liegen beide dort. Eins von beiden verschieben, z. B. `#questDock` unter `#hud`.
4. Bonus für ein Kapitel: früher schaltete Kapitel 1 den Gold-Lambo frei (`bonus` im Fahrzeug). Heute kostet er Taler (`price`). Für einen Kapitel-Bonus in `ui/inventory.js` wieder `isUnlocked(kapitel)` prüfen.
5. Vorlese-Texte: `tools/voice-texts.mjs` überspringt `src/extras/`. Kapitel- und Aufgabentexte dort wieder aufnehmen, dann `npm run voice`.
6. Welt-Codes: `questData()` und `mergeQuests()` in `ui/worlds-menu.js` wieder als Feld `aufgaben` mitschicken.
