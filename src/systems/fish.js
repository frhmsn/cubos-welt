// Fische im Wasser: erscheinen, schwimmen, fliehen, springen.
import '../ui/modes.js'; // Ladereihenfolge: läuft nach ui/modes.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { angDiff, clamp } from '../core/util.js';
import { center, tileAt } from '../core/grid.js';
import { scene } from '../render/renderer.js';
import { M, disposeGroup } from '../render/materials.js';
import { lightTime } from '../render/lights.js';
import { FISH_BY_ID, fishGrounds } from '../content/fish/index.js';
import { FISH, finGeo, fishModel, fishes, pickFish, silGeo, silMat, splashGeo, splashes } from '../content/fish.js';
import { fishing } from './fishing.js';
import { gAt, tiles } from '../core/world-data.js';
import { nearFocus } from '../core/focus.js';

/** Darf diese Art an dieser Stelle schwimmen? (Habitat aus content/fish/<art>.js) */
function fishOk(type,x,z){const t=tileAt(x,z);if(!t)return false;return fishGrounds(type).includes(gAt(t.i,t.j));}
function anyWater(x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return g==='wasser'||g==='meer';}
const okF=(f,x,z)=>f.free?anyWater(x,z):fishOk(f.type,x,z);
function addFish(type,x,z){
  const sil=new THREE.Mesh(silGeo,silMat);sil.scale.setScalar(FISH[type].sil);sil.position.set(x,.035,z);scene.add(sil);
  let fin=null;if(FISH_BY_ID[type].dorsalFin){fin=new THREE.Mesh(finGeo,M('#4A5560'));fin.scale.setScalar(1.6);fin.castShadow=false;scene.add(fin);}
  const f={type,x,z,h:Math.random()*6.3,tx:x,tz:z,sil,fin,jumpT:6+Math.random()*14,jump:null,model:null,hook:false,flee:0};fishes.push(f);return f;
}
function removeFish(f){const k=fishes.indexOf(f);if(k<0)return;scene.remove(f.sil);if(f.fin)scene.remove(f.fin);if(f.model){scene.remove(f.model);disposeGroup(f.model);}fishes.splice(k,1);}
function splash(x,z,big){if(splashes.length>14)return;const m=new THREE.Mesh(splashGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,depthWrite:false}));m.position.set(x,.05,z);scene.add(m);splashes.push({m,t:0,big:big===true?1.6:(big||1)});}
let fishCheck=0;
function updateFish(dt){
  fishCheck-=dt;
  if(fishCheck<=0){fishCheck=2.5;
    let sea=[],lake=[];for(let k=0;k<game.N*game.N;k++){const g=tiles[k].g;if(g==='meer')sea.push(k);else if(g==='wasser')lake.push(k);}
    const inSea=f=>{const t=tileAt(f.x,f.z);return t&&gAt(t.i,t.j)==='meer';};const nSea=fishes.filter(f=>!f.free&&inSea(f)).length;
    const wantSea=Math.min(22,Math.round(sea.length*.35)),wantLake=Math.min(12,Math.round(lake.length*.3));
    const lakeN=fishes.filter(f=>!f.free&&!inSea(f)).length;
    for(let q=0;q<2;q++){
      if(nSea+q<wantSea&&sea.length){const k=sea[Math.floor(Math.random()*sea.length)],c=center(k%game.N,(k/game.N)|0);
        const type=pickFish(true);addFish(type,c.x+(Math.random()-.5)*3,c.z+(Math.random()-.5)*3);}
      if(lakeN+q<wantLake&&lake.length){const k=lake[Math.floor(Math.random()*lake.length)],c=center(k%game.N,(k/game.N)|0);addFish(pickFish(false),c.x+(Math.random()-.5)*3,c.z+(Math.random()-.5)*3);}
    }
  }
  for(const f of fishes.slice()){
    if(!okF(f,f.x,f.z)){removeFish(f);continue;}
    const sp=FISH[f.type].speed*(f.flee>0?2.5:1);if(f.flee>0)f.flee-=dt;
    if(f.hook&&fishing&&fishing.phase==='wait'){f.tx=fishing.x;f.tz=fishing.z;}
    let dx=f.tx-f.x,dz=f.tz-f.z,d=Math.hypot(dx,dz);
    if(d<.3&&!f.hook){for(let q=0;q<6;q++){const a=Math.random()*6.3,r=2+Math.random()*5,nx=f.x+Math.cos(a)*r,nz=f.z+Math.sin(a)*r;if(okF(f,nx,nz)){f.tx=nx;f.tz=nz;break;}}dx=f.tx-f.x;dz=f.tz-f.z;d=Math.hypot(dx,dz);}
    if(d>.05){const want=Math.atan2(dx,dz);f.h+=clamp(angDiff(want,f.h),-2.2*dt,2.2*dt);
      const st=Math.min(sp*dt*(.5+.5*Math.max(0,Math.cos(angDiff(want,f.h)))),d);const nx=f.x+Math.sin(f.h)*st,nz=f.z+Math.cos(f.h)*st;
      if(okF(f,nx,nz)){f.x=nx;f.z=nz;}else{f.tx=f.x;f.tz=f.z;}}
    const wig=Math.sin(lightTime*8+f.x)*.12;
    f.sil.position.set(f.x,.035,f.z);f.sil.rotation.y=f.h+wig;
    if(f.fin){f.fin.position.set(f.x+Math.sin(f.h)*.2,-.02+Math.sin(lightTime*2+f.z)*.03,f.z+Math.cos(f.h)*.2);f.fin.rotation.y=f.h;}
    if(FISH[f.type].jump&&!f.hook){f.jumpT-=dt;
      if(f.jumpT<=0&&!f.jump&&nearFocus(f.x,f.z,45)){f.jump={t:0};f.jumpT=8+Math.random()*16;if(!f.model){f.model=fishModel(f.type);f.model.scale.setScalar(FISH_BY_ID[f.type].scale.jump);scene.add(f.model);}f.model.visible=true;splash(f.x,f.z);}}
    if(f.jump){f.jump.t+=dt/1.0;const t=f.jump.t;
      if(t>=1){f.jump=null;f.model.visible=false;f.sil.visible=true;splash(f.x+Math.sin(f.h)*.8,f.z+Math.cos(f.h)*.8);}
      else{f.sil.visible=false;f.model.position.set(f.x+Math.sin(f.h)*t*.8,Math.sin(Math.PI*t)*1.1-.1,f.z+Math.cos(f.h)*t*.8);f.model.rotation.set(-(t-.5)*2.2,f.h,0);}}
  }
  for(let k=splashes.length-1;k>=0;k--){const sp=splashes[k];sp.t+=dt;const s=(1+sp.t*4)*sp.big;sp.m.scale.set(s,1,s);sp.m.material.opacity=Math.max(0,.7-sp.t*1.2)*Math.min(1,sp.big);if(sp.t>.65){scene.remove(sp.m);sp.m.material.dispose();splashes.splice(k,1);}}
}

export { addFish, anyWater, fishOk, okF, removeFish, splash, updateFish };
