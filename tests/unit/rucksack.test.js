// Rucksack und Aufträge: Taler, Holz, Eimer, Kaufen, Auftrag annehmen, erledigen, abholen.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ORDERS, ORDER_EVENTS } from '../../src/content/orders/index.js';
import { FISH_LIST } from '../../src/content/fish/index.js';
import { VEHICLE_LIST } from '../../src/content/vehicles/index.js';

let ev, r, o;
beforeEach(async () => {
  vi.resetModules();
  ev = await import('../../src/core/events.js');
  r = await import('../../src/systems/rucksack.js');
  o = await import('../../src/systems/orders.js');
  r.resetRucksack(); o.resetOrders();
});

describe('Inhalte', () => {
  it('Aufträge haben eindeutige IDs, kurze Texte, Belohnung und ein bekanntes Ereignis oder etwas zum Bringen', () => {
    const ids = ORDERS.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const x of ORDERS) {
      expect(x.text.length, x.id + ': kurz halten, wird vorgelesen').toBeLessThan(50);
      expect(x.tip, x.id).toMatch(/\S/);
      expect(x.taler, x.id).toBeGreaterThan(0);
      expect(!!x.on !== !!x.give, x.id + ': entweder on oder give').toBe(true);
      if (x.on) expect(ORDER_EVENTS, x.id).toContain(x.on);
    }
  });
  it('jeder Fisch hat einen Marktpreis, Dinge mit Preis kosten Taler', () => {
    for (const f of FISH_LIST) expect(f.taler, f.id).toBeGreaterThan(0);
    expect(VEHICLE_LIST.find((v) => v.id === 'motorboot').price).toBeGreaterThan(0);
  });
});

describe('Rucksack', () => {
  it('startet mit Holz, zählt Taler und Fische, kauft nur mit genug Talern', () => {
    expect(r.holz()).toBe(r.START.holz);
    expect(r.taler()).toBe(0);
    expect(r.buy('motorboot', 30)).toBe(false);
    r.addTaler(40);
    expect(r.buy('motorboot', 30)).toBe(true);
    expect(r.owns('motorboot')).toBe(true);
    expect(r.taler()).toBe(10);
    r.putInBucket('makrele'); r.putInBucket('makrele'); r.putInBucket('hai');
    expect(r.fishCount()).toBe(3);
    expect(r.takeFish(2)).toBe(2);
    expect(r.fishCount()).toBe(1);
    expect(r.spend('holz', 99)).toBe(false);
    expect(r.spend('holz', 4)).toBe(true);
    expect(r.holz()).toBe(r.START.holz - 4);
  });
  it('Welt-Code: größerer Wert gewinnt, Gekauftes kommt dazu', () => {
    r.addTaler(5);
    expect(r.mergeRucksack({ taler: 3, holz: 50, eimer: { hai: 2 }, gekauft: { goldlambo: true } })).toBe(true);
    expect(r.taler()).toBe(5); expect(r.holz()).toBe(50); expect(r.owns('goldlambo')).toBe(true); expect(r.fishCount()).toBe(2);
    expect(r.mergeRucksack({ taler: 1 })).toBe(false);
  });
});

describe('Aufträge', () => {
  it('bietet drei an, zählt nur den angenommenen und zahlt beim Abholen', () => {
    const first = o.offers();
    expect(first.length).toBe(3);
    o.accept('fische-drei');
    ev.emit('fang:geaendert', { type: 'barsch' });
    ev.emit('fang:geaendert', {}); // Code eingefügt, kein Fang
    ev.emit('fang:geaendert', { type: 'hai' });
    expect(o.activeOrder().fertig).toBe(false);
    expect(o.claim()).toBe(0);
    ev.emit('fang:geaendert', { type: 'hai' });
    expect(o.activeOrder().fertig).toBe(true);
    expect(o.claim()).toBe(6);
    expect(r.taler()).toBe(6);
    expect(o.activeOrder()).toBe(null);
    // Erledigte rutschen nach hinten
    expect(o.offers().map((x) => x.id)).not.toContain('fische-drei');
  });
  it('Bringen-Aufträge sind fertig, sobald genug im Rucksack ist, und nehmen es beim Abgeben', () => {
    const done = [];
    ev.on('auftrag:fertig', (d) => done.push(d.id));
    r.spend('holz', r.holz() - 4);
    o.accept('holz-zehn');
    expect(o.activeOrder().fertig).toBe(false);
    r.addHolz(5);
    expect(done).toEqual([]);
    r.addHolz(1);
    expect(done).toEqual(['holz-zehn']);
    expect(o.claim()).toBe(15);
    expect(r.holz()).toBe(0);
  });
});
