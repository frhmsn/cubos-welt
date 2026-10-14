// Alle Gebäude, Pflanzen und Lichter (alles mit kind 'obj', außer "Selbst bauen").
// Neues Gebäude: Datei anlegen (Vorlage: haus.js) und hier eintragen. Reihenfolge = Inventar.
import haus from './haus.js';
import villa from './villa.js';
import hochhaus from './hochhaus.js';
import feuerwache from './feuerwache.js';
import garage from './garage.js';
import aquarium from './aquarium.js';
import baum from './baum.js';
import tanne from './tanne.js';
import blumen from './blumen.js';
import berg from './berg.js';
import laterne from './laterne.js';
import gartenlampe from './gartenlampe.js';
import lichterkette from './lichterkette.js';
import flutlicht from './flutlicht.js';
import lagerfeuer from './lagerfeuer.js';

export const BUILDING_LIST = [haus, villa, hochhaus, feuerwache, garage, aquarium, baum, tanne, blumen, berg, laterne, gartenlampe, lichterkette, flutlicht, lagerfeuer];
export const BUILDING_BY_ID = Object.fromEntries(BUILDING_LIST.map((b) => [b.id, b]));
const FLAGS = ['house', 'walkable', 'rot', 'paint', 'big'];
/** Katalog-Eintrag (ITEMS) eines Gebäudes. */
export const buildingItem = (b) => Object.assign({ kind: 'obj', label: b.label }, ...FLAGS.filter((f) => b[f]).map((f) => ({ [f]: true })));
