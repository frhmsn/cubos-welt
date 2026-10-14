// Echte Lichter: Pool von Punktlichtern für Laternen und Scheinwerfer, Garagentore.
import './daynight.js'; // Ladereihenfolge: dieses Modul läuft nach render/daynight.js
import { game } from '../core/state.js';
import { scene, walkCam } from './renderer.js';
import { glowFire } from './materials.js';
import { cars, flames, garages, lightMap } from '../core/world.js';
import { bc } from './build-camera.js';
import { pl } from '../systems/player.js';

// ---------- Echte Lichter ----------
/* Feste Anzahl Lampen, die immer zu den nächsten Lichtquellen springen. Feste Anzahl, damit nichts neu kompiliert wird. */
const LIGHT_N=6,lightPool=[];
for(let k=0;k<LIGHT_N;k++){const L=new THREE.PointLight(0xffd9a0,0,10,1.4);L.position.set(0,-60,0);L.userData.src=null;L.visible=false;scene.add(L);lightPool.push(L);}
const headSpot=new THREE.SpotLight(0xfff6e0,0,34,.42,.55,1.1); headSpot.visible=false; scene.add(headSpot,headSpot.target);
let lightPick=0,lightTime=0,lightsOn=false;
const lp=new THREE.Vector3();
function updateLights(dt,night){
  lightTime+=dt; lightPick-=dt;
  if(game.mode==='walk')lp.copy(walkCam.position); else if(game.mode==='drive'&&game.driveCar)lp.set(game.driveCar.x,1,game.driveCar.z); else if(game.mode==='ride'&&game.rideTrain)lp.set(game.rideTrain.x,1,game.rideTrain.z); else lp.set(bc.x,0,bc.z);
  const want=night>(lightsOn?.03:.07);
  if(want!==lightsOn){lightsOn=want;for(const L of lightPool){L.visible=want;L.intensity=0;L.userData.src=null;L.userData.out=false;}}
  if(lightsOn&&lightPick<=0){
    lightPick=.3;
    const best=[];
    for(const arr of lightMap.values())for(const s of arr){
      const d=(s.x-lp.x)**2+(s.z-lp.z)**2+((s.y-lp.y)**2)*.3;
      if(best.length<LIGHT_N){best.push([d,s]);best.sort((a,b)=>a[0]-b[0]);}
      else if(d<best[LIGHT_N-1][0]){best[LIGHT_N-1]=[d,s];best.sort((a,b)=>a[0]-b[0]);}
    }
    const keep=new Set(best.map(b=>b[1]));
    for(const L of lightPool){const sr=L.userData.src;if(sr&&!keep.has(sr))L.userData.out=true;if(sr&&keep.has(sr))L.userData.out=false;}
    const used=new Set(lightPool.map(L=>L.userData.src).filter(Boolean));
    for(const b of best){const sr=b[1];if(used.has(sr))continue;
      const L=lightPool.find(L=>!L.userData.src);if(!L)break;
      L.userData.src=sr;L.userData.out=false;L.intensity=0;L.position.set(sr.x,sr.y,sr.z);L.color.setHex(sr.c);L.distance=sr.d;used.add(sr);}
  }
  if(lightsOn)for(const L of lightPool){const sr=L.userData.src;if(!sr){L.intensity=0;continue;}
    let f=1;if(sr.f)f=.8+.18*Math.sin(lightTime*13+sr.x)+.12*Math.sin(lightTime*29+sr.z);
    const tg=L.userData.out?0:sr.i*night*f;L.intensity+=(tg-L.intensity)*Math.min(1,dt*(sr.f?14:5));
    if(L.userData.out&&L.intensity<.02){L.intensity=0;L.userData.src=null;L.userData.out=false;}}
  if(game.mode==='drive'&&night>.05){
    const c=game.driveCar,fx=Math.sin(c.h),fz=Math.cos(c.h);
    headSpot.position.set(c.x+fx*1.1,.75,c.z+fz*1.1); headSpot.target.position.set(c.x+fx*14,0,c.z+fz*14);
    headSpot.intensity=2.4*night; headSpot.visible=true;
  } else {headSpot.intensity=0; headSpot.visible=false;}
  for(const fl of flames.values())for(const m of fl){const s=m.userData.flame===1?1:.9;m.scale.set(s*(1+.12*Math.sin(lightTime*17+m.id)),s*(1+.22*Math.sin(lightTime*11+m.id*2)),s*(1+.12*Math.cos(lightTime*15)));}
  glowFire.opacity=.3+night*.55+.08*Math.sin(lightTime*12);
}
function updateGarages(dt){
  for(const g of garages.values()){
    let near=false;
    for(const c of cars){if((c.x-g.x)**2+(c.z-g.z)**2<(c===game.driveCar?42:6)){near=true;break;}}
    if(!near&&game.mode==='walk'&&(pl.x-g.x)**2+(pl.z-g.z)**2<12)near=true;
    const tgt=near?1:0; if(Math.abs(tgt-g.open)<.001)continue;
    g.open+=(tgt-g.open)*Math.min(1,dt*3.5);
    const dh=g.door.userData.door,sc=Math.max(.04,1-g.open*.96);
    g.door.scale.y=sc; g.door.position.y=dh-dh*sc/2;
  }
}

export { lightTime, updateGarages, updateLights };
