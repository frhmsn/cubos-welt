// Aufgabenbuch: alle Kapitel in Reihenfolge. Neues Kapitel: Datei anlegen (Vorlage: bahn.js) und hier eintragen.
// Aufgaben führen durchs Spiel, sperren aber nichts: jede Aufgabe zählt, egal welches Kapitel gerade dran ist.
import stadt from './stadt.js';
import bahn from './bahn.js';
import meer from './meer.js';
import entdecker from './entdecker.js';
import inseln from './inseln.js';

export const CHAPTERS = [stadt, bahn, meer, entdecker, inseln];

/** Ereignisse, auf die Aufgaben hören dürfen (siehe core/events.js). */
export const QUEST_EVENTS = ['gebaut', 'insel:gemalt', 'modus', 'eingestiegen', 'mitfahren', 'hupen', 'tageszeit', 'tauchen', 'aquarium:betreten', 'reise', 'werkstatt:fertig', 'welt:gespeichert', 'fang:geaendert', 'wal:gesehen'];

export const ALL_TASKS = CHAPTERS.flatMap((c) => c.tasks.map((t) => ({ ...t, chapter: c.id })));
