// Ausgebautes Aufgabenbuch (src/extras/aufgabenbuch): bleibt getestet, damit es sich wieder einbauen lässt.
import { describe, it, expect, vi } from 'vitest';
import { CHAPTERS, ALL_TASKS, QUEST_EVENTS } from '../../src/extras/aufgabenbuch/kapitel/index.js';
import { VEHICLE_LIST } from '../../src/content/vehicles/index.js';

describe('Aufgaben-Inhalte', () => {
  it('haben eindeutige IDs, Text, Tipp und bekannte Ereignisse', () => {
    const ids = ALL_TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of ALL_TASKS) {
      expect(t.text, t.id).toMatch(/\S/);
      expect(t.tip, t.id).toMatch(/\S/);
      expect(QUEST_EVENTS, t.id).toContain(t.on);
      expect(t.text.length, t.id + ': kurz halten, wird vorgelesen').toBeLessThan(60);
    }
  });
  it('Bonus-Dinge gibt es wirklich', () => {
    for (const c of CHAPTERS.filter((c) => c.bonus)) {
      const v = VEHICLE_LIST.find((x) => x.id === c.bonus.item);
      expect(v, c.bonus.item).toBeTruthy();
    }
  });
});

describe('Aufgaben-Logik', () => {
  it('zählt Ereignisse, vergibt Sterne und schaltet nach Kapitel 1 den Bonus frei', async () => {
    vi.resetModules();
    const ev = await import('../../src/core/events.js');
    const q = await import('../../src/extras/aufgabenbuch/logik.js');
    const got = [];
    ev.on('kapitel:geschafft', (d) => got.push(d));
    expect(q.stars()).toBe(0);
    expect(q.nextTask().id).toBe('stadt-strasse');
    ev.emit('gebaut', { id: 'strasse', kind: 'ground' });
    ev.emit('gebaut', { id: 'strasse', kind: 'ground' });
    expect(q.stars()).toBe(0);
    ev.emit('gebaut', { id: 'strasse', kind: 'ground' });
    expect(q.stars()).toBe(1);
    ev.emit('gebaut', { id: 'haus', kind: 'obj' });
    ev.emit('gebaut', { id: 'baum', kind: 'obj' }); ev.emit('gebaut', { id: 'tanne', kind: 'obj' });
    ev.emit('gebaut', { id: 'lambo', kind: 'car' });
    ev.emit('modus', { mode: 'walk' });
    ev.emit('eingestiegen', { type: 'boot' }); // zählt nicht für "Auto fahren"
    expect(q.isDone('stadt-fahren')).toBe(false);
    ev.emit('eingestiegen', { type: 'ferrari' });
    expect(q.isUnlocked('stadt')).toBe(false);
    ev.emit('hupen', { mode: 'drive' });
    expect(q.isUnlocked('stadt')).toBe(true);
    expect(got).toEqual([{ chapter: 'stadt', bonus: { item: 'goldlambo', text: 'ein goldener Lamborghini', akk: 'einen goldenen Lamborghini' } }]);
    expect(q.currentChapter().id).toBe('bahn');
  });
  it('führt Fortschritt aus einem Welt-Code zusammen', async () => {
    vi.resetModules();
    const q = await import('../../src/extras/aufgabenbuch/logik.js');
    expect(q.mergeQuests({ done: { 'bahn-zug': true }, cnt: { 'bahn-gleis': 3 } })).toBe(true);
    expect(q.isDone('bahn-zug')).toBe(true);
    expect(q.progressOf(ALL_TASKS.find((t) => t.id === 'bahn-gleis'))).toBe(3);
  });
});
