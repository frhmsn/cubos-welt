# Rezepte

Schritt für Schritt für die häufigsten Erweiterungen. Nach jedem Rezept: `npm run check`.

## Neue Fischart

1. `src/content/fish/barsch.js` nach `src/content/fish/<id>.js` kopieren. `<id>` nur Kleinbuchstaben, keine Umlaute (`stoer`, nicht `stör`).
2. Werte anpassen:
   - `label`, `plural`, optional `article: 'eine'` (für "Du hast eine Makrele gefangen")
   - `length: [min, max]` in Metern
   - `habitat: ['see']`, `['meer']` oder beide
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

## Neues Gebäude oder Objekt

(Noch im alten Stil, siehe Backlog.)

1. In `src/content/catalog.js` bei `ITEMS` eintragen: `turm:{kind:'obj',label:'Turm',house:true}`. `house:true` heißt: man kann hineingehen, Straßen-Ausrichtung zur Tür. Weitere Schalter: `walkable` (Spielfigur läuft durch), `rot` (drehbar), `paint` (mit dem Finger malen), `big` (3x3 Felder).
2. In `src/content/models/buildings.js` bei `MODELS` eine Funktion `turm(seed){ ... return {g, cols, lights}; }` anlegen. Ein Feld ist 4x4 Einheiten, Mitte bei 0. `shell(g, cols, {...})` baut Wände mit Tür und Kollision. `cols` sind Kollisionsformen: `['b', x0, x1, z0, z1]` (Rechteck) oder `['c', x, z, r]` (Kreis). `lights`: `[x, y, z, farbe, stärke, reichweite]`.
3. In `CATS` die ID in die passende Kategorie eintragen (`haus`, `natur`, `licht` ...).
4. Vorschaubild entsteht automatisch (`ui/inventory.js`, `makeThumbs`).
5. Szenario `bauen` in `tests/e2e/scenarios.mjs` um das neue Objekt ergänzen.

## Neues Fahrzeug

1. `ITEMS`: `traktor:{kind:'car',label:'Traktor',speed:2.5,max:7}` (Boote: `boat:true`).
2. `src/content/models/vehicles.js`, Funktion `carModel(type)`: Zweig für das Modell. Fahrzeug schaut nach +z.
3. In `CATS` (`auto` oder `see`) eintragen.

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

## Veröffentlichen

1. `npm run check` grün.
2. Commit mit erzeugten Dateien, Push auf `main`. GitHub Pages aktualisiert sich nach 1 bis 2 Minuten.
3. Artifact: `dist/artifact.html` auf derselben Artifact-URL veröffentlichen (siehe CLAUDE.md).
