// Kleiner Ereignis-Bus: Systeme melden, was passiert ist, andere reagieren darauf.
// So muss z. B. das Angeln nichts über Aquarium oder Inventar wissen.
//
// Bekannte Ereignisse (bitte hier ergänzen, wenn du ein neues einführst):
//   'fang:geaendert'  Fangbuch hat sich geändert (Fang, Code eingefügt). Daten: { type? }
//   'wal:gesehen'     Ein Wal wurde zum ersten Mal entdeckt. Daten: { type }

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
