// Tiere laufen herum.
import './ferries.js'; // Ladereihenfolge: dieses Modul läuft nach systems/ferries.js
import { I, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { animalModel } from '../content/models/animals.js';
import { animals, tiles } from '../core/world.js';

// ---------- Tiere laufen ----------
function animalOk(x,z){const t=tileAt(x,z);if(!t)return false;const tt=tiles[I(t.i,t.j)];if(tt.g!=='gras'&&tt.g!=='sand')return false;if(tt.o&&tt.o.t!=='blumen'&&!ITEMS[tt.o.t].walkable)return false;return true;}
function addAnimal(type,x,z){const g=animalModel(type);g.position.set(x,0,z);const a={type,g,x,z,tx:x,tz:z,wait:Math.random()*2,h:Math.random()*6.28,ph:0};g.rotation.y=a.h;scene.add(g);animals.push(a);return a;}
function updateAnimal(a,dt){
  const legs=a.g.userData.legs,sp=ITEMS[a.type].speed;
  if(a.wait>0){a.wait-=dt;for(const l of legs)l.rotation.x*=.85;return;}
  const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);
  if(d<.08){a.wait=1+Math.random()*3.5;for(let k=0;k<8;k++){const nx=a.x+(Math.random()-.5)*5,nz=a.z+(Math.random()-.5)*5;if(animalOk(nx,nz)){a.tx=nx;a.tz=nz;break;}}return;}
  const step=Math.min(sp*dt,d); a.x+=dx/d*step; a.z+=dz/d*step;
  let dh=Math.atan2(dx,dz)-a.h; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); a.h+=dh*Math.min(1,dt*6);
  a.ph+=dt*(4+sp*5); for(const l of legs)l.rotation.x=Math.sin(a.ph+l.userData.p)*.55;
  a.g.position.set(a.x,0,a.z); a.g.rotation.y=a.h;
}

export { addAnimal, animalOk, updateAnimal };
