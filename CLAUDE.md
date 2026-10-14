# Cubos Welten entdecken

3D-Bauspiel für Kinder (Hauptspieler: 6 Jahre), läuft im Browser auf iPad und iPhone.
Ein Vater-Sohn-Projekt. Die Wünsche des Kindes sind die Produkt-Roadmap.

## Befehle

```
npm ci                 # einmalig
npm test               # Logik-Tests (vitest, Sekunden)
npm run build          # src/ -> App-Dateien im Repo-Wurzelverzeichnis (GitHub Pages)
npm run test:e2e       # Browser-Rundgang (16 Szenarien) + Vergleich mit tests/baseline (~2 Min.)
npm run check          # alles zusammen, vor jedem Commit
npm run test:baseline  # aktuellen Lauf als neue Referenz übernehmen (nur bei gewollten Änderungen)
npm run deps           # Import-Zyklen anzeigen
```

## Regeln

1. **Nur in `src/` arbeiten.** `index.html`, `sw.js`, `manifest.webmanifest`, `three.min.js` und `icon-*.png` im Wurzelverzeichnis sind erzeugt (`npm run build`) und werden mit committet, weil GitHub Pages sie direkt ausliefert. `legacy/` ist Archiv, nie ändern.
2. **Vor jedem Commit `npm run check`.** Weicht der Browser-Test ab, entweder Fehler beheben oder, wenn die Änderung gewollt ist, Screenshots in `tests/output/aktuell/` ansehen und dann `npm run test:baseline`. Im Commit-Text sagen, warum sich die Referenz geändert hat.
3. **Spielstände sind heilig.** Wer das Format von `serialize()` (core/save.js) ändert, erhöht `SAVE_VERSION` in `core/save-schema.js` und schreibt eine Umwandlung plus Test. localStorage-Schlüssel (`kunos-*`) und Welt-Code-Präfix (`KUNOWELT`) nie umbenennen.
4. **Neue Inhalte als Datendatei**, keine `if(type==='…')`-Zweige in Systemen. Fische: `src/content/fish/`, Wale: `src/content/whales/`. Rezepte: `docs/REZEPTE.md`.
5. **Systeme reden über Ereignisse** (`core/events.js`), wenn ein System auf etwas in einem anderen reagieren soll. Neue Ereignisse oben in `events.js` dokumentieren.
6. **Geteilter, veränderlicher Zustand** liegt in `game` (`core/state.js`). Nur dort, wo mehrere Module schreiben. Sonst Modul-Variable.
7. **Ladereihenfolge:** Module im Zyklus-Kern haben als ersten Import `import './vorgaenger.js'; // Ladereihenfolge`. Nicht entfernen oder umsortieren. Neue Module möglichst ohne Zyklus bauen (nur importieren, nicht importiert werden von Kern-Modulen beim Laden). Details: `docs/ARCHITEKTUR.md`.
8. **Spiel-Zufall nur über `Math.random()`**, keine eigene Uhr: Tests machen Zufall und Zeit vorhersagbar (`tests/e2e/env.js`). Reine Deko (Pollen, Glitzer) bekommt eigenen Zufall über `mulberry(startwert)`, damit sie den Spiel-Zufall nicht verschiebt.
10. **Kommentare nie hinter Code in dieselbe Zeile, wenn danach noch eine Anweisung folgt.** Der Code ist dicht geschrieben; ein `//` mitten in der Zeile schaltet den Rest still ab (so ist einmal das Himmelslicht verschwunden).
11. **Aufgaben** (`content/quests/`) hören nur auf Ereignisse. Neue Spielfunktion: passendes Ereignis melden, dann kann eine Aufgabe darauf hören. IDs von Aufgaben nie umbenennen.
9. **Kein Tree-Shaking, keine neuen Laufzeit-Abhängigkeiten.** Three.js bleibt r128 als globales `THREE` (lokale Datei `three.min.js`).

## Texte im Spiel

- Deutsch, kurz, für ein 6-jähriges Kind, das noch nicht gut liest: einfache Wörter, positive Sprache, Ausrufe erlaubt ("Wow, ein Hai!").
- Keine Gedankenstriche (—, –) in Texten, Kommentaren oder Commit-Texten.
- Keine Gewalt, kein Grusel. Wale werden nur beobachtet, nicht gefangen.
- Alles, was über `hint()` angezeigt wird, wird auch vorgelesen. Hinweise deshalb so schreiben, dass sie gesprochen gut klingen (keine Abkürzungen, keine Zeichen wie ×).

## Veröffentlichen

Nur über GitHub: `npm run check`, committen (mit den erzeugten Dateien), auf `main` pushen. GitHub Pages liefert das Wurzelverzeichnis aus: https://frhmsn.github.io/cubos-welt/ . Die App lädt das Update beim übernächsten Start (Service Worker, Version = Hash von index.html). Das frühere Claude-Artifact wird nicht mehr weiterentwickelt.

## Wo was liegt

Siehe `docs/ARCHITEKTUR.md`. Kurz: `src/core` (Raster, Zustand, Speichern, Schleife), `src/render` (Three.js, Licht, Tag/Nacht), `src/content` (Katalog, Modelle, Arten), `src/systems` (Spiellogik je Thema), `src/ui` (Menüs, Inventar, Eingabe).
