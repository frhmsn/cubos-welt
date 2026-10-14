// Alle Fischarten. Neue Art: Datei anlegen (Vorlage: barsch.js) und hier eintragen.
// Die Reihenfolge hier ist die Reihenfolge im Inventar und im Fangbuch.
import barsch from './barsch.js';
import hecht from './hecht.js';
import karpfen from './karpfen.js';
import wels from './wels.js';
import stoer from './stoer.js';
import thunfisch from './thunfisch.js';
import hai from './hai.js';
import makrele from './makrele.js';
import bonito from './bonito.js';
import mahimahi from './mahimahi.js';
import barrakuda from './barrakuda.js';
import schwertfisch from './schwertfisch.js';
import marlin from './marlin.js';
import mondfisch from './mondfisch.js';

export const FISH_LIST = [barsch, hecht, karpfen, wels, stoer, thunfisch, hai, makrele, bonito, mahimahi, barrakuda, schwertfisch, marlin, mondfisch];

const WATER = { see: 'wasser', meer: 'meer' }; // Habitat -> Bodenart im Raster
const whereText = (h) => (h.includes('see') && h.includes('meer') ? 'in Seen und im Meer' : h.includes('meer') ? 'im Meer' : 'in Seen');

/** Prüft eine Fischdatei beim Start, damit Tippfehler sofort auffallen. */
function check(f) {
  const need = ['id', 'label', 'plural', 'length', 'habitat', 'spawn', 'speed', 'scale', 'model'];
  for (const k of need) if (f[k] == null) throw new Error(`Fisch ${f.id || '?'}: Feld "${k}" fehlt`);
  for (const h of f.habitat) if (!WATER[h]) throw new Error(`Fisch ${f.id}: unbekanntes Habitat "${h}"`);
  for (const h of Object.keys(f.spawn)) if (!f.habitat.includes(h)) throw new Error(`Fisch ${f.id}: spawn "${h}" passt nicht zum Habitat`);
}
FISH_LIST.forEach(check);

/** Bodenarten, in denen die Art lebt, z. B. ['wasser', 'meer']. */
export const fishGrounds = (id) => FISH_BY_ID[id].habitat.map((h) => WATER[h]);
export const FISH_BY_ID = Object.fromEntries(FISH_LIST.map((f) => [f.id, f]));

/**
 * Kurzform für die Spielsysteme (gleiche Felder wie früher, damit Spielstände und Code passen):
 * label, plural, art, len, sil, speed, jump, uw, aq, rs, wow, where
 */
export const FISH = Object.fromEntries(FISH_LIST.map((f) => [f.id, {
  label: f.label, plural: f.plural, art: f.article, len: f.length,
  sil: f.scale.shadow, speed: f.speed, jump: f.jumps ? 1 : 0, uw: f.scale.underwater, aq: f.scale.aquarium,
  rs: f.scale.rod, wow: f.wow ? 1 : 0, where: whereText(f.habitat),
}]));

/** Spawn-Tabellen [[id, Gewicht], ...] je Gewässer. */
export const LAKE_FISH = FISH_LIST.filter((f) => f.spawn.see).map((f) => [f.id, f.spawn.see]);
export const SEA_FISH = FISH_LIST.filter((f) => f.spawn.meer).map((f) => [f.id, f.spawn.meer]);
