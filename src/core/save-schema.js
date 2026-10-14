// Version des Spielstand-Formats und Umwandlung alter Spielstände.
//
// Regel: Wer das Format von serialize() in core/save.js ändert, erhöht SAVE_VERSION
// und trägt hier eine Umwandlung von der alten zur neuen Version ein. Alte Welten
// (im Speicher, als Welt-Code, im Artifact) müssen danach weiter laden.
// Test: tests/unit/save-schema.test.js

export const SAVE_VERSION = 1;

/**
 * Umwandlungen: MIGRATIONS[v] macht aus einem Stand der Version v einen der Version v+1.
 * Beispiel für später:
 *   1: (d) => ({ ...d, v: 2, floors: [] }),
 */
const MIGRATIONS = {};

/**
 * Bringt einen gespeicherten Stand auf die aktuelle Version.
 * Rückgabe null: unbrauchbar oder von einer neueren Spielversion (dann nichts kaputt machen).
 */
export function migrate(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.tiles)) return null;
  let v = Number.isInteger(d.v) ? d.v : 1;
  if (v > SAVE_VERSION) return null;
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error('Keine Umwandlung von Spielstand-Version ' + v);
    d = step(d);
    if (d.v !== v + 1) throw new Error('Umwandlung ' + v + ' muss v auf ' + (v + 1) + ' setzen');
    v = d.v;
  }
  return d;
}
