# Rezepte

Schritt für Schritt für die häufigsten Erweiterungen. Nach jedem Rezept: `npm run check`.

## Neue Fischart

1. `src/content/fish/barsch.js` nach `src/content/fish/<id>.js` kopieren. `<id>` nur Kleinbuchstaben, keine Umlaute (`stoer`, nicht `stör`).
2. Werte anpassen:
   - `label`, `plural`, optional `article: 'eine'` (für "Du hast eine Makrele gefangen")
   - `length: [min, max]` in Metern
   - `habitat: ['see']` (Seen und Flüsse) oder `['meer']`. Regel: nur eins von beiden, im Meer leben nur Meeresbewohner (der Unit-Test prüft das).
   - `spawn: { see: 0.1 }` Häufigkeit je Gewässer. **Die Summe aller Arten je Gewässer muss 1 bleiben**, also andere Arten etwas verringern (der Unit-Test prüft das).
   - `speed`, `jumps`, `scale` (shadow = Schatten im Wasser, underwater, aquarium, rod = an der Angel, jump = beim Springen)
   - optional: `wow: true` (besonderer Fang), `bigCatch`, `maxCount`, `dorsalFin`
3. `model({ g, body, box, mesh, M, finGeo, fl })` gestalten. Der Fisch schaut nach +z, Länge etwa 1. `body(farbe, sx, sy, sz, y, z)` ist ein Ellipsoid, `box(g, farbe, w, h, d, x, y, z)` ein Quader.
4. In `src/content/fish/index.js` importieren und in `FISH_LIST` eintragen. Die Position bestimmt die Reihenfolge im Inventar.
5. Fertig: Inventar-Eintrag, Fangbuch, Aquarium, Unterwasserwelt und Spawn kommen automatisch.
6. `npm run check`. Der Browser-Test weicht ab, weil sich die Spawn-Tabelle ändert. Screenshots ansehen, dann `npm run test:baseline`.

## Neue Walart

1. `src/content/whales/orca.js` kopieren, `id`, `label`, `plural`, `scale` und `model({ g, ell, fluke, box })` anpassen. Der Wal schaut nach +z, Länge etwa 10.
2. In `src/content/whales/index.js` eintragen.

## Neues Gebäude, Pflanze oder Licht

1. `src/content/buildings/haus.js` nach `src/content/buildings/<id>.js` kopieren.
2. `label`, `category` (`haus`, `natur` oder `licht`) und Schalter setzen: `house` (begehbar, Tür zur Straße), `walkable` (Spielfigur läuft hindurch), `rot` (drehbar), `paint` (mit dem Finger malen), `big` (3x3 Felder).
3. `model(seed, o, { ... })` gestalten. Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Die Helfer im dritten Parameter (`box`, `mesh`, `shell`, `gable`, `glow`, Materialien ...) kommen aus `content/models/buildings.js`. Rückgabe `{ g, cols, lights }`: `cols` sind Kollisionsformen `['b', x0, x1, z0, z1]` oder `['c', x, z, r]`, `lights` sind `[x, y, z, farbe, stärke, reichweite]`.
4. In `src/content/buildings/index.js` eintragen. Katalog, Inventar und Vorschaubild entstehen automatisch.
5. Szenario `bauen` in `tests/e2e/scenarios.mjs` um das neue Ding ergänzen.

## Neues Fahrzeug

1. `src/content/vehicles/lambo.js` kopieren. `category` ist `auto` oder `see`, dazu `speed`, `max`, optional `siren`, `boat`, `sub`.
2. `model({ g, box, wheels, lights, ... })`: Fahrzeug schaut nach +z. `wheels(g, xs, zs, r)` und `lights(g, y, zVorne, zHinten, xs)` helfen.
3. In `src/content/vehicles/index.js` eintragen.

## Neues Tier

1. `src/content/animals/hund.js` kopieren, `label`, `speed` und `model({ g, box, leg, legs })` anpassen. Beine mit `leg(...)` anlegen, dann wackeln sie beim Laufen.
2. In `src/content/animals/index.js` eintragen.

## Neue Aufgabe oder neues Kapitel

1. In `src/content/quests/<kapitel>.js` eine Aufgabe ergänzen: `{ id, text, tip, on, when, count }`.
   - `text`: kurz, wird vorgelesen (unter 60 Zeichen, der Test prüft das). `tip`: wie es geht, für Kinder.
   - `on`: ein Ereignis aus `src/core/events.js` (Liste in `QUEST_EVENTS`). `when(d)`: prüft die Ereignis-Daten. `count`: wie oft.
2. Neues Kapitel: Datei nach Vorlage `bahn.js`, in `src/content/quests/index.js` eintragen. Optional `bonus: { item, text }` und beim Ding `bonus: '<kapitel>'` setzen (Beispiel: Gold-Lambo in `content/vehicles/goldlambo.js`).
3. Braucht die Aufgabe ein Ereignis, das es noch nicht gibt: im passenden System `emit(...)` aufrufen, in `events.js` dokumentieren und in `QUEST_EVENTS` aufnehmen.
4. Fortschritt liegt unter `cubos-aufgaben` im Gerät und reist in Welt-Codes mit. IDs von Aufgaben nie umbenennen, sonst verschwinden Haken.

## Neues Ereignis

1. Oben in `src/core/events.js` mit Namen und Daten dokumentieren. Name: `thema:was-passiert`, deutsch.
2. Auslösen: `emit('thema:was', { ... })`. Reagieren: `on('thema:was', (d) => { ... })` im Modul, das reagieren soll, auf oberster Ebene.

## Spielstand-Format ändern

1. In `src/core/save-schema.js` `SAVE_VERSION` erhöhen und `MIGRATIONS[alteVersion]` schreiben, die `v` auf die neue Version setzt.
2. `serialize()` und `applyData()` in `src/core/save.js` anpassen.
3. Test in `tests/unit/save.test.js`: ein Stand der alten Version wird korrekt umgewandelt.
4. Welt-Codes nutzen dieselben Daten. Ein alter Code muss weiter funktionieren.

## Neues Test-Szenario

1. In `tests/e2e/scenarios.mjs` eine Funktion ergänzen. Werkzeuge: `api(page, 'sel', id)`, `place(page, id, [[i, j], ...])`, `frames(page, n)` (1 Bild = 20 ms), `snap('name')`.
2. Braucht das Szenario neue Zugriffe ins Spiel, `src/debug.js` erweitern.
3. `npm run build && npm run test:e2e`, Screenshots ansehen, `npm run test:baseline`.

## Modell ansehen

`npm run build && node tests/e2e/look.mjs rochen kalmar` legt die Modelle nebeneinander und speichert `tests/output/look.png`. Wale mit `wal:orca`.

## Code verschoben, Import-Zyklus geändert

1. `npm run lint -- --fix` entfernt ungenutzte Importe, `npm run lint` meldet fehlende.
2. `npm run deps` zeigt den Zyklus-Kern und Module, die nie geladen werden.
3. `node tools/rechain.mjs` pflegt die Ladereihenfolge. Ein neues Kern-Modul mit `--insert <modul> --after <modul>` einordnen.

## Veröffentlichen

1. `npm run check` grün.
2. Commit mit erzeugten Dateien, Push auf `main`. GitHub Pages aktualisiert sich nach 1 bis 2 Minuten.
