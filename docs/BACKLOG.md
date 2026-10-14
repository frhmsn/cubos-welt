# Backlog

## Roadmap Spielprinzip (beschlossen am 14.10.2026)

Grundidee: Aufgaben führen durchs Spiel und bringen es bei, sperren aber nichts. Der freie Baukasten bleibt.

| # | Paket | Inhalt | Stand |
|---|---|---|---|
| 1 | Vorlesen | Hinweise und Aufgaben mit deutscher Stimme vorlesen (Web Speech), Schalter im Menü | erledigt |
| 2 | Inseln | Insel-Pinsel (Land ins Meer malen, Strand entsteht von selbst), Startvorlage Inselwelt | erledigt |
| 3 | Aufgabenbuch | Kapitel (Erste Stadt, Bahn, Meer, Entdecker, Inselwelt), Haken pro Aufgabe, ein Stern pro Aufgabe, goldener Lamborghini als Bonus für Kapitel 1 | erledigt |
| 4 | Traumfilter | Miniatur-Unschärfe, sanftes Leuchten, Pastellfarben, Himmelsverlauf, Pollen und Glühwürmchen; abschaltbar, schaltet bei schwachen Geräten selbst ab | erledigt |

Später:
- Auf dem iPad prüfen: Erzählerstimme (Tempo, Lautstärke neben den Tönen), Traumfilter-Leistung, Lesbarkeit der Aufgaben
- Vorlesen für Zahlen ("3 Barsche gefangen", Fischlänge): Sätze mit Zahlen 1 bis 20 vorab sprechen
- Feine Streifen auf großen Wiesen (Schatten-Akne, durch die Unschärfe sichtbarer)
- Bonus-Dinge für weitere Kapitel (z. B. Leuchtturm, Regenbogen-Boot)
- Weltkarte: alle Welten als Inseln auf einer Seekarte, antippen und hinreisen
- Wolkenschatten, die über die Landschaft ziehen
- Three.js auf aktuelle Version (r186, WebGPU mit WebGL-2-Rückfall); Farben und Licht neu abstimmen


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
