# Cubos Welten entdecken

Ein 3D-Bauspiel für Kinder: Straßen, Häuser, Bahn, Fähren, Meer, Angeln, U-Boot, Aquarium und Wale. Läuft im Browser, am besten als App auf dem Home-Bildschirm von iPad oder iPhone.

**Spielen:** https://frhmsn.github.io/cubos-welt/

## Auf das iPad holen

1. Die Adresse oben in **Safari** öffnen.
2. Teilen-Knopf, dann **Zum Home-Bildschirm**, dann **Hinzufügen**.
3. Immer über das neue Symbol starten. Dann läuft das Spiel randlos und speichert die Welten auf dem Gerät.

**Welten mitnehmen:** Menü (drei Punkte), **Alle Welten kopieren**. Auf dem anderen Gerät: Menü, **Code einfügen**, **Laden**. Fangbuch und Aquarium kommen mit.

## Entwickeln

```
npm ci
npm run build      # baut die App und das Claude-Artifact
npm run check      # Tests + Build + Browser-Rundgang
```

- Wie das Spiel aufgebaut ist: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)
- Neue Fische, Gebäude, Fahrzeuge: [docs/REZEPTE.md](docs/REZEPTE.md)
- Offene technische Punkte: [docs/BACKLOG.md](docs/BACKLOG.md)
- Regeln für KI-Agenten: [CLAUDE.md](CLAUDE.md)

Der alte Stand als eine einzige Datei liegt in `legacy/`.
