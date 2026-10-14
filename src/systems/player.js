// Spielfigur und Fahren: Joystick, Tastatur, Laufen, Fahren, Boote.
import '../ui/build-input.js'; // Ladereihenfolge: läuft nach ui/build-input.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { $, clamp } from '../core/util.js';
import { tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { walkCam } from '../render/renderer.js';
import { cars, gAt } from '../core/world.js';
import { resolve } from '../core/collision.js';
import { pushTrains } from './trains.js';
import { canStand, onDeck } from './ferries.js';
import { ac } from './audio.js';
import { lightTime } from '../render/lights.js';
import { fishing } from './fishing.js';
import { SUB_Y, updateUnderwater } from './underwater.js';

// ---------- Laufen & Fahren ----------
game.mode = 'build'; game.driveCar = null;
const pl={x:0,z:0,yaw:0,pitch:0,bob:0};
const joy={x:0,y:0}; let joyId=null,lookId=null,joyO=null,lookLast=null;
const keys={};
const pad=$('#pad'),joyEl=$('#joy'),knob=$('#knob');
pad.addEventListener('pointerdown',e=>{
  ac(); try{pad.setPointerCapture(e.pointerId);}catch(_){}
  if(e.clientX<window.innerWidth*.5&&joyId===null){joyId=e.pointerId;joyO={x:e.clientX,y:e.clientY};joyEl.classList.remove('rest');joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';}
  else if(lookId===null){lookId=e.pointerId;lookLast={x:e.clientX,y:e.clientY};}
});
pad.addEventListener('pointermove',e=>{
  if(e.pointerId===joyId){let dx=(e.clientX-joyO.x)/55,dy=(e.clientY-joyO.y)/55;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}joy.x=dx;joy.y=dy;knob.style.transform=`translate(${dx*36}px,${dy*36}px)`;}
  else if(e.pointerId===lookId){const dx=e.clientX-lookLast.x,dy=e.clientY-lookLast.y;lookLast={x:e.clientX,y:e.clientY};if(game.mode==='walk'){pl.yaw-=dx*.0055;pl.pitch=clamp(pl.pitch-dy*.0045,-1.2,1.2);}}
});
function padEnd(e){
  if(e.pointerId===joyId){joyId=null;joy.x=joy.y=0;knob.style.transform='';joyEl.style.left='';joyEl.style.top='';joyEl.classList.add('rest');}
  if(e.pointerId===lookId)lookId=null;
}
pad.addEventListener('pointerup',padEnd); pad.addEventListener('pointercancel',padEnd);
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
function input(){
  let x=joy.x,y=joy.y;
  if(keys.w||keys.arrowup)y=-1; if(keys.s||keys.arrowdown)y=1; if(keys.a||keys.arrowleft)x=-1; if(keys.d||keys.arrowright)x=1;
  return{x,y};
}
function nearestCar(){let best=null,bd=3.4;for(const c of cars){const d=Math.hypot(c.x-pl.x,c.z-pl.z);if(d<bd){bd=d;best=c;}}return best;}
function nearestVehicle(){const c=nearestCar();return c?{car:c}:null;}
function updateWalk(dt){
  const ox=pl.x,oz=pl.z,{x,y}=input(),s=Math.sin(pl.yaw),c=Math.cos(pl.yaw),fwd=-y,sp=4.4;
  pl.x+=(-s*fwd+c*x)*sp*dt; pl.z+=(-c*fwd-s*x)*sp*dt;
  const p={x:pl.x,z:pl.z}; resolve(p,.32); resolve(p,.32); pushTrains(p,.32); pl.x=p.x; pl.z=p.z;
  if(!canStand(pl.x,pl.z)&&canStand(ox,oz)){pl.x=ox;pl.z=oz;}
  const deck=onDeck(pl.x,pl.z);
  const moving=Math.hypot(x,y)>.1; pl.bob+=moving?dt*9:0;
  walkCam.position.set(pl.x,1.55+(deck?.31:0)+(moving?Math.sin(pl.bob)*.04:0),pl.z); walkCam.rotation.set(pl.pitch,pl.yaw,0);
  $('#btnEnter').hidden=!nearestVehicle();
  $('#btnSail').hidden=!(deck&&deck.state==='dock');
}
function boatOk(x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return (g==='wasser'||g==='meer'||g==='anleger'||g==='seetor')&&((game.driveCar&&game.driveCar.diving)||!onDeck(x,z));}
function camFree(car,back){let free=1.2;for(let bb=1.6;bb<=back;bb+=.4){if(resolve({x:car.x-Math.sin(car.h)*bb,z:car.z-Math.cos(car.h)*bb},.35))break;free=bb;}return free;}
function updateDrive(dt){
  const car=game.driveCar,spec=ITEMS[car.type],inp=input(),boat=!!spec.boat,x=fishing?0:inp.x,y=fishing?0:inp.y,thr=-y;
  car.v+=thr*9*dt; car.v*=1-(Math.abs(thr)>.1?.25:1.4)*dt; car.v=clamp(car.v,-5,spec.max);
  car.h-=x*dt*2.1*clamp(car.v/4,-1,1);
  const ox=car.x,oz=car.z;
  car.x+=Math.sin(car.h)*car.v*dt; car.z+=Math.cos(car.h)*car.v*dt;
  const p={x:car.x,z:car.z}; if(resolve(p,.85))car.v*=.6; resolve(p,.85); pushTrains(p,.85); car.x=p.x; car.z=p.z;
  const ok=boat?boatOk:canStand;
  if(!ok(car.x,car.z)&&ok(ox,oz)){car.x=ox;car.z=oz;car.v=0;}
  const deck=boat?null:onDeck(car.x,car.z);
  if(spec.sub){
    car.dive=clamp((car.dive||0)+(car.diving?dt:-dt)/1.8,0,1);const e=car.dive*car.dive*(3-2*car.dive);
    car.g.position.set(car.x,-.22+(SUB_Y+.22)*e+(e<.05?Math.sin(lightTime*2.2)*.04:Math.sin(lightTime*1.1)*.06),car.z);
    car.g.rotation.set(car.v*.012*(car.diving?1:0)+(car.diving&&e<.95?.12:0)+(!car.diving&&e>.05?-.12:0),car.h,e<.05?Math.sin(lightTime*1.3)*.03:Math.sin(-x)*.08);
    const props=car.g.userData.props;if(props)for(const pm of props)pm.rotation.z+=dt*(2+Math.abs(car.v)*3);
  }
  else if(boat){car.g.position.set(car.x,Math.sin(lightTime*2.2)*.04,car.z);car.g.rotation.set(Math.sin(lightTime*1.7)*.03,car.h,Math.sin(lightTime*1.3)*.04);}
  else{car.g.position.set(car.x,deck?.31:0,car.z); car.g.rotation.y=car.h;}
  $('#btnFish').hidden=!boat||!!spec.sub; $('#btnDive').hidden=!spec.sub;
  if(spec.sub&&(car.dive||0)>.45){
    const fx=Math.sin(car.h),fz=Math.cos(car.h),k=1-Math.exp(-dt*4),cy=car.g.position.y;
    walkCam.position.x+=(car.x-fx*6.5-walkCam.position.x)*k;walkCam.position.z+=(car.z-fz*6.5-walkCam.position.z)*k;walkCam.position.y+=(Math.min(-.6,cy+1.7)-walkCam.position.y)*k;
    walkCam.lookAt(car.x+fx*3,cy+.2,car.z+fz*3);updateUnderwater(dt,car);return;
  }
  $('#btnSail').hidden=!(deck&&deck.state==='dock');
  const back=car.type==='bus'||car.type==='feuerwehrauto'?8:6.5;
  let tx=car.x,tz=car.z; const k=1-Math.exp(-dt*5);
  const free=camFree(car,back); tx=car.x-Math.sin(car.h)*free; tz=car.z-Math.cos(car.h)*free; const ty=Math.min(3.3,1.2+free*.33);
  walkCam.position.x+=(tx-walkCam.position.x)*k; walkCam.position.z+=(tz-walkCam.position.z)*k; walkCam.position.y+=(ty-walkCam.position.y)*k;
  walkCam.lookAt(car.x,1.1,car.z);
}

export { camFree, nearestCar, nearestVehicle, pl, updateDrive, updateWalk };
