# Architektur

Stand: Oktober 2026, nach dem Umbau von einer Einzeldatei (`legacy/kunos-welt.html`) in Module.

## Überblick

```
src/
  index.html        Gerüst: Markup aller Panels, Three.js-Einbindung, Platzhalter für App-Meta-Tags
  styles.css        gesamtes CSS
  main.js           Einstieg: startet das Spiel
  debug.js          Test-Schnittstelle window.__cubo (nur aktiv mit window.__CUBO_DEBUG)
  core/             Grundlagen ohne Grafik-Details
    util.js         $, clamp, mulberry (Zufall mit Startwert)
    grid.js         Raster: TILE, N, Feld <-> Weltkoordinate, Richtungen
    state.js        game: geteilter, veränderlicher Zustand (Modus, Fahrzeug, aktuelle Welt ...)
    events.js       Ereignis-Bus on/emit
    world.js        Felder, Objekte, Neuaufbau, Welt vergrößern, Großbauten (3x3)
    collision.js    Kollision
    save.js         serialize/applyData, Beispielwelt laden
    save-schema.js  Version des Spielstands + Umwandlung alter Stände
    storage.js      Speicherort der Welten (localStorage)
    world-codes.js  Welten als Text-Code (gzip + base64)
    loop.js         Spielschleife: alle Systeme je Bild, adaptive Auflösung
  render/           Three.js
    renderer.js     Renderer, Szene, Kameras, Sonne, Mond, Sterne
    materials.js    Material-/Geometrie-Cache, box(), mesh(), bake()
    daynight.js     Tag und Nacht
    lights.js       Licht-Pool (6 Punktlichter), Garagentore
    build-camera.js Kamera im Baumodus
  content/          Was es gibt (Daten + Aussehen)
    catalog.js      ITEMS (alles Baubare) und CATS (Inventar-Kategorien)
    fish/           eine Datei je Fischart + index.js (Liste, Prüfung, abgeleitete Tabellen)
    whales/         eine Datei je Walart + index.js
    fish.js         fishModel() und gemeinsame Fisch-Geometrie
    whales.js       whaleModel()
    models/         3D-Modelle: Boden, Gleise, Gebäude (MODELS), Fahrzeuge, Tiere, Blöcke
    sample-world.js Beispielstadt
  systems/          Spiellogik je Thema
    build.js        Feld antippen, setzen, abreißen
    player.js       Laufen, Fahren, Joystick
    traffic.js, trains.js, ferries.js, animals.js
    fish.js, fishing.js, whales.js, underwater.js, aquarium.js
    travel.js       Reise in andere Welten
    editor.js       Bauwerkstatt (Häuser Stein für Stein)
    audio.js        Töne
  ui/               Bedienoberfläche
    modes.js        Modus-Wechsel, Hinweise (hint), Knöpfe
    inventory.js    Inventar, Vorschaubilder
    worlds-menu.js  Meine Welten, Codes kopieren/einfügen
    build-input.js, station-panel.js, fullscreen.js
```

## Wichtige Entscheidungen

**Eine HTML-Datei als Ergebnis.** Vite baut alles in `dist/index.html` (vite-plugin-singlefile). `tools/build.mjs` macht daraus die App im Wurzelverzeichnis (Three.js lokal, Manifest, Service Worker). Kein Server nötig. Bis Oktober 2026 gab es zusätzlich ein Claude-Artifact, das ist eingestellt.

**Three.js r128 global.** Kein Import, `THREE` kommt aus dem Script-Tag. Ein Update auf eine neuere Version wäre ein eigenes Projekt (Licht-Einheiten und Farbräume haben sich geändert).

**Kein Tree-Shaking.** Rollup würde ungenutzte `Math.random()`-Aufrufe entfernen. Das ändert den Zufallsstrom und macht die Vergleichstests wertlos.

**Ladereihenfolge im Zyklus-Kern.** 28 Module importieren sich gegenseitig (Bauen braucht Fahrzeuge, Fahrzeuge brauchen Spielfigur, Spielfigur braucht UI ...). In einem Zyklus würde ES-Module-Logik die Reihenfolge verändern und Werte wären beim Laden noch nicht da. Deshalb importiert jedes Kern-Modul zuerst seinen Vorgänger. `npm run deps` zeigt den Kern. Ziel für später: den Kern verkleinern, indem Querverweise über Ereignisse laufen. Module außerhalb des Kerns (Inhalte, Grafik-Grundlagen, Helfer) brauchen keine Ladereihenfolge und sind ohne Browser testbar.

**Geteilter Zustand in `game`.** ES-Module erlauben keine Zuweisung an importierte Variablen. Alles, was mehrere Module neu setzen (`game.mode`, `game.driveCar`, `game.curWorld` ...), liegt deshalb in `core/state.js`. Die Liste steht dort im Kommentar.

**Inhalte als Daten.** Eine Fischart ist eine Datei mit Werten und einer `model()`-Funktion. Katalog-Einträge, Spawn-Tabellen, Habitat-Prüfung und Sonderregeln (Rückenflosse, maxCount, Riesen-Fang) werden daraus abgeleitet. Gebäude, Fahrzeuge und Tiere sind noch im alten Stil (Eintrag in `catalog.js` + Modell in `content/models/*`), siehe Backlog.

**Spielstand mit Version.** `serialize()` schreibt `v: SAVE_VERSION`. `applyData()` ruft zuerst `migrate()`. Stände einer neueren Version werden nicht geladen statt kaputt gemacht.

## Speicher

| Was | Wo | Schlüssel |
|---|---|---|
| Aktuelle Welt (Autosave) | localStorage | `kunos-welt-1` |
| Gespeicherte Welten | localStorage | `kunos-welten` |
| Fangbuch, Rekorde, Wale | localStorage | `kunos-fang`, `kunos-fang-rekord`, `kunos-wale` |

Schlüssel tragen noch den alten Namen. Nicht umbenennen, sonst sind die Welten weg.

## Tests

- **Logik (`tests/unit`, vitest):** Inhaltsdateien, Spielstand-Umwandlung, Welt-Codes, Ereignisse.
- **Browser (`tests/e2e`):** `env.js` macht Zufall und Zeit vorhersagbar und zeichnet nur das letzte Bild eines Blocks. `scenarios.mjs` spielt 12 Abläufe über `window.__cubo` (debug.js). Jeder Schnappschuss speichert einen Fingerabdruck (Welt, Fahrzeuge, Fische, Fangbuch, sichtbare Panels) und einen Screenshot. `compare.mjs` vergleicht mit `tests/baseline` (nur Daten, Bilder bleiben lokal in `tests/output`).
- `legacy` als Ziel (`node tests/e2e/run.mjs legacy`) spielt dieselben Szenarien mit dem alten Einzeldatei-Stand. Damit wurde der Umbau Pixel für Pixel geprüft.
