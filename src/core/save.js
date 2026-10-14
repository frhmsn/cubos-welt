// Spielstand: Welt in Daten umwandeln (serialize) und wieder aufbauen (applyData).
import '../ui/inventory.js'; // Ladereihenfolge: läuft nach ui/inventory.js (siehe docs/ARCHITEKTUR.md)
import { game } from './state.js';
import { DIRS, MAX_N, START_N, tileAt } from './grid.js';
import { ITEMS } from '../content/catalog.js';
import { MODELS } from '../content/models/buildings.js';
import { VX, VY } from '../content/models/blocks.js';
import { animals, cars, claimArea, ferries, isRail, isWater, rebuildGround, rebuildObj, resetTiles, tiles, trains } from './world.js';
import { addCar } from '../systems/traffic.js';
import { spawnTrain } from '../systems/trains.js';
import { spawnFerry } from '../systems/ferries.js';
import { addAnimal } from '../systems/animals.js';
import { bc } from '../render/build-camera.js';
import { FISH, fishes } from '../content/fish.js';
import { addFish, anyWater } from '../systems/fish.js';
import { SAVE_VERSION, migrate } from './save-schema.js';

// ---------- Speichern ----------
const KEY='kunos-welt-1'; let saveT=null;
function saveSoon(){clearTimeout(saveT);saveT=setTimeout(save,600);game.dirty=false;game.worldDirty=true;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(serialize()));}catch(e){}}
function serialize(){
  return {v:SAVE_VERSION,n:game.N,dayT: game.dayT,
    tiles:tiles.map(t=>t.o?(t.o.b?[t.g,t.o.t,t.o.r,t.o.s,t.o.b]:[t.g,t.o.t,t.o.r,t.o.s]):[t.g]),
    cars:cars.map(c=>[c.type,+c.x.toFixed(2),+c.z.toFixed(2),+c.h.toFixed(3),c.mode==='park'?0:1]),
    animals:animals.map(a=>[a.type,+a.x.toFixed(2),+a.z.toFixed(2)]),
    fish:fishes.filter(f=>f.free).map(f=>[f.type,+f.x.toFixed(2),+f.z.toFixed(2)]),
    trains:trains.map(t=>[t.type,t.i,t.j,t.dIn]),
    ferries:ferries.map(f=>[+f.x.toFixed(2),+f.z.toFixed(2),+f.h.toFixed(3)])};
}
function load(){
  let d=null; try{d=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){d=null;}
  return applyData(d);
}
function applyData(d){
  d=migrate(d);
  if(!d)return false;
  const n=Math.round(Math.sqrt(d.tiles.length));
  if(n*n!==d.tiles.length||n<10||n>MAX_N)return false;
  resetTiles(n);
  d.tiles.forEach((t,k)=>{const g=ITEMS[t[0]]&&ITEMS[t[0]].kind==='ground'?t[0]:'gras';tiles[k].g=g;if(t[1]&&MODELS[t[1]]){tiles[k].o={t:t[1],r:t[2]|0,s:t[3]|0};if(typeof t[4]==='string'&&t[4].length===VX*VX*VY)tiles[k].o.b=t[4];}});
  for(let k=0;k<game.N*game.N;k++)if(tiles[k].o&&tiles[k].o.t==='aquarium')claimArea(k%game.N,(k/game.N)|0,true);
  rebuildAll();
  (d.cars||[]).forEach(c=>{if(ITEMS[c[0]]&&ITEMS[c[0]].kind==='car')addCar(c[0],c[1],c[2],c[3],!!c[4]);});
  (d.animals||[]).forEach(a=>{if(ITEMS[a[0]]&&ITEMS[a[0]].kind==='animal')addAnimal(a[0],a[1],a[2]);});
  (d.trains||[]).forEach(t=>{if(!ITEMS[t[0]]||ITEMS[t[0]].kind!=='train'||!isRail(t[1],t[2]))return;let dd=t[3]|0;
    if(!isRail(t[1]+DIRS[dd][0],t[2]+DIRS[dd][1])){const q=[0,1,2,3].find(q=>isRail(t[1]+DIRS[q][0],t[2]+DIRS[q][1]));if(q==null)return;dd=q;}
    spawnTrain(t[0],t[1],t[2],dd);});
  (d.ferries||[]).forEach(f=>{const tl=tileAt(f[0],f[1]);if(tl&&isWater(tl.i,tl.j)){const fe=spawnFerry(f[0],f[1],f[2]);fe.wait=3;}});
  (d.fish||[]).forEach(f=>{if(FISH[f[0]]&&anyWater(f[1],f[2])){addFish(f[0],f[1],f[2]).free=true;}});
  if(typeof d.dayT==='number')game.dayT=d.dayT;
  return true;
}
function rebuildAll(){for(let j=0;j<game.N;j++)for(let i=0;i<game.N;i++){rebuildGround(i,j);rebuildObj(i,j);}}
function emptyWorld(){resetTiles(START_N);rebuildAll();bc.x=0;bc.z=3;bc.d=48;}

export { applyData, emptyWorld, load, rebuildAll, save, saveSoon, serialize };
