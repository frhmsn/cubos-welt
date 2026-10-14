# Architektur

Stand: Oktober 2026, nach dem Umbau von einer Einzeldatei (`legacy/kunos-welt.html`) in Module.

## Überblick

```
src/
  index.html        Gerüst: Markup aller Panels, Platzhalter für App-Meta-Tags
  styles.css        gesamtes CSS
  main.js           Einstieg: lädt den Kern in Kettenreihenfolge, dann die Bedien-Module, startet das Spiel
  debug.js          Test-Schnittstelle window.__cubo (nur aktiv mit window.__CUBO_DEBUG)
  core/             Grundlagen
    util.js         $, clamp, angDiff, mulberry (Zufall mit Startwert)
    grid.js         Raster: TILE, Feld <-> Weltkoordinate, Richtungen
    state.js        game (geteilter Zustand mit Startwerten) und pl (Spielfigur)
    events.js       Ereignis-Bus on/emit
    focus.js        Blickpunkt und nearFocus()
    world-data.js   Felder, Listen aller Dinge (Autos, Züge ...), einfache Abfragen. Ohne Logik
    world.js        Felder ändern, Neuaufbau, Welt vergrößern, Großbauten (3x3)
    collision.js    Kollision
    autosave.js     saveSoon(): Speichern anstoßen, ohne save.js zu importieren
    save.js         serialize/applyData
    save-schema.js  Version des Spielstands + Umwandlung alter Stände
    storage.js      Welten-Speicher (localStorage)
    worlds.js       Meine Welten: speichern, öffnen, neu anlegen
    world-codes.js  Welten als Text-Code (gzip + base64)
    islands.js      Insel-Pinsel-Regel (Land malen, Strand rundherum)
    loop.js         Spielschleife: alle Systeme je Bild, adaptive Auflösung
  render/           Three.js: renderer, materials, daynight (mit Himmelsverlauf), lights, build-camera
    dream.js        Traumfilter: Tilt-Shift, Leuchten, Pastell (abschaltbar, schaltet bei Langsamkeit selbst ab)
    sparkles.js     Pollen am Tag, Glühwürmchen in der Nacht
  content/          Was es gibt (Daten + Aussehen), je Ding eine Datei
    catalog.js      ITEMS und CATS, großteils aus den Listen unten erzeugt
    fish/ whales/ vehicles/ animals/ buildings/   je <id>.js + index.js (Liste, Prüfung)
    quests/         Aufgabenbuch: ein Kapitel je Datei
    fish.js, whales.js   fishModel(), whaleModel()
    models/         Bau-Helfer und Modell-Funktionen: Boden, Gleise, buildings.js (MODELS), vehicles.js (carModel), animals.js, blocks.js (Bauwerkstatt)
    sample-world.js Beispielstadt
  systems/          Spiellogik je Thema
    build.js, player.js, traffic.js, trains.js, ferries.js, animals.js
    fish.js, fishing.js, catch-book.js (Fangbuch, Rekorde, Wale), whales.js, underwater.js, aquarium.js
    travel.js       Reise in andere Welten
    editor.js       Bauwerkstatt
    audio.js        Töne, Zughorn
    speech.js       Vorlesen: fertige Sprachdateien (voice/clips), sonst Gerätestimme; Schalter im Menü
    voice-split.js  Sätze teilen und Dateinamen, auch für tools/voice-texts.mjs
    audio-ctx.js    der eine AudioContext
    quests.js       Aufgaben-Logik: zählt Ereignisse, Sterne, Boni (ohne Oberfläche, in Node getestet)
  ui/               Bedienoberfläche: hint.js (liest vor), quest-book.js (Stern-Knopf, Buch, Feier), modes.js, inventory.js, worlds-menu.js, build-input.js, station-panel.js, fullscreen.js
```

## Wichtige Entscheidungen

**Eine HTML-Datei als Ergebnis.** Vite baut alles in `dist/index.html` (vite-plugin-singlefile). `tools/build.mjs` macht daraus die App im Wurzelverzeichnis (Three.js lokal, Manifest, Service Worker). Kein Server nötig. Bis Oktober 2026 gab es zusätzlich ein Claude-Artifact, das ist eingestellt.

**Three.js r128 global.** Kein Import, `THREE` kommt aus dem Script-Tag. Ein Update auf eine neuere Version wäre ein eigenes Projekt (Licht-Einheiten und Farbräume haben sich geändert).

**Kein Tree-Shaking.** Rollup würde ungenutzte `Math.random()`-Aufrufe entfernen. Das ändert den Zufallsstrom und macht die Vergleichstests wertlos.

**Ladereihenfolge im Zyklus-Kern.** 18 Module (anfangs 28) importieren sich gegenseitig (Bauen braucht Fahrzeuge, Fahrzeuge brauchen Spielfigur, Spielfigur braucht UI ...). In einem Zyklus würde ES-Module-Logik die Reihenfolge verändern und Werte wären beim Laden noch nicht da. Deshalb importiert jedes Kern-Modul zuerst seinen Vorgänger, und main.js lädt zuerst das letzte Kern-Modul. `npm run deps` zeigt den Kern, `node tools/rechain.mjs` pflegt die Kette. Ziel für später: den Kern verkleinern, indem Querverweise über Ereignisse laufen. Module außerhalb des Kerns (Inhalte, Grafik-Grundlagen, Helfer) brauchen keine Ladereihenfolge und sind ohne Browser testbar.

**Geteilter Zustand in `game`.** ES-Module erlauben keine Zuweisung an importierte Variablen. Alles, was mehrere Module neu setzen (`game.mode`, `game.driveCar`, `game.curWorld` ...), liegt deshalb in `core/state.js`. Die Liste steht dort im Kommentar.

**Inhalte als Daten.** Fische, Wale, Fahrzeuge, Tiere und Gebäude sind je eine Datei mit Werten und einer `model()`-Funktion. Die Helfer zum Bauen bekommt `model()` als Parameter, deshalb importieren die Dateien nichts und lassen sich ohne Browser testen. Katalog, Inventar, Spawn-Tabellen und Sonderregeln werden daraus abgeleitet. Noch im alten Stil: Bodenarten, Gleise, Züge, Fähre.

**Spielstand mit Version.** `serialize()` schreibt `v: SAVE_VERSION`. `applyData()` ruft zuerst `migrate()`. Stände einer neueren Version werden nicht geladen statt kaputt gemacht.

**Erzählerstimme vorab erzeugt.** Gute deutsche Stimmen gibt es auf dem iPad nur, wenn man sie in den Einstellungen lädt. Deshalb spricht Piper (Stimme Thorsten) jeden bekannten Satz einmal in einer GitHub Action, und das Spiel spielt die MP3s ab. `voice/texts.json` ist die Liste, `voice/manifest.json` sagt, welche Dateien es gibt. Ein Text wird nur dann mit Dateien gesprochen, wenn alle seine Sätze da sind; sonst liest die Gerätestimme alles, damit die Stimme nicht mitten im Text wechselt. Der Service Worker legt gespielte Dateien in den Zwischenspeicher.

## Speicher

| Was | Wo | Schlüssel |
|---|---|---|
| Aktuelle Welt (Autosave) | localStorage | `kunos-welt-1` |
| Gespeicherte Welten | localStorage | `kunos-welten` |
| Geöffnete Welt | localStorage | `kunos-welt-cur` |
| Fangbuch, Rekorde, Wale | localStorage | `kunos-fang`, `kunos-fang-rekord`, `kunos-wale` |
| Aufgaben | localStorage | `cubos-aufgaben` |
| Vorlesen, Traumfilter an/aus | localStorage | `cubos-vorlesen`, `cubos-traumfilter` |

Schlüssel tragen noch den alten Namen. Nicht umbenennen, sonst sind die Welten weg.

## Tests

- **Logik (`tests/unit`, vitest):** Inhaltsdateien, Spielstand-Umwandlung, Welt-Codes, Ereignisse.
- **Prüfungen (`tools/lint.mjs`, `tools/deps.mjs`):** fehlende und ungenutzte Importe, Gedankenstriche, Import-Zyklen, Module, die nie geladen werden.
- **Browser (`tests/e2e`):** `env.js` macht Zufall und Zeit vorhersagbar (Zufall aus three.min.js bekommt einen eigenen Strom) und zeichnet nur das letzte Bild eines Blocks. `scenarios.mjs` spielt 16 Abläufe über `window.__cubo` (debug.js). Jeder Schnappschuss speichert einen Fingerabdruck (Welt, Fahrzeuge, Fische, Fangbuch, sichtbare Panels) und einen Screenshot. `compare.mjs` vergleicht mit `tests/baseline` (nur Daten, Bilder bleiben lokal in `tests/output`). Feier-Karte und Hinweise laufen über die echte Uhr; sie können auf Screenshots zwischen zwei Läufen verschieden sein und gehören deshalb nicht in den Fingerabdruck.
- `legacy` als Ziel (`node tests/e2e/run.mjs legacy`) spielt dieselben Szenarien mit dem alten Einzeldatei-Stand. Damit wurde der Umbau Pixel für Pixel geprüft.
