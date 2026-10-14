// Prüft die Inhaltsdateien: Fische und Wale. Läuft bei jedem `npm test`.
import { describe, it, expect } from 'vitest';
import { FISH_LIST, FISH, LAKE_FISH, SEA_FISH } from '../../src/content/fish/index.js';
import { WHALE_LIST } from '../../src/content/whales/index.js';

const sum = (l) => l.reduce((a, [, w]) => a + w, 0);

describe('Fische', () => {
  it('haben eindeutige IDs aus Kleinbuchstaben', () => {
    const ids = FISH_LIST.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+$/);
  });
  it('haben sinnvolle Werte', () => {
    for (const f of FISH_LIST) {
      expect(f.length[0], f.id).toBeLessThan(f.length[1]);
      expect(f.speed, f.id).toBeGreaterThan(0);
      for (const k of ['shadow', 'underwater', 'aquarium', 'rod', 'jump']) expect(f.scale[k], `${f.id}.scale.${k}`).toBeGreaterThan(0);
      expect(typeof f.model, f.id).toBe('function');
      expect(f.plural, f.id).not.toBe('');
    }
  });
  it('Häufigkeiten ergeben je Gewässer zusammen 1', () => {
    expect(sum(LAKE_FISH)).toBeCloseTo(1, 5);
    expect(sum(SEA_FISH)).toBeCloseTo(1, 5);
  });
  it('Kurzform FISH hat alle Arten', () => {
    expect(Object.keys(FISH)).toEqual(FISH_LIST.map((f) => f.id));
    expect(FISH.barsch.where).toBe('in Seen und im Meer');
    expect(FISH.hai.where).toBe('im Meer');
    expect(FISH.hecht.where).toBe('in Seen');
  });
});

describe('Wale', () => {
  it('haben eindeutige IDs und Modelle', () => {
    const ids = WHALE_LIST.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WHALE_LIST) { expect(typeof w.model).toBe('function'); expect(w.scale.sea).toBeGreaterThan(0); }
  });
});

import { VEHICLE_LIST } from '../../src/content/vehicles/index.js';
import { ANIMAL_LIST } from '../../src/content/animals/index.js';

describe('Fahrzeuge und Tiere', () => {
  it('Fahrzeuge haben eindeutige IDs, Kategorie und Tempo', () => {
    const ids = VEHICLE_LIST.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const v of VEHICLE_LIST) {
      expect(['auto', 'see'], v.id).toContain(v.category);
      expect(v.speed, v.id).toBeGreaterThan(0);
      expect(v.max, v.id).toBeGreaterThan(v.speed);
      expect(typeof v.model, v.id).toBe('function');
      if (v.sub) expect(v.boat, v.id + ': U-Boote sind auch Boote').toBe(true);
    }
  });
  it('Tiere haben eindeutige IDs und Tempo', () => {
    const ids = ANIMAL_LIST.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of ANIMAL_LIST) { expect(a.speed, a.id).toBeGreaterThan(0); expect(typeof a.model).toBe('function'); }
  });
});
