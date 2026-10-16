// Kleiner Ereignis-Bus: Systeme melden, was passiert ist, andere reagieren darauf.
// So muss z. B. das Angeln nichts über Aquarium oder Inventar wissen.
//
// Bekannte Ereignisse (bitte hier ergänzen, wenn du ein neues einführst):
//   'fang:geaendert'    Fangbuch hat sich geändert (Fang, Code eingefügt). Daten: { type? } (type nur bei echtem Fang)
//   'wal:gesehen'       Ein Wal wurde zum ersten Mal entdeckt. Daten: { type }
//   'gebaut'            Tippen hat die Welt verändert (auch Abreißen). Daten: { id, kind, i, j, painting }
//   'insel:gemalt'      Insel-Pinsel benutzt. Daten: { i, j }
//   'modus'             Modus gewechselt. Daten: { mode } ('build', 'walk', 'drive', 'ride', 'edit')
//   'eingestiegen'      In ein Fahrzeug gestiegen. Daten: { type }
//   'mitfahren'         In einen Zug gestiegen. Daten: { type }
//   'hupen'             Hupen oder Pfeifen gedrückt. Daten: { mode }
//   'tageszeit'         Tag/Nacht-Knopf. Daten: { nacht } (true: es wird Nacht)
//   'tauchen'           U-Boot taucht ab
//   'aquarium:betreten' Spielfigur ist ins Aquarium gegangen
//   'reise'             Reise in eine andere Welt beendet. Daten: { kind ('train'/'ferry'), neu ('empty'/'sample'/'insel'/null) }
//   'werkstatt:fertig'  Bauwerkstatt mit Fertig geschlossen
//   'welt:gespeichert'  Welt mit dem Wolken-Knopf oder im Menü gespeichert
//   'bild'              Jedes Bild der Spielschleife (core/loop.js). Daten: { dt }. Für kleine Prüfungen wie "Ist ein Ort in der Nähe?"
//   'rucksack:geaendert' Taler, Holz, Eimer oder Gekauftes haben sich geändert. Daten: { why }
//   'baum:gefaellt'     Baum mit dem Männchen gefällt. Daten: { type, holz }
//   'markt:verkauft'    Fische auf dem Markt verkauft. Daten: { fische, taler }
//   'gekauft'           Etwas mit Talern gekauft. Daten: { id }
//   'tuer'              Tür auf- oder zugemacht. Daten: { auf }
//   'ort:antippen'      Im Baumodus ein Auftragshaus oder einen Markt angetippt. Daten: { station }
//   'kaufen:frage'      Gesperrtes Ding im Inventar angetippt, Kaufen-Fenster soll aufgehen. Daten: { id }
//   'auftrag:angenommen' Auftrag gewählt oder abgebrochen. Daten: { id } (null: abgebrochen)
//   'auftrag:fortschritt' Ein Schritt eines Auftrags geschafft. Daten: { id, cnt }
//   'auftrag:fertig'    Auftrag erledigt, Taler warten im Auftragshaus. Daten: { id }
//   'auftrag:abgeholt'  Taler für einen Auftrag abgeholt. Daten: { id, taler }
// Nur im ausgebauten Aufgabenbuch (src/extras/aufgabenbuch): 'aufgabe:geschafft', 'kapitel:geschafft', 'aufgaben:geladen'.

const handlers = new Map();

/** Meldet fn für ein Ereignis an. Rückgabe: Funktion zum Abmelden. */
export function on(name, fn) {
  if (!handlers.has(name)) handlers.set(name, new Set());
  handlers.get(name).add(fn);
  return () => handlers.get(name).delete(fn);
}

/** Löst ein Ereignis aus. Fehler in einem Empfänger stoppen die anderen nicht. */
export function emit(name, data) {
  const set = handlers.get(name);
  if (!set) return;
  for (const fn of [...set]) {
    try { fn(data); } catch (e) { console.error('Ereignis ' + name, e); }
  }
}
