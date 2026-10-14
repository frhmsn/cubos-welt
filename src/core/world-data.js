// Daten der Welt ohne Logik: Felder, Listen aller Dinge, einfache Abfragen.
// Hängt nur vom Raster und vom Katalog ab und darf deshalb überall importiert werden.
// Die Felder-Arrays ersetzt nur core/world.js (über setWorldArrays).
import { DIRS, I, inb } from './grid.js';
import { ITEMS } from '../content/catalog.js';

let tiles=[], groundM=[], objM=[], cols=[];
const cars=[], animals=[], pops=[];
const lightMap=new Map(), garages=new Map(), flames=new Map(), crossings=new Map(), aquariums=new Map();
const trains=[], ferries=[];
const RAILT=new Set(['schiene','bahnhof','uebergang','tunnel']), ROADT=new Set(['strasse','uebergang']), WATT=new Set(['wasser','meer','anleger','seetor']);
const gAt=(i,j)=>inb(i,j)?tiles[I(i,j)].g:null;
const isRoad=(i,j)=>ROADT.has(gAt(i,j));
const isRail=(i,j)=>RAILT.has(gAt(i,j));
const isWater=(i,j)=>WATT.has(gAt(i,j));
const FLAT=new Set(['strasse','sand','wasser','meer','schiene','uebergang']);
function rot(x,z,r){switch(r&3){case 0:return[x,z];case 1:return[z,-x];case 2:return[-x,-z];default:return[-z,x];}}
function toWorld(cl,r,c){
  if(cl[0]==='c'){const p=rot(cl[1],cl[2],r);return{c:1,x:p[0]+c.x,z:p[1]+c.z,r:cl[3]};}
  const a=rot(cl[1],cl[3],r),b=rot(cl[2],cl[4],r);
  return{c:0,x0:Math.min(a[0],b[0])+c.x,x1:Math.max(a[0],b[0])+c.x,z0:Math.min(a[1],b[1])+c.z,z1:Math.max(a[1],b[1])+c.z};
}
function freeAt(i,j){if(!inb(i,j))return false;const o=tiles[I(i,j)].o;return !o||!(ITEMS[o.t].house||o.t==='berg');}
function orient(i,j){
  for(let d=0;d<4;d++)if(isRoad(i+DIRS[d][0],j+DIRS[d][1]))return d;
  for(let d=0;d<4;d++)if(freeAt(i+DIRS[d][0],j+DIRS[d][1]))return d;
  return 0;
}

/** Neue Felder-Arrays setzen (beim Zurücksetzen und Vergrößern der Welt). */
function setWorldArrays(t,g,o,c){tiles=t;groundM=g;objM=o;cols=c;}

export { FLAT, RAILT, ROADT, WATT, animals, aquariums, cars, cols, crossings, ferries, flames, freeAt, gAt, garages, groundM, isRail, isRoad, isWater, lightMap, objM, orient, pops, rot, setWorldArrays, tiles, toWorld, trains };
