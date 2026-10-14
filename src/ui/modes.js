// Modus-Wechsel (Bauen, Laufen, Fahren, Mitfahren), Hinweise, Knöpfe oben rechts.
import './station-panel.js'; // Ladereihenfolge: läuft nach ui/station-panel.js (siehe docs/ARCHITEKTUR.md)
import { game, pl } from '../core/state.js';
import { $ } from '../core/util.js';
import { DIRS, I, center, inb, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { buildCam, walkCam } from '../render/renderer.js';
import { AQ_R } from '../content/models/buildings.js';
import { resolve } from '../core/collision.js';
import { initAI } from '../systems/traffic.js';
import { canStand, onDeck } from '../systems/ferries.js';
import { ac, honk, nopeSnd, plop, tone, whistle } from '../systems/audio.js';
import { wasDay } from '../render/daynight.js';
import { bc } from '../render/build-camera.js';
import { ptrs } from './build-input.js';
import { camFree, nearestVehicle } from '../systems/player.js';
import { showStation } from './station-panel.js';
import { fishes } from '../content/fish.js';
import { fishing, stopFishing } from '../systems/fishing.js';
import { forceSurface, updDiveBtn } from '../systems/underwater.js';
import { editCam } from '../systems/editor.js';
import { hint } from './hint.js';
import { freeAt, groundM, isWater, tiles } from '../core/world-data.js';
import { saveSoon } from '../core/autosave.js';
import { emit } from '../core/events.js';

// ---------- UI ----------
const ICON_WALK='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.8" r="2.2" fill="#FFC21A"/><path d="M12 8.2v6m0 0-3.5 6.3M12 14.2l3.5 6.3M6.8 11.2 12 9l5.2 2.2"/></svg>';
const ICON_BUILD='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.1" stroke-linejoin="round"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" fill="#BFE6A8"/><path d="M9 4v13.5M15 6.5V20"/></svg>';
function setMode(m){
  game.mode=m;
  $('#top').hidden=m==='edit'; $('#editTop').hidden=m!=='edit'; $('#editTray').hidden=m!=='edit';
  $('#inv').hidden=m!=='build'; $('#btnRot').hidden=m!=='build';
  const moving=m==='walk'||m==='drive'||m==='ride',ctl=m==='walk'||m==='drive';
  $('#pad').hidden=!ctl; $('#joy').hidden=!ctl; $('#walkBtns').hidden=!moving;
  $('#btnEnter').hidden=true; $('#btnSail').hidden=true; $('#btnFish').hidden=true; $('#btnDive').hidden=true; if(fishing)stopFishing();
  if(m!=='drive'&&game.driveCar)forceSurface(game.driveCar);
  $('#btnHonk').hidden=!(m==='drive'||m==='ride'); $('#honkTxt').textContent=m==='ride'?'Pfeifen':'Hupen';
  $('#btnExit').hidden=m!=='drive'; $('#btnExit').classList.remove('hot');
  game.stState='x';showStation('');
  $('#btnView').innerHTML=m==='build'?ICON_WALK:ICON_BUILD;
  game.cam=m==='build'?buildCam:m==='edit'?editCam:walkCam;
  ptrs.clear(); game.gest=null;
  emit('modus',{mode:m});
}
function startWalk(){
  pl.x=bc.x; pl.z=bc.z; pl.yaw=bc.yaw; pl.pitch=-.05;
  let st=tileAt(bc.x,bc.z),to=st&&tiles[I(st.i,st.j)].o;
  if(to&&to.t==='teil'){const s0=to.s|0;st={i:st.i-(Math.floor(s0/3)-1),j:st.j-(s0%3-1)};to=inb(st.i,st.j)?tiles[I(st.i,st.j)].o:null;}
  if(to&&to.t==='aquarium'){const c=center(st.i,st.j),f=DIRS[to.r];pl.x=c.x+f[0]*(AQ_R+1.2);pl.z=c.z+f[1]*(AQ_R+1.2);pl.yaw=Math.atan2(f[0],f[1]);}
  else if(to&&(ITEMS[to.t].house||to.t==='berg')){
    const c=center(st.i,st.j); let d=to.r;
    if(!freeAt(st.i+DIRS[d][0],st.j+DIRS[d][1]))for(let k=0;k<4;k++)if(freeAt(st.i+DIRS[k][0],st.j+DIRS[k][1])){d=k;break;}
    const f=DIRS[d]; pl.x=c.x+f[0]*2.9; pl.z=c.z+f[1]*2.9; pl.yaw=Math.atan2(f[0],f[1]);
  }
  const p={x:pl.x,z:pl.z}; for(let k=0;k<4;k++)resolve(p,.32); pl.x=p.x; pl.z=p.z;
  setMode('walk'); hint('Links: laufen. Rechts: umschauen. Geh durch die Tür ins Haus!');
}
function enterCar(car){
  game.driveCar=car; car.mode='player'; car.v=0;
  {const f=camFree(car,6);walkCam.position.set(car.x-Math.sin(car.h)*f,Math.min(3.3,1.2+f*.33),car.z-Math.cos(car.h)*f);}
  setMode('drive'); honk(car.type);
  if(ITEMS[car.type].sub){car.diving=false;car.dive=0;updDiveBtn(car);$('#btnDive').hidden=false;hint('Tippe auf Abtauchen und fahr unter Wasser zu den Fischen!',4000);}
  else if(ITEMS[car.type].boat){$('#btnFish').hidden=false;hint(fishes.length?'Fahr zu den Schatten im Wasser. Das sind Fische! Dann tippe auf Angeln.':'Fische gibt es im Meer. Mal mit dem Feld „Meer" ein großes Meer.',4500);}
  else hint('Links lenken und Gas geben. Brumm!');
  emit('eingestiegen',{type:car.type});
}
function exitCar(toBuild){
  const car=game.driveCar; if(!car)return;
  if(ITEMS[car.type].sub&&car.diving&&!toBuild){nopeSnd();hint('Erst auftauchen, dann aussteigen.',2500);return;}
  if(ITEMS[car.type].sub)forceSurface(car);
  if(ITEMS[car.type].boat&&!toBuild){
    let spot=null;for(const r of[1.8,2.4,3,3.6])for(let a=0;a<16&&!spot;a++){const x=car.x+Math.cos(a/16*6.283)*r,z=car.z+Math.sin(a/16*6.283)*r;const t=tileAt(x,z);if(t&&!isWater(t.i,t.j)&&canStand(x,z)&&!resolve({x,z},.32))spot={x,z};}
    if(!spot){nopeSnd();hint('Fahr ans Ufer, dann kannst du aussteigen.',2800);return;}
    game.driveCar=null;pl.x=spot.x;pl.z=spot.z;pl.yaw=Math.atan2(car.x-spot.x,car.z-spot.z)+Math.PI;pl.pitch=-.05;
    car.v=0;car.mode='park';saveSoon();setMode('walk');return;
  }
  game.driveCar=null;
  const rx=-Math.cos(car.h),rz=Math.sin(car.h);
  pl.x=car.x+rx*1.9; pl.z=car.z+rz*1.9; pl.yaw=car.h+Math.PI; pl.pitch=-.05;
  const p={x:pl.x,z:pl.z}; for(let k=0;k<4;k++)resolve(p,.32); pl.x=p.x; pl.z=p.z;
  car.v=0; initAI(car); saveSoon();
  if(toBuild){bc.x=car.x;bc.z=car.z;setMode('build');}else setMode('walk');
}
function startRide(tr){
  game.rideTrain=tr; const c0=tr.cars[0],q=c0.g.position,fx=Math.sin(c0.th),fz=Math.cos(c0.th);
  walkCam.position.set(q.x-fx*7+Math.cos(c0.th)*3.4,4.4,q.z-fz*7-Math.sin(c0.th)*3.4); walkCam.lookAt(q.x+fx*4,1.1,q.z+fz*4);
  tr.go=true; tr.wait=Math.min(tr.wait,1.2);
  setMode('ride'); whistle(tr.type); hint('Du fährst mit! Am nächsten Bahnhof kannst du aussteigen.',3500);
  emit('mitfahren',{type:tr.type});
}
function exitTrain(toBuild){
  const tr=game.rideTrain; if(!tr)return;
  if(toBuild){game.rideTrain=null;bc.x=tr.x;bc.z=tr.z;bc.d=Math.min(bc.d,40);setMode('build');return;}
  if(!(tr.state==='halt'&&tr.atStation&&tr.stopK!=null)){nopeSnd();hint('Aussteigen geht, wenn der Zug am Bahnhof hält.',2500);return;}
  const k=tr.stopK,gm=groundM[k],c=center(k%game.N,Math.floor(k/game.N)),sd=(gm&&gm.userData.side)||[1.5,0];
  pl.x=c.x+sd[0];pl.z=c.z+sd[1];pl.yaw=Math.atan2(sd[0],sd[1]);pl.pitch=-.05;
  game.rideTrain=null; tr.go=true; tr.wait=2.5; setMode('walk'); hint('Tschüss Zug!',1800);
}
function updateRide(dt){
  const tr=game.rideTrain;if(!tr)return;
  const c0=tr.cars[0],q=c0.g.position,fx=Math.sin(c0.th),fz=Math.cos(c0.th),k=1-Math.exp(-dt*3);
  const rx=Math.cos(c0.th),rz=-Math.sin(c0.th);
  walkCam.position.x+=(q.x-fx*7+rx*3.4-walkCam.position.x)*k; walkCam.position.z+=(q.z-fz*7+rz*3.4-walkCam.position.z)*k; walkCam.position.y+=(4.4-walkCam.position.y)*k;
  walkCam.lookAt(q.x+fx*4,1.1,q.z+fz*4);
}
$('#btnView').addEventListener('click',()=>{
  ac(); plop();
  if(game.mode==='build')startWalk();
  else if(game.mode==='drive')exitCar(true);
  else if(game.mode==='ride')exitTrain(true);
  else{bc.x=pl.x;bc.z=pl.z;bc.yaw=bc.yawT=pl.yaw;bc.d=Math.min(bc.d,36);setMode('build');}
});
$('#btnTime').addEventListener('click',()=>{ac();tone(wasDay?300:600,.2,'sine',.1,0,wasDay?.6:1.6);game.dayTarget=wasDay?.0:.3;emit('tageszeit',{nacht:wasDay});});
$('#btnRot').addEventListener('click',()=>{ac();plop();bc.yawT+=Math.PI/4;});
$('#btnEnter').addEventListener('click',()=>{const v=nearestVehicle();if(!v)return;if(v.train)startRide(v.train);else enterCar(v.car);});
$('#btnExit').addEventListener('click',()=>{if(game.mode==='ride')exitTrain(false);else exitCar(false);});
$('#btnHonk').addEventListener('click',()=>{if(game.mode==='ride'&&game.rideTrain)whistle(game.rideTrain.type);else if(game.driveCar)honk(game.driveCar.type);emit('hupen',{mode:game.mode});});
$('#btnSail').addEventListener('click',()=>{ac();const f=game.mode==='drive'&&game.driveCar?onDeck(game.driveCar.x,game.driveCar.z):onDeck(pl.x,pl.z);if(f&&f.state==='dock'){f.wait=0;tone(130,.7,'sawtooth',.05);}});

export { enterCar, exitCar, exitTrain, setMode, startRide, startWalk, updateRide };
