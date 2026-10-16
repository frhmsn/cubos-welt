// Rucksack: was Kuno besitzt. Taler, Holz, Fische im Eimer und gekaufte Dinge.
// Gilt für alle Welten gemeinsam (wie das Fangbuch) und reist in Welt-Codes mit.
// Blatt-Modul ohne Grafik, deshalb in Node testbar (tests/unit/rucksack.test.js).
import { emit } from '../core/events.js';

const KEY = 'cubos-rucksack';
/** Startwerte für ein neues Gerät: etwas Holz für die ersten Häuser. */
const START = { taler: 0, holz: 10, eimer: {}, gekauft: {} };
let r = fresh();
function fresh() { return { taler: START.taler, holz: START.holz, eimer: {}, gekauft: {} }; }
function clean(s) {
  const n = (v) => Math.max(0, Math.floor(+v || 0));
  const out = fresh();
  if (!s || typeof s !== 'object') return out;
  out.taler = n(s.taler); out.holz = s.holz == null ? START.holz : n(s.holz);
  for (const [k, v] of Object.entries(s.eimer || {})) if (n(v)) out.eimer[k] = n(v);
  for (const k of Object.keys(s.gekauft || {})) out.gekauft[k] = true;
  return out;
}
try { r = clean(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {} };
const changed = (why) => { persist(); emit('rucksack:geaendert', { why }); };

const taler = () => r.taler;
const holz = () => r.holz;
/** Fische im Eimer: { art: anzahl }. */
const eimer = () => ({ ...r.eimer });
const fishCount = () => Object.values(r.eimer).reduce((a, b) => a + b, 0);
const owns = (id) => !!r.gekauft[id];

function addTaler(n, why = 'taler') { if (n > 0) { r.taler += n; changed(why); } }
function addHolz(n, why = 'holz') { if (n > 0) { r.holz += n; changed(why); } }
/** Zieht Taler oder Holz ab, wenn genug da ist. Rückgabe: hat es geklappt? */
function spend(what, n) {
  if (!(n > 0)) return true;
  if (r[what] < n) return false;
  r[what] -= n; changed(what);
  return true;
}
function putInBucket(type) { r.eimer[type] = (r.eimer[type] || 0) + 1; changed('eimer'); }
/** Nimmt bis zu n Fische aus dem Eimer (beliebige Arten). Rückgabe: wie viele es waren. */
function takeFish(n) {
  let left = n;
  for (const k of Object.keys(r.eimer)) {
    const t = Math.min(left, r.eimer[k]); r.eimer[k] -= t; left -= t;
    if (!r.eimer[k]) delete r.eimer[k];
    if (!left) break;
  }
  if (left < n) changed('eimer');
  return n - left;
}
/** Leert den Eimer. Rückgabe: { art: anzahl } der Fische, die drin waren. */
function emptyBucket() { const e = r.eimer; r.eimer = {}; if (Object.keys(e).length) changed('eimer'); return e; }
/** Kauft ein Ding für Taler. Rückgabe: hat es geklappt? */
function buy(id, price) {
  if (owns(id)) return true;
  if (r.taler < price) return false;
  r.taler -= price; r.gekauft[id] = true; changed('gekauft');
  return true;
}

/** Für Welt-Codes. Beim Einfügen gilt jeweils der größere Wert, gekaufte Dinge kommen dazu. */
const rucksackData = () => JSON.parse(JSON.stringify(r));
function mergeRucksack(s) {
  if (!s || typeof s !== 'object') return false;
  const o = clean(s), before = JSON.stringify(r);
  r.taler = Math.max(r.taler, o.taler); r.holz = Math.max(r.holz, o.holz);
  for (const [k, v] of Object.entries(o.eimer)) r.eimer[k] = Math.max(r.eimer[k] || 0, v);
  Object.assign(r.gekauft, o.gekauft);
  if (JSON.stringify(r) === before) return false;
  changed('code');
  return true;
}
/** Nur für Tests: alles auf Anfang. */
function resetRucksack(s) { r = clean(s || START); changed('reset'); }

export { START, putInBucket, addHolz, addTaler, buy, eimer, emptyBucket, fishCount, holz, mergeRucksack, owns, resetRucksack, rucksackData, spend, takeFish, taler };
