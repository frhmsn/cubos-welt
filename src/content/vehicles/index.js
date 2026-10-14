// Alle Fahrzeuge (Autos und Boote). Neues Fahrzeug: Datei anlegen (Vorlage: lambo.js) und hier eintragen.
// Die Reihenfolge ist die Reihenfolge im Inventar.
import lambo from './lambo.js';
import ferrari from './ferrari.js';
import polizei from './polizei.js';
import feuerwehrauto from './feuerwehrauto.js';
import bus from './bus.js';
import boot from './boot.js';
import uboot from './uboot.js';

export const VEHICLE_LIST = [lambo, ferrari, polizei, feuerwehrauto, bus, boot, uboot];
export const VEHICLE_BY_ID = Object.fromEntries(VEHICLE_LIST.map((v) => [v.id, v]));

/** Katalog-Eintrag (ITEMS) eines Fahrzeugs. */
export const vehicleItem = (v) => ({ kind: 'car', label: v.label, speed: v.speed, max: v.max, ...(v.siren ? { siren: true } : {}), ...(v.boat ? { boat: true } : {}), ...(v.sub ? { sub: true } : {}) });
