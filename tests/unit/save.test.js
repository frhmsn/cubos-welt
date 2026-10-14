// Spielstand-Format und Welt-Codes. Wichtig, weil Kunos Welten nie verloren gehen dürfen.
import { describe, it, expect } from 'vitest';
import { SAVE_VERSION, migrate } from '../../src/core/save-schema.js';
import { encodeWorld, decodeWorld } from '../../src/core/world-codes.js';

const world = { v: 1, n: 10, dayT: 0.3, tiles: Array.from({ length: 100 }, (_, k) => (k % 7 ? ['gras'] : ['strasse', 'haus', 1, 0])), cars: [['lambo', 1, 2, 0.5, 1]] };

describe('Spielstand', () => {
  it('aktuelle Version bleibt unverändert', () => {
    expect(migrate(structuredClone({ ...world, v: SAVE_VERSION }))).toEqual({ ...world, v: SAVE_VERSION });
  });
  it('Stände ohne Versionsnummer gelten als Version 1', () => {
    const { v, ...old } = world;
    expect(migrate(structuredClone(old))).not.toBeNull();
  });
  it('Stände einer neueren Spielversion werden nicht angefasst', () => {
    expect(migrate({ ...world, v: SAVE_VERSION + 1 })).toBeNull();
  });
  it('Unsinn wird abgelehnt', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate({ v: 1 })).toBeNull();
  });
});

describe('Welt-Codes', () => {
  it('Hin und zurück ergibt dieselbe Welt', async () => {
    const obj = { v: 2, worlds: [{ name: 'Stadt', data: JSON.stringify(world) }], fang: { c: { hai: 2 }, r: {}, w: {} } };
    const code = await encodeWorld(obj);
    expect(code).toMatch(/^KUNOWELT[01]:/);
    expect(await decodeWorld(code)).toEqual(obj);
  });
  it('Leerzeichen und Zeilenumbrüche im Code stören nicht', async () => {
    const code = await encodeWorld({ v: 1, name: 'A', data: '{}' });
    const messy = code.slice(0, 20) + '\n  ' + code.slice(20);
    expect(await decodeWorld(messy)).toEqual({ v: 1, name: 'A', data: '{}' });
  });
  it('kaputte Codes werfen einen Fehler', async () => {
    await expect(decodeWorld('HALLO')).rejects.toThrow();
  });
});
