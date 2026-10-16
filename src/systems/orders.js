// Aufträge (Logik): ein Auftrag zur Zeit. Im Auftragshaus annehmen, erledigen, dort die Taler abholen.
// Ohne Oberfläche, deshalb in Node testbar (tests/unit/orders.test.js). Oberfläche: ui/places.js. Inhalte: content/orders/.
import { on, emit } from '../core/events.js';
import { ORDERS, ORDER_BY_ID } from '../content/orders/index.js';
import { addTaler, fishCount, holz, spend, takeFish } from './rucksack.js';

const KEY = 'cubos-auftraege';
/** active: { id, cnt, fertig } oder null. n: wie oft jeder Auftrag schon erledigt wurde. */
let st = { active: null, n: {} };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') st = { active: s.active && ORDER_BY_ID[s.active.id] ? s.active : null, n: s.n || {} }; } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

/** Der laufende Auftrag mit Fortschritt, oder null. */
function activeOrder() {
  if (!st.active) return null;
  const o = ORDER_BY_ID[st.active.id];
  return { ...o, cnt: st.active.cnt, fertig: st.active.fertig || canGive(o) };
}
/** Drei Angebote: am seltensten erledigt zuerst, bei Gleichstand in der Reihenfolge der Liste. */
function offers(k = 3) {
  return ORDERS.map((o, i) => [o, st.n[o.id] || 0, i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).slice(0, k).map((x) => x[0]);
}
const timesDone = () => Object.values(st.n).reduce((a, b) => a + b, 0);

/** Hat der Rucksack, was ein Bringen-Auftrag braucht? */
function canGive(o) {
  if (!o.give) return false;
  return (o.give.holz || 0) <= holz() && (o.give.fisch || 0) <= fishCount();
}
function accept(id) {
  if (!ORDER_BY_ID[id]) return false;
  st.active = { id, cnt: 0, fertig: false }; persist();
  wasReady = canGive(ORDER_BY_ID[id]);
  emit('auftrag:angenommen', { id });
  return true;
}
function cancel() { if (st.active) { st.active = null; persist(); emit('auftrag:angenommen', { id: null }); } }

/** Im Auftragshaus: Bringen-Aufträge abgeben und fertige Aufträge abholen. Rückgabe: Taler oder 0. */
function claim() {
  const a = activeOrder();
  if (!a || !a.fertig) return 0;
  if (a.give) {
    if (a.give.holz && !spend('holz', a.give.holz)) return 0;
    if (a.give.fisch) takeFish(a.give.fisch);
  }
  st.n[a.id] = (st.n[a.id] || 0) + 1; st.active = null; persist();
  addTaler(a.taler, 'auftrag');
  emit('auftrag:abgeholt', { id: a.id, taler: a.taler });
  return a.taler;
}

// Fortschritt zählen: ein Empfänger je Ereignis, das irgendein Auftrag braucht
for (const ev of new Set(ORDERS.filter((o) => o.on).map((o) => o.on))) {
  on(ev, (d = {}) => {
    const a = st.active && ORDER_BY_ID[st.active.id];
    if (!a || a.on !== ev || st.active.fertig) return;
    if (a.when && !a.when(d)) return;
    st.active.cnt++;
    if (st.active.cnt >= (a.count || 1)) { st.active.fertig = true; persist(); emit('auftrag:fertig', { id: a.id }); }
    else { persist(); emit('auftrag:fortschritt', { id: a.id, cnt: st.active.cnt }); }
  });
}
// Bringen-Aufträge melden sich, sobald genug im Rucksack ist
let wasReady = false;
on('rucksack:geaendert', () => {
  const a = st.active && ORDER_BY_ID[st.active.id];
  const ready = !!a && canGive(a);
  if (ready && !wasReady) emit('auftrag:fertig', { id: a.id });
  wasReady = ready;
});

/** Nur für Tests. */
function resetOrders() { st = { active: null, n: {} }; wasReady = false; persist(); }

export { accept, activeOrder, cancel, claim, offers, resetOrders, timesDone };
