// Welt-Zustand: Felder, Objekte, Neuaufbau von Boden und Objekten, Welt vergrößern, Großbauten.
import '../content/models/blocks.js'; // Ladereihenfolge: dieses Modul läuft nach content/models/blocks.js
import { game } from './state.js';
import { DIRS, GROW, I, MAX_N, TILE, ZMAX, center, inb } from './grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { bake, disposeGroup } from '../render/materials.js';
import { updateBase } from '../content/models/ground.js';
import { groundModel, stationAxis } from '../content/models/rail.js';
import { MODELS } from '../content/models/buildings.js';
import { removeTrain } from '../systems/trains.js';
import { removeFerry } from '../systems/ferries.js';
import { tone } from '../systems/audio.js';
import { bc } from '../render/build-camera.js';
import { inTile, nope } from '../systems/build.js';
import { hint } from '../ui/modes.js';
import { fishes } from '../content/fish.js';
import { removeFish } from '../systems/fish.js';
import { removeWhale, whales } from '../systems/whales.js';
import { clearAquarium, fillAquarium } from '../systems/aquarium.js';
import { clearTile } from '../systems/travel.js';
import { saveSoon } from './save.js';

// ---------- Welt-Zustand ----------
let tiles=[], groundM=[], objM=[], cols=[];
const cars=[], animals=[], pops=[];
const lightMap=new Map(), garages=new Map(), flames=new Map(), crossings=new Map(), aquariums=new Map();
const trains=[], ferries=[];
function dropObj(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);garages.delete(grp);flames.delete(grp);const aq=aquariums.get(grp);if(aq){clearAquarium(aq);aquariums.delete(grp);}}
function dropGround(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);crossings.delete(grp);}
function resetTiles(nn){
  for(let k=0;k<groundM.length;k++){dropGround(groundM[k]);dropObj(objM[k]);}
  for(const aq of aquariums.values())clearAquarium(aq);
  lightMap.clear();garages.clear();flames.clear();crossings.clear();aquariums.clear();
  while(trains.length)removeTrain(trains[0]);
  while(ferries.length)removeFerry(ferries[0]);
  while(fishes.length)removeFish(fishes[0]);
  while(whales.length)removeWhale(whales[0]);
  game.rideTrain=null;
  if(nn){game.N=nn;game.HALF=game.N*TILE/2;updateBase();}
  tiles=Array.from({length:game.N*game.N},()=>({g:'gras',o:null})); groundM=new Array(game.N*game.N).fill(null); objM=new Array(game.N*game.N).fill(null); cols=Array.from({length:game.N*game.N},()=>[]);
  while(cars.length){const c=cars.pop();scene.remove(c.g);disposeGroup(c.g);}
  while(animals.length){const a=animals.pop();scene.remove(a.g);disposeGroup(a.g);}
}
const RAILT=new Set(['schiene','bahnhof','uebergang','tunnel']), ROADT=new Set(['strasse','uebergang']), WATT=new Set(['wasser','meer','anleger','seetor']);
const gAt=(i,j)=>inb(i,j)?tiles[I(i,j)].g:null;
const isRoad=(i,j)=>ROADT.has(gAt(i,j));
const isRail=(i,j)=>RAILT.has(gAt(i,j));
const isWater=(i,j)=>WATT.has(gAt(i,j));
const FLAT=new Set(['strasse','sand','wasser','meer','schiene','uebergang']);
function groundConn(i,j){
  const t=tiles[I(i,j)],conn={alt:(i+j)%2===0,dirs:[],rail:[],land:null,water:null,side:null};
  for(let d=0;d<4;d++){const a=i+DIRS[d][0],b=j+DIRS[d][1];if(isRoad(a,b))conn.dirs.push(d);if(isRail(a,b))conn.rail.push(d);}
  if(t.g==='anleger')for(let d=0;d<4;d++){const a=i+DIRS[d][0],b=j+DIRS[d][1];if(inb(a,b)&&!isWater(a,b)){conn.land=d;break;}}
  if(t.g==='seetor')for(let d=0;d<4;d++){if(isWater(i+DIRS[d][0],j+DIRS[d][1])){conn.water=d;break;}}
  if(t.g==='bahnhof'){const r=stationAxis(conn.rail),cand=r===1?[0,2]:[1,3];
    conn.side=cand.find(d=>{const a=i+DIRS[d][0],b=j+DIRS[d][1];return inb(a,b)&&!isRail(a,b)&&!isWater(a,b)&&!(tiles[I(a,b)].o&&ITEMS[tiles[I(a,b)].o.t].house);});
    if(conn.side==null)conn.side=cand.find(d=>inb(i+DIRS[d][0],j+DIRS[d][1]));if(conn.side==null)conn.side=cand[0];}
  return conn;
}
const _q=new THREE.Quaternion(),_X=new THREE.Vector3(1,0,0);
function setArms(cr,up){cr.up=up;for(const a of cr.arms)a.m.quaternion.copy(a.q0).multiply(_q.setFromAxisAngle(_X,-Math.PI/2*up));}
function rebuildGround(i,j){
  const k=I(i,j); if(groundM[k]){dropGround(groundM[k]);groundM[k]=null;}
  const t=tiles[k]; if(t.g==='gras')return;
  const src=groundModel(t.g,groundConn(i,j)),ud=src.userData;
  const grp=bake(src); const c=center(i,j); grp.position.set(c.x,0,c.z);
  if(FLAT.has(t.g))grp.traverse(o=>{if(o.isMesh&&!o.userData.arm)o.castShadow=false;});
  grp.userData.cols=(ud.cols||[]).map(cl=>toWorld(cl,0,c));
  if(ud.lights&&ud.lights.length)lightMap.set(grp,ud.lights.map(l=>({x:c.x+l[0],y:l[1],z:c.z+l[2],c:l[3],i:l[4],d:l[5],f:0})));
  grp.userData.side=ud.side; grp.userData.land=ud.land; grp.userData.water=ud.water;
  const arms=grp.children.filter(m=>m.userData.arm);
  if(arms.length){const cr={arms:arms.map(m=>({m,q0:m.quaternion.clone()})),x:c.x,z:c.z,up:0,closed:false};crossings.set(grp,cr);setArms(cr,1);}
  scene.add(grp); groundM[k]=grp; freeze(grp);
}
function freeze(grp){grp.updateMatrix();grp.matrixAutoUpdate=false;for(const m of grp.children){m.updateMatrix();if(!m.userData.keep){m.matrixAutoUpdate=false;}}grp.updateMatrixWorld(true);}
function rot(x,z,r){switch(r&3){case 0:return[x,z];case 1:return[z,-x];case 2:return[-x,-z];default:return[-z,x];}}
function toWorld(cl,r,c){
  if(cl[0]==='c'){const p=rot(cl[1],cl[2],r);return{c:1,x:p[0]+c.x,z:p[1]+c.z,r:cl[3]};}
  const a=rot(cl[1],cl[3],r),b=rot(cl[2],cl[4],r);
  return{c:0,x0:Math.min(a[0],b[0])+c.x,x1:Math.max(a[0],b[0])+c.x,z0:Math.min(a[1],b[1])+c.z,z1:Math.max(a[1],b[1])+c.z};
}
function rebuildObj(i,j,pop){
  const k=I(i,j); if(objM[k]){dropObj(objM[k]);objM[k]=null;} cols[k]=[];
  const o=tiles[k].o; if(!o)return;
  const mdl=MODELS[o.t](o.s,o); const grp=bake(mdl.g); const c=center(i,j);
  grp.position.set(c.x,0,c.z); grp.rotation.y=o.r*Math.PI/2; scene.add(grp); objM[k]=grp; freeze(grp);
  cols[k]=mdl.cols.map(cl=>toWorld(cl,o.r,c));
  let ls=mdl.lights;
  if(!ls&&ITEMS[o.t].house)ls=[[0,o.t==='hochhaus'?2.5:2.4,0,0xffd9a0,1.1,6.5]];
  if(ls&&ls.length)lightMap.set(grp,ls.map(l=>{const p=rot(l[0],l[2],o.r);return{x:c.x+p[0],y:l[1],z:c.z+p[1],c:l[3],i:l[4],d:l[5],f:l[6]||0};}));
  const door=grp.children.find(m=>m.userData.door);
  if(door){const p=rot(0,1,o.r);garages.set(grp,{door,x:c.x+p[0]*1.6,z:c.z+p[1]*1.6,open:0});}
  const fl=grp.children.filter(m=>m.userData.flame); if(fl.length)flames.set(grp,fl);
  if(mdl.tank){const aq={x:c.x,z:c.z,r:o.r,fish:[]};aquariums.set(grp,aq);fillAquarium(aq);}
  if(pop)pops.push({g:grp,t:0});
}
function expandWorld(){
  if(game.N+2*GROW>MAX_N){nope();hint('Größer geht es nicht. Die Welt ist schon riesig!',3000);return;}
  const oN=game.N,nN=game.N+2*GROW,len=nN*nN;
  const nt=Array.from({length:len},()=>({g:'gras',o:null})),ng=new Array(len).fill(null),no=new Array(len).fill(null),nc=Array.from({length:len},()=>[]);
  for(let j=0;j<oN;j++)for(let i=0;i<oN;i++){const a=j*oN+i,b=(j+GROW)*nN+(i+GROW);nt[b]=tiles[a];ng[b]=groundM[a];no[b]=objM[a];nc[b]=cols[a];}
  game.N=nN;game.HALF=game.N*TILE/2;tiles=nt;groundM=ng;objM=no;cols=nc;updateBase();
  for(const c of cars)if(c.mode==='ai'){c.i+=GROW;c.j+=GROW;}
  const remap=k=>k==null||k<0?k:(Math.floor(k/oN)+GROW)*nN+(k%oN)+GROW;
  for(const tr of trains){tr.i+=GROW;tr.j+=GROW;tr.lastStop=remap(tr.lastStop);tr.stopK=remap(tr.stopK);}
  for(const f of ferries){f.tgt=remap(f.tgt);f.last=remap(f.last);}
  bc.d=Math.min(ZMAX(),bc.d+18);
  tone(392,.12,'sine',.1);tone(523,.12,'sine',.1,.1);tone(659,.2,'sine',.1,.2);
  hint('Die Welt ist jetzt '+game.N+' × '+game.N+' Felder groß!',3000);
  saveSoon();
}
function orientBig(i,j){for(let d=0;d<4;d++)if(isRoad(i+DIRS[d][0]*2,j+DIRS[d][1]*2))return d;for(let d=0;d<4;d++)if(inb(i+DIRS[d][0]*2,j+DIRS[d][1]*2)&&!(tiles[I(i+DIRS[d][0]*2,j+DIRS[d][1]*2)].o))return d;return 0;}
function claimArea(i,j,soft){
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(!inb(a,b))continue;const k=I(a,b);
    if(soft&&tiles[k].o)continue;
    if(!soft){clearTile(a,b);for(const tr of trains.slice())if(tr!==game.rideTrain&&tr.cars.some(c=>inTile(c.g.position,a,b)))removeTrain(tr);if(tiles[k].g!=='gras'&&tiles[k].g!=='sand')setGround(a,b,'gras');}
    tiles[k].o={t:'teil',r:0,s:(di+1)*3+(dj+1)};if(!soft)rebuildObj(a,b);}
  const t=tiles[I(i,j)];if(!soft&&t.g!=='gras'&&t.g!=='sand')setGround(i,j,'gras');
  if(!soft)clearTile(i,j);
}
function removeBig(i,j){
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(!inb(a,b))continue;const o=tiles[I(a,b)].o;
    if(o&&((di||dj)?o.t==='teil':o.t==='aquarium')){tiles[I(a,b)].o=null;rebuildObj(a,b);}}
}
function freeAt(i,j){if(!inb(i,j))return false;const o=tiles[I(i,j)].o;return !o||!(ITEMS[o.t].house||o.t==='berg');}
function orient(i,j){
  for(let d=0;d<4;d++)if(isRoad(i+DIRS[d][0],j+DIRS[d][1]))return d;
  for(let d=0;d<4;d++)if(freeAt(i+DIRS[d][0],j+DIRS[d][1]))return d;
  return 0;
}
function setGround(i,j,g){
  const t=tiles[I(i,j)]; t.g=g;
  if(g!=='gras'&&g!=='sand'&&t.o){t.o=null;rebuildObj(i,j);}
  rebuildGround(i,j);
  for(const d of DIRS){const a=i+d[0],b=j+d[1];if(inb(a,b)){const ng=tiles[I(a,b)].g;if(ng!=='gras'&&ng!=='sand')rebuildGround(a,b);}}
}

export { WATT, animals, aquariums, cars, claimArea, cols, crossings, expandWorld, ferries, flames, freeAt, gAt, garages, groundM, isRail, isRoad, isWater, lightMap, orient, orientBig, pops, rebuildGround, rebuildObj, removeBig, resetTiles, rot, setArms, setGround, tiles, trains };
