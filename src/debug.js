// Test-Schnittstelle window.__cubo. Nur aktiv, wenn window.__CUBO_DEBUG gesetzt ist (Tests).
import { game, pl } from './core/state.js';
import { center } from './core/grid.js';
import { bc } from './render/build-camera.js';
import { apply } from './systems/build.js';
import { nearestCar } from './systems/player.js';
import { enterCar, exitCar, setMode, startRide, startWalk } from './ui/modes.js';
import { fishes, fishModel } from './content/fish.js';
import { whaleModel } from './content/whales.js';
import { scene } from './render/renderer.js';
import { whales } from './systems/whales.js';
import { fishing } from './systems/fishing.js';
import { refreshAquariums } from './systems/aquarium.js';
import { select } from './ui/inventory.js';
import { emptyWorld, serialize } from './core/save.js';
import { islandWorld, sampleWorld } from './content/sample-world.js';
import { animals, aquariums, cars, doors, ferries, trains } from './core/world-data.js';
import { catchBook, whaleBook } from './systems/catch-book.js';
import { closeEditor, editTap, openEditor } from './systems/editor.js';
import { addHolz, addTaler, putInBucket, resetRucksack, rucksackData } from './systems/rucksack.js';
import { accept, activeOrder, claim, resetOrders } from './systems/orders.js';
import { openPlace } from './ui/places.js';
import { setDream, setStyle } from './render/dream.js';

// ---------- Test-Schnittstelle ----------
// Modelle zum Anschauen nebeneinander vor die Baukamera stellen (für neue Arten).
// Beispiel im Test: __cubo.lineup(['rochen','kalmar'])  Wale mit Präfix 'wal:'.
const shown = [];
function lineup(ids, size = 1.6) {
  for (const m of shown.splice(0)) scene.remove(m);
  const gap = size * 1.7;
  ids.forEach((id, k) => {
    const m = id.startsWith('wal:') ? whaleModel(id.slice(4)) : fishModel(id);
    if (id.startsWith('wal:')) m.scale.setScalar(size / 6);
    else m.scale.setScalar(size);
    m.position.set(bc.x + (k - (ids.length - 1) / 2) * gap, 2.5, bc.z + 4);
    m.rotation.y = Math.PI / 2;
    scene.add(m); shown.push(m);
  });
}

if (window.__CUBO_DEBUG) window.__cubo = {
  lineup,
  dream: (on) => setDream(on),
  style: (id) => setStyle(id),
  openEditor: (i, j) => openEditor(i, j),
  closeEditor: () => closeEditor(),
  editTap: (x, y) => editTap(x, y),
  frames: (n) => window.__frames(n),
  sel: (id) => select(id),
  tap: (i, j) => apply(i, j, false),
  mode: () => game.mode,
  setMode: (m) => setMode(m),
  startWalk: () => startWalk(),
  enterCar: (type) => { const c = type ? cars.find((c) => c.type === type) : nearestCar(); if (c) enterCar(c); return !!c; },
  exitCar: () => exitCar(false),
  rideFirstTrain: () => { if (!trains[0]) return false; startRide(trains[0]); return true; },
  setCam: (x, z, d, yaw) => { bc.x = x; bc.z = z; if (d != null) bc.d = d; if (yaw != null) bc.yaw = yaw; },
  center: (i, j) => center(i, j),
  setPl: (x, z, yaw) => { pl.x = x; pl.z = z; if (yaw != null) pl.yaw = yaw; },
  setCatch: (o) => { Object.assign(catchBook, o); refreshAquariums(); },
  // Rucksack und Aufträge
  rucksack: (o) => { if (o) resetRucksack(o); return rucksackData(); },
  give: (taler, holz, fish) => { addTaler(taler || 0); addHolz(holz || 0); for (const f of fish || []) putInBucket(f); },
  resetOrders: () => resetOrders(),
  accept: (id) => accept(id),
  claim: () => claim(),
  openPlace: (kind, arg) => openPlace(kind, arg),
  doors: () => [...doors.values()].map((d) => ({ x: d.x, z: d.z, auf: d.target })),
  click: (sel) => { const e = document.querySelector(sel); if (!e || e.hidden || e.disabled) return false; e.click(); return true; },
  emptyWorld: () => emptyWorld(),
  sampleWorld: () => sampleWorld(),
  islandWorld: () => islandWorld(),
  carPos: (k) => { const c = game.driveCar || cars[k || 0]; return c ? { x: c.x, z: c.z } : null; },
  fp: () => {
    const r = (v) => Math.round(v * 1000) / 1000;
    const vis = (id) => { const e = document.getElementById(id); return e ? !e.hidden : null; };
    return {
      mode: game.mode, N: game.N, sel: game.sel, curCat: game.curCat,
      world: JSON.stringify(serialize()),
      cars: cars.map((c) => [c.type, c.mode, r(c.x), r(c.z), r(c.h)]),
      trains: trains.map((t) => [t.type, r(t.odo || 0)]),
      ferries: ferries.map((f) => [r(f.x), r(f.z)]),
      fishes: fishes.map((f) => [f.type, r(f.x), r(f.z), !!f.free]),
      whales: whales.map((w) => [w.type, w.st, r(w.x), r(w.z)]),
      animals: animals.map((a) => [a.type, r(a.x), r(a.z)]),
      pl: [r(pl.x), r(pl.z), r(pl.yaw)],
      driving: game.driveCar ? game.driveCar.type : null,
      riding: !!game.rideTrain,
      fishing: fishing ? fishing.phase : null,
      catchBook: JSON.stringify(catchBook),
      whaleBook: JSON.stringify(whaleBook),
      aquarium: [...aquariums.values()].map((a) => a.fish.length),
      rucksack: rucksackData(),
      auftrag: (() => { const a = activeOrder(); return a ? [a.id, a.cnt, !!a.fertig] : null; })(),
      ui: { place: vis('place'), placeBtn: vis('btnPlace'), chop: vis('btnChop'), travel: vis('travel'), st: vis('stPanel'), aq: vis('aqPanel'), dive: vis('btnDive'), fish: vis('btnFish'), menu: vis('menu'), catch: vis('catch') },
    };
  },
};
