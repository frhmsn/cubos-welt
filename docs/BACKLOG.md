# Backlog

Technische Baustellen. Spiel-Wünsche gehören als Issue auf GitHub.

## Erledigt (Oktober 2026)

- Zyklus-Kern von 28 auf 18 Module verkleinert (world-data, hint, focus, autosave, catch-book als Blatt-Module).
- Fahrzeuge, Tiere, Gebäude als Datendateien wie Fische und Wale.
- Weltverwaltung (core/worlds.js) von der Oberfläche getrennt.
- Startwerte des geteilten Zustands zentral in core/state.js.
- Luftblasen unter Wasser rund und nicht mehr riesig vor der Kamera.
- Test-Szenarien für Bauwerkstatt und Weltreise.
- Vollbild-Knopf wieder verdrahtet (war seit Umbau Phase 2 ohne Funktion), Prüfung auf nie geladene Module.

## Architektur

- **Zyklus-Kern weiter verkleinern.** Größte Verursacher: `core/world.js` ruft Systeme auf (removeTrain, clearAquarium ...). Weg: Ereignis 'feld:geleert', auf das die Systeme selbst reagieren.
- **Bodenarten, Gleise, Züge und Fähre als Datendateien.**
- Altnamen: localStorage-Schlüssel und Welt-Code-Präfix heißen noch `kunos`. Bleibt so (Spielstände), neue Schlüssel mit `cubos-`.

## Grafik und Spielgefühl

- Welt-Vorschaubilder im Menü zeigen manchmal eine große gelbe Scheibe (Sonne vor der Kamera beim Vorschaubild).
- Fangfenster blendet per CSS ein, auf Screenshots halb durchsichtig. Kein Fehler.
- Three.js r128 ist von 2021. Update erst mit konkretem Grund.

## Tests

- Leistungsmessung (Bilder pro Sekunde) geht im Test-Browser nicht sinnvoll (Software-Grafik). Auf dem iPad von Hand prüfen.
