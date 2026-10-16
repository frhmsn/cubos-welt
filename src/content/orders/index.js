// Aufträge im Auftragshaus. Neuer Auftrag: Eintrag unten ergänzen. IDs nie umbenennen.
//
// Zwei Arten:
//   Tun:     { id, text, tip, on, when(d), count, taler }  zählt ein Ereignis aus core/events.js (Liste: ORDER_EVENTS)
//   Bringen: { id, text, tip, give: { holz: 5 } oder { fisch: 3 }, taler }  wird im Auftragshaus abgegeben
// text wird vorgelesen: kurz, ganzer Satz. tip erklärt, wie es geht. taler ist die Belohnung.
// Das Auftragshaus bietet immer drei Aufträge an: die, die am seltensten erledigt wurden (bei Gleichstand: Reihenfolge hier).
import { FISH_BY_ID } from '../fish/index.js';

const fromSea = (d) => !!d.type && FISH_BY_ID[d.type] && FISH_BY_ID[d.type].habitat.includes('meer');

export const ORDERS = [
  { id: 'fische-drei', text: 'Fang drei Fische.', tip: 'Steig in ein Boot, fahr zu den Schatten im Wasser und tippe auf Angeln.', on: 'fang:geaendert', when: (d) => !!d.type, count: 3, taler: 6 },
  { id: 'holz-fuenf', text: 'Bring fünf Holz.', tip: 'Lauf mit dem Männchen zu einem Baum und tippe auf Holz fällen.', give: { holz: 5 }, taler: 8 },
  { id: 'welt-entdecken', text: 'Entdecke eine andere Welt.', tip: 'Fahr mit der Fähre durch das Seetor oder mit dem Zug durch den Tunnel.', on: 'reise', taler: 12 },
  { id: 'markt-verkaufen', text: 'Verkauf Fische auf dem Markt.', tip: 'Bau einen Markt. Dann lauf hin und tippe auf Verkaufen.', on: 'markt:verkauft', taler: 4 },
  { id: 'haus-bauen', text: 'Bau ein neues Haus.', tip: 'Unter Häuser ein Haus wählen und auf die Wiese tippen. Häuser kosten Holz.', on: 'gebaut', when: (d) => ['haus', 'villa', 'hochhaus', 'feuerwache', 'garage'].includes(d.id), taler: 5 },
  { id: 'fisch-meer', text: 'Fang einen Fisch im Meer.', tip: 'Im Meer schwimmen Thunfische, Haie und Marline.', on: 'fang:geaendert', when: fromSea, taler: 6 },
  { id: 'baeume-faellen', text: 'Fäll zwei Bäume.', tip: 'Lauf mit dem Männchen zu einem Baum und tippe auf Holz fällen.', on: 'baum:gefaellt', count: 2, taler: 4 },
  { id: 'zug-fahren', text: 'Fahr mit dem Zug mit.', tip: 'Lauf zum Bahnhof. Wenn der Zug hält, tippe auf Einsteigen.', on: 'mitfahren', taler: 5 },
  { id: 'fische-bringen', text: 'Bring drei Fische.', tip: 'Fang Fische mit dem Boot und leg sie in den Eimer.', give: { fisch: 3 }, taler: 12 },
  { id: 'baeume-pflanzen', text: 'Pflanz drei Bäume.', tip: 'Unter Natur gibt es Bäume und Tannen.', on: 'gebaut', when: (d) => d.id === 'baum' || d.id === 'tanne', count: 3, taler: 3 },
  { id: 'tauchen', text: 'Tauch mit dem U-Boot ab.', tip: 'Setz ein U-Boot ins Wasser, steig ein und tippe auf Abtauchen.', on: 'tauchen', taler: 6 },
  { id: 'aquarium', text: 'Besuch das Aquarium.', tip: 'Unter Häuser ist das Aquarium. Lauf mit dem Männchen hinein.', on: 'aquarium:betreten', taler: 4 },
  { id: 'insel-malen', text: 'Mal eine Insel ins Meer.', tip: 'Mit dem Insel-Pinsel ins Meer malen. Der Strand kommt von allein.', on: 'insel:gemalt', count: 4, taler: 5 },
  { id: 'nacht', text: 'Mach es Nacht.', tip: 'Oben rechts auf die Sonne tippen.', on: 'tageszeit', when: (d) => d.nacht, taler: 2 },
  { id: 'holz-zehn', text: 'Bring zehn Holz.', tip: 'Tannen geben mehr Holz als Bäume.', give: { holz: 10 }, taler: 15 },
];

/** Ereignisse, auf die Aufträge hören dürfen (siehe core/events.js). */
export const ORDER_EVENTS = ['fang:geaendert', 'reise', 'markt:verkauft', 'gebaut', 'baum:gefaellt', 'mitfahren', 'tauchen', 'aquarium:betreten', 'insel:gemalt', 'tageszeit', 'eingestiegen', 'gekauft'];
export const ORDER_BY_ID = Object.fromEntries(ORDERS.map((o) => [o.id, o]));
