// Alle Walarten. Neue Art: Datei anlegen (Vorlage: orca.js) und hier eintragen.
import buckelwal from './buckelwal.js';
import pottwal from './pottwal.js';
import orca from './orca.js';

export const WHALE_LIST = [buckelwal, pottwal, orca];
export const WHALE_BY_ID = Object.fromEntries(WHALE_LIST.map((w) => [w.id, w]));
/** Kurzform für die Systeme: label, plural, sc (Größe Oberfläche), uw (Größe unter Wasser). */
export const WHALE = Object.fromEntries(WHALE_LIST.map((w) => [w.id, { label: w.label, plural: w.plural, sc: w.scale.sea, uw: w.scale.underwater }]));
