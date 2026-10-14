// Alle Tiere. Neues Tier: Datei anlegen (Vorlage: hund.js) und hier eintragen.
import hund from './hund.js';
import kuh from './kuh.js';
import pferd from './pferd.js';
import huhn from './huhn.js';

export const ANIMAL_LIST = [hund, kuh, pferd, huhn];
export const ANIMAL_BY_ID = Object.fromEntries(ANIMAL_LIST.map((a) => [a.id, a]));
/** Katalog-Eintrag (ITEMS) eines Tiers. */
export const animalItem = (a) => ({ kind: 'animal', label: a.label, speed: a.speed });
