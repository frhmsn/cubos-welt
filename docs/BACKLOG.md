# Backlog

Technische Baustellen, die beim Umbau aufgefallen sind. Spiel-Wünsche gehören als Issue auf GitHub.

## Architektur

- **Zyklus-Kern verkleinern.** 28 Module hängen gegenseitig voneinander ab (`npm run deps`). Größte Verursacher: `ui/modes.js` (hint, setMode) wird von fast allem importiert, `systems/player.js` (pl, mode) ebenso. Weg: `hint` in ein eigenes, zyklusfreies Modul; Modus-Wechsel als Ereignis.
- **Gebäude, Fahrzeuge, Tiere als Datendateien** wie bei Fischen (`content/buildings/<id>.js` mit Katalog-Eintrag + Modell). `carModel()` ist noch ein großer if-Block.
- **`ui/worlds-menu.js` trennen:** saveWorld/openWorld sind Logik und gehören nach `core/`.
- **Startwerte der `game`-Felder** stehen verstreut in den Modulen. Besser zentral in `core/state.js` mit Kommentar je Feld.
- Altnamen: localStorage-Schlüssel und Welt-Code-Präfix heißen noch `kunos`. Bleibt so (Spielstände), aber neue Schlüssel mit `cubos-`.

## Grafik und Spielgefühl

- Luftblasen unter Wasser sind Quadrate und werden direkt vor der Kamera riesig (gut sichtbar im Screenshot `uboot-02-getaucht`). Runde Textur und Größenbegrenzung.
- Fangfenster blendet per CSS ein, auf Screenshots halb durchsichtig. Kein Fehler, aber Tests können den Moment nicht sicher zeigen.
- Three.js r128 ist von 2021. Update erst, wenn es einen konkreten Grund gibt (Leistung, neue Effekte).

## Tests

- Szenario für die Bauwerkstatt (Haus Stein für Stein) fehlt.
- Szenario für Weltreise (Tunnel, Seetor) fehlt.
- Leistungsmessung (Bilder pro Sekunde auf dem iPad) gibt es nur manuell.
