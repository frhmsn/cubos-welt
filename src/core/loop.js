// Spielschleife: jedes Bild alle Systeme aktualisieren und zeichnen, Leistung anpassen.
import '../systems/editor.js'; // Ladereihenfolge: dieses Modul läuft nach systems/editor.js
import { game } from './state.js';
import { $ } from './util.js';
import { buildCam, dprMax, renderer, scene, walkCam } from '../render/renderer.js';
import { nightMats, polBlue, polRed, seaTex, waterMat } from '../render/materials.js';
import { portalMat } from '../content/models/rail.js';
import { animals, cars, ferries, pops } from './world.js';
import { updateCarAI } from '../systems/traffic.js';
import { updateCrossings, updateTrains } from '../systems/trains.js';
import { updateFerry } from '../systems/ferries.js';
import { updateAnimal } from '../systems/animals.js';
import { updateDay } from '../render/daynight.js';
import { updateGarages, updateLights } from '../render/lights.js';
import { bc, placeBuildCam } from '../render/build-camera.js';
import { pl, updateDrive, updateWalk } from '../systems/player.js';
import { updateStationUI } from '../ui/station-panel.js';
import { updateRide } from '../ui/modes.js';
import { updateFish } from '../systems/fish.js';
import { updateWhales } from '../systems/whales.js';
import { updateFishing } from '../systems/fishing.js';
import { destroyUnderwater, subUnder, uHemi, uSun, underScene } from '../systems/underwater.js';
import { updateAquaUI, updateAquariums } from '../systems/aquarium.js';
import { saveWorld } from '../ui/worlds-menu.js';
import { save } from './save.js';
import { editCam, editScene, placeEditCam } from '../systems/editor.js';

// ---------- Schleife ----------
function resize(){
  const w=window.innerWidth,h=window.innerHeight; renderer.setSize(w,h,false);
  buildCam.aspect=walkCam.aspect=editCam.aspect=w/h; buildCam.updateProjectionMatrix(); walkCam.updateProjectionMatrix(); editCam.updateProjectionMatrix();
}
window.addEventListener('resize',resize);
const perf={acc:0,n:0,cool:3000,raised:false};
const focus=new THREE.Vector3(); let last=performance.now(),blink=0,autoSave=0,slotSave=0;
function frame(now){
  const raw=now-last,dt=Math.min(.05,raw/1000); last=now;
  if(raw>0&&raw<250){perf.acc+=raw;perf.n++;}
  perf.cool-=raw;
  if(perf.n>=50){const avg=perf.acc/perf.n;perf.acc=perf.n=0;
    if(perf.cool<=0&&game.mode!=='edit'){
      if(avg>23&&game.dpr>1){if(perf.raised)game.dprLock=true;game.dpr=Math.max(1,+(game.dpr-.25).toFixed(2));perf.raised=false;renderer.setPixelRatio(game.dpr);resize();perf.cool=2500;}
      else if(avg<18&&game.dpr<dprMax&&!game.dprLock){game.dpr=Math.min(dprMax,+(game.dpr+.25).toFixed(2));perf.raised=true;renderer.setPixelRatio(game.dpr);resize();perf.cool=5000;}
      else perf.raised=false;
    }}
  if(game.mode==='build'||game.mode==='edit')placeBuildCam(); else if(!game.traveling){if(game.mode==='walk')updateWalk(dt); else if(game.mode==='drive')updateDrive(dt);}
  if(game.mode==='build'||game.mode==='edit')focus.set(bc.x,0,bc.z); else if(game.mode==='walk')focus.set(pl.x,0,pl.z); else if(game.mode==='drive'&&game.driveCar)focus.set(game.driveCar.x,0,game.driveCar.z); else if(game.mode==='ride'&&game.rideTrain)focus.set(game.rideTrain.x,0,game.rideTrain.z);
  const night=updateDay(dt,focus);
  updateLights(dt,night); updateGarages(dt);
  if(!game.traveling){
    updateTrains(dt);
    for(const f of ferries.slice())updateFerry(f,dt);
    updateFish(dt); updateWhales(dt); updateFishing(dt);
    for(const c of cars)if(c.mode==='ai')updateCarAI(c,dt);
    for(const a of animals)updateAnimal(a,dt);
  }
  updateCrossings(dt);
  if(game.mode==='ride')updateRide(dt);
  updateStationUI(); updateAquaUI(); updateAquariums(dt);
  portalMat.color.setHSL((now*.00008)%1,.8,.7); portalMat.opacity=.55+.2*Math.sin(now*.003);
  blink+=dt; const on=Math.floor(blink*3)%2===0; polBlue.emissiveIntensity=on?2:.1; polRed.emissiveIntensity=on?.1:2;
  for(let k=pops.length-1;k>=0;k--){const p=pops[k];p.t+=dt*4;const t=Math.min(p.t,1),s=1+2.2*Math.pow(t-1,3)+1.2*Math.pow(t-1,2);p.g.scale.setScalar(Math.max(.05,s));if(t>=1){p.g.scale.setScalar(1);pops.splice(k,1);}if(!p.g.matrixAutoUpdate)p.g.updateMatrix();}
  waterMat.color.setHSL(.56,.72,.55+Math.sin(now*.0012)*.03);
  seaTex.offset.set((now*.00002)%1,(now*.000012)%1);
  autoSave+=dt; if(autoSave>8){autoSave=0;save();}
  slotSave+=dt; if(slotSave>60){slotSave=0;if(game.worldDirty&&game.curWorld&&game.mode!=='edit')saveWorld(false,true);}
  if(game.mode==='edit'){
    placeEditCam(); renderer.setClearColor(0xbfe6ff);
    for(const n of nightMats)n.m.emissiveIntensity=n.base;
    renderer.render(editScene,editCam);
  } else {
    const uw=subUnder();
    if(uw!==game.wasUnder){game.wasUnder=uw;const fd=$('#fade');fd.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>fd.classList.remove('on')));
      const c=game.driveCar;if(uw&&c.g.parent===scene){scene.remove(c.g);underScene.add(c.g);}else if(!uw&&c&&c.g.parent===underScene){underScene.remove(c.g);scene.add(c.g);}
      if(!uw&&c&&!c.diving)destroyUnderwater();}
    if(uw){const nt=updateDay.lastNight||0;uHemi.intensity=.95-.6*nt;uSun.intensity=.55-.45*nt;renderer.render(underScene,walkCam);}
    else renderer.render(scene,game.cam);
  }
  requestAnimationFrame(frame);
}

export { focus, frame, resize };
