// Orte und Rucksack: Anzeige von Talern, Holz und Eimer oben links, laufender Auftrag als Leiste,
// Knöpfe in der Nähe von Auftragshaus und Markt, Holz fällen, Fenster für Aufträge, Markt und Kaufen.
// Wird nur von main.js geladen (kein Zyklus). Reagiert auf Ereignisse, die Spielschleife meldet 'bild'.
import { game, pl } from '../core/state.js';
import { $ } from '../core/util.js';
import { I, center, inb, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { FISH } from '../content/fish.js';
import { rebuildObj } from '../core/world.js';
import { doors, tiles } from '../core/world-data.js';
import { on, emit } from '../core/events.js';
import { saveSoon } from '../core/autosave.js';
import { hint } from './hint.js';
import { speak } from '../systems/speech.js';
import { ac, chime, nopeSnd, plop, tone } from '../systems/audio.js';
import { addHolz, addTaler, buy, eimer, emptyBucket, fishCount, holz, taler } from '../systems/rucksack.js';
import { accept, activeOrder, cancel, claim, offers } from '../systems/orders.js';
import { renderItems, select, thumbs } from './inventory.js';
import { ICON_BUCKET, ICON_COIN, ICON_SCROLL } from './icons.js';

const COIN_SM = ICON_COIN;

// ---------- Rucksack-Anzeige ----------
const shown = { taler: null, holz: null, eimer: null };
function updatePurse() {
  const v = { taler: taler(), holz: holz(), eimer: fishCount() };
  for (const k of Object.keys(v)) {
    const el = $('#n' + k[0].toUpperCase() + k.slice(1));
    if (shown[k] !== null && v[k] > shown[k]) { const c = el.parentElement; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    el.textContent = v[k]; shown[k] = v[k];
  }
  $('#hud').hidden = game.mode === 'edit';
}
$('#chipTaler').addEventListener('click', () => { ac(); plop(); hint('Taler bekommst du im Auftragshaus und auf dem Markt. Damit kannst du tolle Sachen kaufen!', 4000); });
$('#chipHolz').addEventListener('click', () => { ac(); plop(); hint('Holz bekommst du, wenn du mit dem Männchen Bäume fällst. Häuser bauen kostet Holz.', 4000); });
$('#chipEimer').addEventListener('click', () => { ac(); plop(); hint(fishCount() ? 'Das sind deine Fische im Eimer. Auf dem Markt bekommst du Taler dafür!' : 'Dein Eimer ist leer. Fang Fische mit dem Boot und leg sie in den Eimer.', 4000); });

// ---------- Laufender Auftrag ----------
const progress = (a) => (a.give ? '' : (a.count || 1) > 1 ? `${Math.min(a.cnt, a.count)} von ${a.count}` : '');
function updatePill() {
  const a = activeOrder(), p = $('#orderPill');
  p.hidden = !a || game.mode === 'edit';
  if (!a) return;
  p.classList.toggle('done', !!a.fertig);
  const pr = progress(a);
  $('#orderTxt').textContent = a.fertig ? 'Fertig! Ab zum Auftragshaus.' : a.text + (pr ? ' ' + pr : '');
}
$('#orderPill').addEventListener('click', () => {
  ac(); const a = activeOrder(); if (!a) return;
  speak(a.fertig ? 'Dein Auftrag ist fertig! Hol dir deine Taler im Auftragshaus.' : a.text + ' ' + a.tip, { force: true });
});

// ---------- Feier ----------
let toastT = 0;
function coinToast(title, sub) {
  $('#ctTitle').textContent = title; $('#ctSub').textContent = sub || '';
  const el = $('#coinToast'); el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600);
  for (let k = 0; k < 5; k++) tone(988 + k * 120, .09, 'sine', .07, k * .08, 1.2);
}

// ---------- Fenster ----------
let cur = null;
function openPlace(kind, arg) {
  cur = { kind, arg };
  $('#place').hidden = false;
  render(true);
}
function closePlace() { $('#place').hidden = true; cur = null; }
$('#plClose').addEventListener('click', () => { ac(); closePlace(); });
$('#place').addEventListener('click', (e) => { if (e.target.id === 'place') closePlace(); });

const thumb = (id) => (thumbs[id] ? `<img alt="" src="${thumbs[id]}">` : '');
function head(icon, title, sub) { $('#plIc').innerHTML = icon; $('#plTitle').textContent = title; $('#plSub').textContent = sub; }
function btn(cls, html, fn, disabled) {
  const b = document.createElement('button'); b.className = 'mb ' + cls; b.innerHTML = html; b.disabled = !!disabled;
  b.addEventListener('click', () => { ac(); fn(); }); return b;
}
function orderCard(o, extra) {
  const el = document.createElement(extra.button ? 'button' : 'div');
  el.className = 'oc' + (extra.cur ? ' cur' : '');
  el.innerHTML = `<div class="tx"><b>${o.text}</b>${extra.tip ? `<span>${o.tip}</span>` : ''}${extra.pr ? `<small>${extra.pr}</small>` : ''}</div><div class="rw">${COIN_SM}${o.taler}</div>`;
  return el;
}

function render(fresh) {
  if (!cur) return;
  const body = $('#plBody'); body.innerHTML = '';
  if (cur.kind === 'auftraege') renderOrders(body, fresh);
  else if (cur.kind === 'markt') renderMarket(body, fresh);
  else if (cur.kind === 'kaufen') renderBuy(body, fresh);
}

function renderOrders(body, fresh) {
  const a = activeOrder();
  head(thumb('auftragshaus') || ICON_SCROLL, 'Auftragshaus', a ? (a.fertig ? 'Dein Auftrag ist fertig!' : 'Dein Auftrag läuft noch.') : 'Such dir einen Auftrag aus!');
  if (a) {
    body.appendChild(orderCard(a, { tip: !a.fertig, pr: a.fertig ? '' : progress(a), cur: true }));
    if (a.fertig) {
      body.appendChild(btn('go', `${COIN_SM}${a.give ? 'Abgeben und' : ''} ${a.taler} Taler abholen`, () => {
        const n = claim(); if (!n) { nopeSnd(); return; }
        coinToast(`Super! ${n} Taler!`, 'Such dir gleich den nächsten Auftrag aus.');
        speak(`Super! Du bekommst ${n} Taler!`);
        render(false);
      }));
      if (fresh) speak('Toll, dein Auftrag ist fertig! Hol dir deine Taler.');
    } else {
      if (a.give) {
        const need = a.give.holz ? `Du hast ${holz()} von ${a.give.holz} Holz.` : `Du hast ${fishCount()} von ${a.give.fisch} Fischen im Eimer.`;
        const p = document.createElement('p'); p.id = 'plNeed'; p.style.margin = '0'; p.textContent = need; body.appendChild(p);
      }
      body.appendChild(btn('', 'Lieber einen anderen Auftrag', () => { cancel(); plop(); render(true); }));
      if (fresh) speak(a.text + ' ' + a.tip);
    }
    return;
  }
  for (const o of offers()) {
    const c = orderCard(o, { button: true, tip: false });
    c.addEventListener('click', () => {
      ac(); accept(o.id); chime(); closePlace();
      hint('Dein Auftrag: ' + o.text + ' ' + o.tip, 5000);
    });
    body.appendChild(c);
  }
  if (fresh) speak('Such dir einen Auftrag aus! Tippe auf einen.');
}

function marketValue() { const e = eimer(); return Object.keys(e).reduce((s, k) => s + e[k] * ((FISH[k] && FISH[k].taler) || 1), 0); }
function renderMarket(body, fresh) {
  const e = eimer(), n = fishCount();
  head(thumb('markt') || ICON_BUCKET, 'Markt', n ? 'So viele Taler bekommst du für deine Fische:' : 'Dein Eimer ist leer.');
  if (!n) {
    const p = document.createElement('p'); p.style.margin = '0'; p.textContent = 'Fang Fische mit dem Boot und leg sie in den Eimer.'; body.appendChild(p);
    if (fresh) speak('Dein Eimer ist leer. Fang Fische mit dem Boot und leg sie in den Eimer.');
    return;
  }
  for (const k of Object.keys(e)) {
    const S = FISH[k]; if (!S) continue;
    const row = document.createElement('div'); row.className = 'oc';
    row.innerHTML = `${thumb('F_' + k)}<div class="tx"><b>${e[k]} ${e[k] === 1 ? S.label : S.plural}</b><span>${S.taler} Taler pro Fisch</span></div><div class="rw">${COIN_SM}${e[k] * S.taler}</div>`;
    body.appendChild(row);
  }
  const total = marketValue();
  body.appendChild(btn('go', `${COIN_SM}Alles verkaufen: ${total} Taler`, () => {
    const sold = emptyBucket(), cnt = Object.values(sold).reduce((a, b) => a + b, 0);
    addTaler(total, 'markt');
    emit('markt:verkauft', { fische: cnt, taler: total });
    coinToast(`${total} Taler!`, 'Danke für die Fische!');
    speak(`Danke für die Fische! Du bekommst ${total} Taler!`);
    render(false);
  }));
  if (fresh) speak('Willkommen auf dem Markt! Tippe auf Alles verkaufen.');
}

function renderBuy(body, fresh) {
  const id = cur.arg, it = ITEMS[id], price = it.price, have = taler(), ok = have >= price;
  head(thumb(id), it.label, `Kostet ${price} Taler. Du hast ${have} Taler.`);
  body.appendChild(btn('go', `${COIN_SM}Für ${price} Taler kaufen`, () => {
    if (!buy(id, price)) { nopeSnd(); return; }
    emit('gekauft', { id });
    closePlace(); renderItems(); select(id);
    coinToast('Juhu!', it.label + ' gehört jetzt dir.');
    speak('Juhu! Das gehört jetzt dir!');
  }, !ok));
  body.appendChild(btn('', 'Später', closePlace));
  if (fresh) speak(ok ? 'Möchtest du das kaufen?' : 'Dafür brauchst du mehr Taler. Angle Fische und verkauf sie auf dem Markt!');
}

// ---------- In der Nähe: Knöpfe ----------
let near = { place: null, tree: null, door: null }, shownPlace = 'auftraege';
/** Sucht Auftragshaus, Markt und Bäume rund um (x, z). */
function scan(x, z, reach) {
  const t = tileAt(x, z); const out = { place: null, tree: null };
  if (!t) return out;
  let bp = reach.place, bt = reach.tree;
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const i = t.i + di, j = t.j + dj; if (!inb(i, j)) continue;
    const o = tiles[I(i, j)].o, it = o && ITEMS[o.t]; if (!it) continue;
    const c = center(i, j), d = Math.hypot(c.x - x, c.z - z);
    if (it.station && d < bp) { bp = d; out.place = it.station; }
    if (it.chop && d < bt) { bt = d; out.tree = { i, j, type: o.t, holz: it.chop }; }
  }
  return out;
}
function updateNear() {
  let n = { place: null, tree: null };
  if (!game.traveling) {
    if (game.mode === 'walk') n = scan(pl.x, pl.z, { place: 4.4, tree: 3.1 });
    else if (game.mode === 'drive' && game.driveCar && ITEMS[game.driveCar.type].boat) n = { place: scan(game.driveCar.x, game.driveCar.z, { place: 6.5, tree: 0 }).place === 'markt' ? 'markt' : null, tree: null };
  }
  n.door = null;
  if (game.mode === 'walk' && !game.traveling) {
    let bd = 2.3;
    for (const d of doors.values()) { const dd = Math.hypot(d.x - pl.x, d.z - pl.z); if (dd < bd) { bd = dd; n.door = d; } }
  }
  near = n;
  $('#btnDoor').hidden = !n.door;
  if (n.door) $('#doorTxt').textContent = n.door.target ? 'Tür zu' : 'Tür auf';
  $('#btnPlace').hidden = !n.place;
  if (n.place && n.place !== shownPlace) {
    shownPlace = n.place;
    $('#placeTxt').textContent = n.place === 'markt' ? 'Verkaufen' : 'Aufträge';
    $('#placeIc').innerHTML = n.place === 'markt' ? ICON_BUCKET : ICON_SCROLL;
  }
  $('#btnChop').hidden = !n.tree;
}
$('#btnDoor').addEventListener('click', () => {
  const d = near.door; if (!d) return;
  ac(); d.target = d.target ? 0 : 1; d.col.off = d.target === 1;
  if (d.target) { tone(330, .18, 'triangle', .05, 0, 1.3); tone(440, .12, 'sine', .04, .12); } else tone(160, .12, 'square', .06, .15);
  emit('tuer', { auf: !!d.target });
  updateNear();
});
$('#btnPlace').addEventListener('click', () => { ac(); plop(); if (near.place) openPlace(near.place); });
$('#btnChop').addEventListener('click', () => {
  const tr = near.tree; if (!tr) return;
  ac();
  const t = tiles[I(tr.i, tr.j)]; if (!t.o || t.o.t !== tr.type) return;
  t.o = null; rebuildObj(tr.i, tr.j); saveSoon();
  tone(220, .06, 'square', .08); tone(200, .06, 'square', .08, .16); tone(150, .3, 'triangle', .07, .34, .5);
  addHolz(tr.holz, 'gefaellt');
  emit('baum:gefaellt', { type: tr.type, holz: tr.holz });
  hint(`Tock, tock! ${tr.holz} Holz für dich!`, 2500);
  updateNear();
});

// ---------- Ereignisse ----------
on('bild', updateNear);
on('modus', () => { updateNear(); updatePill(); updatePurse(); if (cur) closePlace(); });
on('rucksack:geaendert', (d) => {
  updatePurse(); updatePill();
  if (cur) render(false);
  if (d && (d.why === 'gekauft' || d.why === 'code' || d.why === 'reset')) renderItems();
});
on('auftrag:angenommen', updatePill);
on('auftrag:fortschritt', updatePill);
on('auftrag:fertig', () => {
  updatePill(); chime();
  hint('Auftrag geschafft! Hol dir deine Taler im Auftragshaus.', 4500);
});
on('auftrag:abgeholt', updatePill);
// Baumodus: Auftragshaus oder Markt mit "Schauen" antippen öffnet das Fenster; Kaufen aus dem Inventar
on('ort:antippen', (d) => { ac(); plop(); openPlace(d.station); });
on('kaufen:frage', (d) => { openPlace('kaufen', d.id); });

updatePurse(); updatePill();

export { closePlace, openPlace, updateNear };
