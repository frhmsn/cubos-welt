// Fähre: Fahrt über Wasser, Anleger, Autos auf dem Deck.
import './trains.js'; // Ladereihenfolge: läuft nach systems/trains.js (siehe docs/ARCHITEKTUR.md)
import { game, pl } from '../core/state.js';
import { angDiff, clamp } from '../core/util.js';
import { DIRS, I, TILE, center, inb, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { BX, bake, box, bulbMat, disposeGroup, glassMat, mesh } from '../render/materials.js';
import { tone } from './audio.js';
import { startTravel } from './travel.js';
import { WATT, cars, ferries, groundM, isWater, tiles } from '../core/world-data.js';
import { nearFocus } from '../core/focus.js';

// ---------- Fähre ----------
function ferryModel(){
  const g=new THREE.Group();
  box(g,'#2F5E9E',3.0,.46,4.2,0,-.02,0);
  box(g,'#F4F4F2',3.04,.1,4.24,0,.17,0,false);
  box(g,'#7D858D',2.4,.08,4.16,0,.27,0,false);
  for(const z of[-1.4,0,1.4])box(g,'#F2C230',.08,.01,.7,0,.317,z,false);
  for(const x of[-1.38,1.38])box(g,'#F4F4F2',.24,.42,3.7,x,.5,0);
  box(g,'#F4F4F2',.55,1.3,1.3,1.38,1.2,0);
  box(g,glassMat,.59,.32,1.34,1.38,1.62,0,false);
  box(g,'#D7261E',.78,.12,1.5,1.38,1.92,0);
  box(g,'#F2C230',.2,.5,.2,1.38,2.2,.3);
  for(const sz of[-1,1]){const r=box(g,'#5A6168',2.2,.06,.55,0,.24,sz*2.32);r.rotation.x=sz*.16;}
  mesh(BX(.2,.1,.2),bulbMat,1.38,2.04,-.4,g,false);
  for(const z of[-1,1])box(g,'#F28C28',.05,.24,.24,-1.51,.55,z,false);
  return bake(g);
}
const nearAxis=(h,a)=>Math.abs(angDiff(a,h))<=Math.PI/2?a:a+Math.PI;
function spawnFerry(x,z,h){const g=ferryModel();g.position.set(x,0,z);g.rotation.y=h;scene.add(g);const f={g,x,z,h,state:'dock',wait:6,path:null,wp:0,v:0,bob:Math.random()*6,last:-1,tgt:null};ferries.push(f);return f;}
function removeFerry(f){const k=ferries.indexOf(f);if(k<0)return;scene.remove(f.g);disposeGroup(f.g);ferries.splice(k,1);}
function deckLocal(f,x,z){const dx=x-f.x,dz=z-f.z,c=Math.cos(f.h),sn=Math.sin(f.h);return[dx*c-dz*sn,dx*sn+dz*c];}
function deckWorld(f,lx,lz){const c=Math.cos(f.h),sn=Math.sin(f.h);return[f.x+lx*c+lz*sn,f.z-lx*sn+lz*c];}
function onDeckF(f,x,z){const l=deckLocal(f,x,z);return Math.abs(l[0])<1.2&&Math.abs(l[1])<2.45;}
function onDeck(x,z){for(const f of ferries)if(onDeckF(f,x,z))return f;return null;}
function pierTiles(){const a=[];for(let k=0;k<game.N*game.N;k++){const g=tiles[k].g;if(g==='anleger'||g==='seetor')a.push(k);}return a;}
function dockPose(k){
  const i=k%game.N,j=Math.floor(k/game.N),c=center(i,j),gm=groundM[k],g=tiles[k].g;
  let d=g==='anleger'?(gm&&gm.userData.land):(gm&&gm.userData.water);if(d==null)d=0;
  const f=DIRS[d],off=g==='anleger'?-.25:0;return{x:c.x+f[0]*off,z:c.z+f[1]*off,axis:Math.atan2(f[0],f[1])};
}
function waterPath(si,sj,tk){
  const s0=I(si,sj),prev=new Int32Array(game.N*game.N).fill(-2);prev[s0]=-1;const q=[s0];let h=0;
  while(h<q.length){const k=q[h++];if(k===tk)break;const i=k%game.N,j=(k/game.N)|0;
    for(const d of DIRS){const a=i+d[0],b=j+d[1];if(!inb(a,b))continue;const n=I(a,b);if(prev[n]!==-2||!isWater(a,b))continue;prev[n]=k;q.push(n);}}
  if(prev[tk]===-2)return null;const p=[];for(let k=tk;k!==-1;k=prev[k])p.push(k);return p.reverse();
}
function planFerry(f){
  const here=tileAt(f.x,f.z);if(!here){f.state='dock';f.wait=5;return;}
  const hk=I(here.i,here.j),ps=pierTiles().filter(k=>k!==hk).sort((a,b)=>a-b);
  if(!ps.length){f.state='dock';f.wait=5;return;}
  const st=ps.findIndex(k=>k>f.last),ord=st<0?ps:ps.slice(st).concat(ps.slice(0,st));
  for(const k of ord){const pth=waterPath(here.i,here.j,k);if(!pth)continue;
    f.last=k;f.tgt=k;const dp=dockPose(k);
    f.path=pth.slice(1).map(q=>{const c=center(q%game.N,Math.floor(q/game.N));return{x:c.x,z:c.z};});
    if(!f.path.length)f.path=[{x:dp.x,z:dp.z}];else f.path[f.path.length-1]={x:dp.x,z:dp.z};
    f.wp=0;f.state='move';if(playerAboard(f)||nearFocus(f.x,f.z,25))tone(130,.7,'sawtooth',.05);return;}
  f.state='dock';f.wait=5;
}
function playerAboard(f){return (game.mode==='walk'&&onDeckF(f,pl.x,pl.z))||(game.mode==='drive'&&game.driveCar&&onDeckF(f,game.driveCar.x,game.driveCar.z));}
function updateFerry(f,dt){
  f.bob+=dt;
  const carried=[];
  if(game.mode==='walk'&&onDeckF(f,pl.x,pl.z))carried.push({o:pl,p:1,l:deckLocal(f,pl.x,pl.z)});
  for(const c of cars)if(c.mode!=='ai'&&!ITEMS[c.type].boat&&onDeckF(f,c.x,c.z))carried.push({o:c,p:0,l:deckLocal(f,c.x,c.z)});
  const oh=f.h;
  if(f.state==='dock'){f.wait-=dt;if(f.wait<=0)planFerry(f);}
  else if(f.state==='move'){
    const w=f.path[f.wp],dx=w.x-f.x,dz=w.z-f.z,d=Math.hypot(dx,dz),last=f.wp===f.path.length-1;
    if(d<(last?.06:.7)){if(last){f.x=w.x;f.z=w.z;f.v=0;f.state='align';f.alignH=nearAxis(f.h,dockPose(f.tgt).axis);}else f.wp++;}
    else{const a=Math.atan2(dx,dz),want=nearAxis(f.h,a);f.h+=clamp(angDiff(want,f.h),-1.1*dt,1.1*dt);
      const al=Math.cos(angDiff(want,f.h));let tg=3.2*Math.max(.15,al*al);if(last)tg=Math.min(tg,d*1.2+.2);
      f.v+=clamp(tg-f.v,-3*dt,1.5*dt);const st=Math.min(Math.max(f.v,0)*dt,d);f.x+=dx/d*st;f.z+=dz/d*st;}
  }
  else if(f.state==='align'){const dh=angDiff(f.alignH,f.h);f.h+=clamp(dh,-1.1*dt,1.1*dt);if(Math.abs(dh)<.01){f.h=f.alignH;f.state='dock';f.wait=7;ferryArrived(f);}}
  const dH=f.h-oh;
  for(const e of carried){const w=deckWorld(f,e.l[0],e.l[1]);e.o.x=w[0];e.o.z=w[1];
    if(e.p)e.o.yaw+=dH;else{e.o.h+=dH;e.o.g.position.set(e.o.x,.31,e.o.z);e.o.g.rotation.y=e.o.h;}}
  f.g.position.set(f.x,Math.sin(f.bob*1.6)*.025,f.z);f.g.rotation.set(0,f.h,0);f.g.rotateZ(Math.sin(f.bob*1.1)*.012);
}
function ferryArrived(f){
  const k=f.tgt;if(k==null||!tiles[k])return;
  if(tiles[k].g==='seetor'&&playerAboard(f)&&!game.traveling){startTravel({kind:'ferry',ferry:f});return;}
  if(playerAboard(f)||nearFocus(f.x,f.z,25)){tone(130,.5,'sawtooth',.05);tone(165,.5,'sawtooth',.04,.55);}
}
function canStand(x,z){
  const t=tileAt(x,z);if(!t)return false;const k=I(t.i,t.j),g=tiles[k].g;
  if(!WATT.has(g))return true;if(onDeck(x,z))return true;
  if(g==='anleger'){const gm=groundM[k],L=gm&&gm.userData.land;if(L!=null){const c=center(t.i,t.j),d=DIRS[L];if((x-c.x)*d[0]+(z-c.z)*d[1]>TILE/2-.45)return true;}}
  return false;
}

export { canStand, dockPose, ferryModel, onDeck, onDeckF, pierTiles, playerAboard, removeFerry, spawnFerry, updateFerry };
