# Spielprinzip

Stand: Oktober 2026. Beschlossen mit Kuno: Sammeln, Tauschen, Bauen.

## Der Kreislauf

```
   Sammeln                 Tauschen                    Ausgeben
   Fische angeln   ──►     Markt: Fische gegen Taler   Taler: Motorboot, Gold-Lambo
   Bäume fällen    ──►     (Holz bleibt im Rucksack)   Holz: Häuser, Markt, Aquarium
        ▲                                                    │
        └──────────  Auftragshaus: Auftrag holen, erledigen, Taler abholen  ◄──┘
```

**Drei Dinge im Rucksack**, mehr nicht: Taler, Holz, Fische im Eimer. Oben links immer zu sehen.
Gelten für alle Welten gemeinsam (wie das Fangbuch) und reisen in Welt-Codes mit.

**Was kostet:**
- Kostenlos: Straßen, Wiese, Wasser, Meer, Bäume, Blumen, Lichter, Fahrzeuge ohne Preis, Tiere, Fische aussetzen, Selbst bauen, Auftragshaus.
- Holz: Haus 5, Villa 8, Hochhaus 12, Feuerwache 8, Garage 4, Markt 6, Aquarium 15. Abreißen gibt das Holz zurück, damit Ausprobieren nichts kostet.
- Taler: Motorboot 30, Gold-Lambo 60. Einmal kaufen, dann beliebig oft aufstellen.
- Start auf einem neuen Gerät: 10 Holz, 0 Taler.

**Einnahmen:**
- Baum fällen (Männchen, Knopf "Holz fällen"): Baum 2 Holz, Tanne 3 Holz. Der Baum ist weg; neu pflanzen ist kostenlos.
- Fisch fangen, "In den Eimer", auf dem Markt verkaufen: 2 bis 12 Taler je Art (Wert in `content/fish/<art>.js`).
- Auftrag erledigen und im Auftragshaus abholen: 2 bis 15 Taler.

## Auftragshaus

- Bietet immer drei Aufträge an: die, die am seltensten erledigt wurden. So wiederholt sich nichts zu schnell, und es gibt nie "alles fertig".
- Ein Auftrag zur Zeit. Er steht als Leiste unter dem Rucksack. Antippen liest ihn mit Tipp vor.
- Zwei Arten: **Tun** (zählt ein Spiel-Ereignis, z. B. "Fang drei Fische") und **Bringen** (z. B. "Bring fünf Holz", wird beim Abholen abgegeben).
- Fertig heißt noch nicht bezahlt: die Taler holt man im Auftragshaus ab. Das ist der Grund, zurückzukommen.
- Öffnen: mit dem Männchen hinlaufen (Knopf "Aufträge") oder im Baumodus mit "Schauen" auf das Haus tippen.

## Markt

- Verkauft den ganzen Eimer auf einmal ("Alles verkaufen"). Kein Feilschen, keine Einzelauswahl.
- Öffnen: hinlaufen, mit einem Boot daneben anlegen, oder im Baumodus antippen.

## Türen

Häuser haben Türen, die beim Bauen zu sind. Vor der Tür erscheint "Tür auf" und "Tür zu". Solange eine Tür zu ist, versperrt sie den Weg. Garagentore öffnen weiter von selbst.

## Leitlinien für Erweiterungen

1. Neue Sachen hängen sich an den Kreislauf: etwas sammeln, tauschen oder ausgeben. Keine vierte Währung ohne guten Grund.
2. Nichts sperrt den freien Baukasten. Grundsachen bleiben kostenlos.
3. Belohnungen bleiben klein (höchstens 15 Taler pro Auftrag), damit ein Kind sie zählen kann. Vorgelesen werden Beträge bis 150 Taler; für größere liest die Gerätestimme.
4. Neue Spielfunktion: Ereignis melden (`core/events.js`), dann kann ein Auftrag darauf hören.

## Ausgebaut, aber aufgehoben

Das Aufgabenbuch mit Kapiteln, Haken und Sternen liegt in `src/extras/aufgabenbuch/` (siehe README dort). Es lässt sich als Lernpfad für den Anfang wieder einbauen.

## Später (Backlog)

- Höhlen in der Erde graben (eigene Ebene unter dem Boden, ähnlich groß wie die Unterwasserwelt) und Klappen, die man auf- und zumachen kann.
- Siehe `docs/BACKLOG.md`.
