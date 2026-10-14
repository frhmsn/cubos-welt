// Test-Schnittstelle window.__cubo. Nur aktiv, wenn window.__CUBO_DEBUG gesetzt ist (Tests).
import { game } from './core/state.js';
import { center } from './core/grid.js';
import { animals, aquariums, cars, ferries, trains } from './core/world.js';
import { bc } from './render/build-camera.js';
import { apply } from './systems/build.js';
import { nearestCar, pl } from './systems/player.js';
import { enterCar, exitCar, setMode, startRide, startWalk } from './ui/modes.js';
import { fishes } from './content/fish.js';
import { whaleBook, whales } from './systems/whales.js';
import { catchBook, fishing } from './systems/fishing.js';
import { refreshAquariums } from './systems/aquarium.js';
import { select } from './ui/inventory.js';
import { emptyWorld, serialize } from './core/save.js';
import { sampleWorld } from './content/sample-world.js';

// ---------- Test-Schnittstelle ----------
if (window.__CUBO_DEBUG) window.__cubo = {
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
  emptyWorld: () => emptyWorld(),
  sampleWorld: () => sampleWorld(),
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
      fishing: fishing ? fishing.st || 'on' : null,
      catchBook: JSON.stringify(catchBook),
      whaleBook: JSON.stringify(whaleBook),
      aquarium: [...aquariums.values()].map((a) => a.fish.length),
      ui: { st: vis('stPanel'), aq: vis('aqPanel'), dive: vis('btnDive'), fish: vis('btnFish'), menu: vis('menu'), catch: vis('catch') },
    };
  },
};
