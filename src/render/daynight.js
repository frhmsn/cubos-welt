// Tag und Nacht: Sonnenstand, Himmelsfarben, Licht.
import { game } from '../core/state.js';
import { $, clamp } from '../core/util.js';
import { fill, hemi, moon, moonBall, renderer, scene, stars, sun, sunBall } from './renderer.js';
import { glowWarm, nightMats } from './materials.js';
import { bc } from './build-camera.js';

// ---------- Tag und Nacht ----------
game.dayT = .36; game.dayTarget = null; let wasDay=null; const DAY_LEN=300;
const cNight=new THREE.Color(0x0d1838),cDay=new THREE.Color(0x8fd3ff),cDusk=new THREE.Color(0xf29a6b),sky=new THREE.Color();
const hDay=new THREE.Color(0xdff2ff),hNight=new THREE.Color(0x4a5a9a);
const ICON_SUN='<svg viewBox="0 0 24 24" fill="none" stroke="#E8A400" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.6" fill="#FFC21A"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
const ICON_MOON='<svg viewBox="0 0 24 24" fill="#5B6CC9" stroke="#3E4C9E" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
const _sd=new THREE.Vector3(),_sr=new THREE.Vector3(),_su=new THREE.Vector3(),_sf=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function updateDay(dt,focus){
  if(game.dayTarget!==null){const diff=(game.dayTarget-game.dayT+1)%1,step=dt*.3;if(diff<=step){game.dayT=game.dayTarget;game.dayTarget=null;}else game.dayT=(game.dayT+step)%1;}
  else game.dayT=(game.dayT+dt/DAY_LEN)%1;
  const ang=Math.round((game.dayT-.25)*Math.PI*2/.006)*.006,elev=Math.sin(ang);
  const sd=_sd.set(Math.cos(ang),elev,.35).normalize();
  const x=clamp((elev+.12)/.34,0,1),dayF=x*x*(3-2*x),night=1-dayF;
  sky.copy(cNight).lerp(cDay,dayF); const dusk=Math.max(0,1-Math.abs(elev-.03)/.2); sky.lerp(cDusk,dusk*.55);
  renderer.setClearColor(sky); scene.fog.color.copy(sky);
  sun.intensity=.92*dayF; sun.visible=dayF>.02;
  const sh=game.mode==='build'?clamp(bc.d*.9,30,110):34;
  if(Math.abs(sh-sun.shadow.camera.right)>2){const c=sun.shadow.camera;c.left=c.bottom=-sh;c.right=c.top=sh;c.far=Math.max(220,sh*3);c.updateProjectionMatrix();}
  const tx=2*sun.shadow.camera.right/sun.shadow.mapSize.x;
  _sr.crossVectors(sd,_up);if(_sr.lengthSq()<1e-6)_sr.set(1,0,0);_sr.normalize();_su.crossVectors(_sr,sd).normalize();
  const a=Math.round(focus.dot(_sr)/tx)*tx,b=Math.round(focus.dot(_su)/tx)*tx,cc=focus.dot(sd);
  _sf.copy(_sr).multiplyScalar(a).addScaledVector(_su,b).addScaledVector(sd,cc);
  sun.position.copy(_sf).addScaledVector(sd,70); sun.target.position.copy(_sf);
  moon.intensity=.34*night; moon.position.copy(focus).addScaledVector(sd,-70); moon.target.position.copy(focus);
  moon.visible=night>.03;
  hemi.intensity=.32+.28*dayF; hemi.color.copy(hNight).lerp(hDay,dayF); fill.intensity=.12-.06*dayF;
  for(const n of nightMats)n.m.emissiveIntensity=n.base+n.k*night;
  stars.material.opacity=night*.9; stars.position.copy(focus);
  sunBall.position.copy(focus).addScaledVector(sd,320); sunBall.visible=elev>-.15;
  moonBall.position.copy(focus).addScaledVector(sd,-320); moonBall.visible=elev<.15;
  const isDay=dayF>.5; if(isDay!==wasDay){wasDay=isDay;$('#btnTime').innerHTML=isDay?ICON_SUN:ICON_MOON;}
  glowWarm.opacity=night*.6; updateDay.lastNight=night;
  const fogBase=game.mode==='build'?bc.d:30; scene.fog.near=fogBase+60; scene.fog.far=fogBase+220;
  return night;
}

export { updateDay, wasDay };
