# Backlog

## Spielprinzip Sammeln, Tauschen, Bauen (beschlossen am 16.10.2026)

Beschreibung: [SPIELPRINZIP.md](SPIELPRINZIP.md).

| # | Paket | Inhalt | Stand |
|---|---|---|---|
| 1 | Kern | Aufgabenbuch ausgebaut (in `src/extras/`), Rucksack mit Taler, Holz, Eimer, Auftragshaus mit Aufträgen | erledigt |
| 2 | Markt | Markt bauen, Fische verkaufen, Motorboot und Gold-Lambo mit Talern kaufen | erledigt |
| 3 | Holz | Bäume fällen, Häuser kosten Holz (Abreißen gibt es zurück), Türen auf und zu | erledigt |

Als Nächstes (Wünsche von Kuno):
- **Höhlen in der Erde:** Löcher graben, darunter eine Höhle bauen. Braucht eine eigene Ebene unter dem Boden mit eigener Kamera und eigenem Licht (Aufwand ähnlich wie die Unterwasserwelt). Vorschlag: ein Höhleneingang als Gebäude, der wie das U-Boot in eine eigene Szene führt; dort mit Blöcken graben wie in der Bauwerkstatt.
- **Klappen** zum Auf- und Zumachen (Falltür in den Boden, gehört zu den Höhlen). Türen gibt es schon (`shell()` in `content/models/buildings.js`, Animation in `render/lights.js`).
- Bäume wachsen nach dem Fällen langsam nach (Stumpf, der wieder Baum wird).
- Mehr Dinge zum Kaufen (z. B. Leuchtturm, Regenbogen-Boot), mehr Aufträge.
- Selbst gefangene Fische im Aquarium ausstellen kostet einen Fisch aus dem Eimer.

## Roadmap Spielprinzip (beschlossen am 14.10.2026, ersetzt)

Grundidee: Aufgaben führen durchs Spiel und bringen es bei, sperren aber nichts. Der freie Baukasten bleibt.

| # | Paket | Inhalt | Stand |
|---|---|---|---|
| 1 | Vorlesen | Hinweise und Aufgaben mit deutscher Stimme vorlesen (Web Speech), Schalter im Menü | erledigt |
| 2 | Inseln | Insel-Pinsel (Land ins Meer malen, Strand entsteht von selbst), Startvorlage Inselwelt | erledigt |
| 3 | Aufgabenbuch | Kapitel (Erste Stadt, Bahn, Meer, Entdecker, Inselwelt), Haken pro Aufgabe, ein Stern pro Aufgabe, goldener Lamborghini als Bonus für Kapitel 1 | erledigt, am 16.10. ausgebaut |
| 4 | Traumfilter | Miniatur-Unschärfe, sanftes Leuchten, Pastellfarben, Himmelsverlauf, Pollen und Glühwürmchen; abschaltbar, schaltet bei schwachen Geräten selbst ab | erledigt |

Später:
- Auf dem iPad prüfen: Erzählerstimme (Tempo, Lautstärke neben den Tönen), Traumfilter-Leistung, Lesbarkeit der Aufgaben
- Vorlesen für Zahlen ("3 Barsche gefangen", Fischlänge): Sätze mit Zahlen 1 bis 20 vorab sprechen
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
- Streifen beim Herauszoomen behoben: das Bild des Traumfilters hatte nur 16 Bit Tiefe (Three.js r128), jetzt 24 Bit. Prüfen mit `node tests/e2e/zoom.mjs`.
- Unschärfe in allen Stilen etwa halbiert, Spielzeug ist der Standard-Stil.
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
