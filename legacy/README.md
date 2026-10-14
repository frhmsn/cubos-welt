# Legacy-Stand

Stand vor dem Umbau auf die modulare Struktur (Oktober 2026).

- `kunos-welt.html`: das komplette Spiel als eine Datei (auch das Claude-Artifact).
- `build.py`: alter Build der Web-App aus dieser Datei.
- `patches/`: die Änderungsskripte, mit denen das Spiel entstanden ist, und alte Browser-Tests.

Nur zum Nachschlagen. Neue Entwicklung findet in `src/` statt.

`split.mjs` hat src/ einmalig aus `kunos-welt.html` erzeugt (mit `split-info.json` für die Modul-Beschreibungen).
Danach wurde von Hand weitergearbeitet (Inhalte als Daten, Ereignisse, Ladereihenfolge nur im Zyklus-Kern).
Nicht erneut ausführen, es würde src/ überschreiben.
