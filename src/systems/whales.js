// Wale im Meer: schwimmen, auftauchen, Fontäne, gesehen-Zähler.
import './fish.js'; // Ladereihenfolge: läuft nach systems/fish.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { clamp } from '../core/util.js';
import { center, tileAt } from '../core/grid.js';
import { scene } from '../render/renderer.js';
import { disposeGroup } from '../render/materials.js';
import { gAt, tiles } from '../core/world.js';
import { nearFocus } from './trains.js';
import { angDiff } from './ferries.js';
import { ac } from './audio.js';
import { lightTime } from '../render/lights.js';
import { hint } from '../ui/modes.js';
import { silGeo, silMat } from '../content/fish.js';
import { WHALE, whaleModel } from '../content/whales.js';
import { emit } from '../core/events.js';

let whaleBook={};for(const k of Object.keys(WHALE))whaleBook[k]=0;try{const c=JSON.parse(localStorage.getItem('kunos-wale')||'null');if(c)whaleBook=Object.assign(whaleBook,c);}catch(e){}
const whales=[],spouts=[];
const spoutGeo=new THREE.SphereGeometry(.22,6,5),spoutMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false});
function seaAt(x,z){const t=tileAt(x,z);return !!t&&gAt(t.i,t.j)==='meer';}
function whaleOk(x,z){if(!seaAt(x,z))return false;for(let a=0;a<8;a++){const r=a%2?5.5:4.2;if(!seaAt(x+Math.cos(a*.785)*r,z+Math.sin(a*.785)*r))return false;}return true;}
function addWhale(type,x,z){
  const sil=new THREE.Mesh(silGeo,silMat);sil.scale.set(5*WHALE[type].sc,1,8*WHALE[type].sc);sil.position.set(x,.03,z);scene.add(sil);
  const m=whaleModel(type);m.scale.setScalar(WHALE[type].sc);m.visible=false;scene.add(m);
  const w={type,x,z,h:Math.random()*6.3,tx:x,tz:z,st:'swim',t:0,next:5+Math.random()*10,m,sil,y:-3,pitch:0,seen:false,blow:0};whales.push(w);return w;
}
function removeWhale(w){const k=whales.indexOf(w);if(k<0)return;scene.remove(w.sil);scene.remove(w.m);disposeGroup(w.m);whales.splice(k,1);}
function blowSound(){const a=ac();if(!a)return;const len=a.sampleRate*1.1,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(let q=0;q<len;q++){const t=q/len;d[q]=(Math.random()*2-1)*Math.min(1,t*12)*(1-t)**2;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=buf;f.type='bandpass';f.frequency.value=900;f.Q.value=.6;g.gain.value=.35;s.connect(f).connect(g).connect(a.destination);s.start();}
function spout(w){
  const sc=WHALE[w.type].sc,hx=w.x+Math.sin(w.h)*2*sc,hz=w.z+Math.cos(w.h)*2*sc;
  for(let q=0;q<16&&spouts.length<60;q++){const m=new THREE.Mesh(spoutGeo,spoutMat.clone());m.position.set(hx,.8,hz);scene.add(m);
    spouts.push({m,vx:(Math.random()-.5)*1.2,vy:5+Math.random()*3,vz:(Math.random()-.5)*1.2,t:0});}
  if(nearFocus(w.x,w.z,40)){blowSound();
    if(!w.seen){w.seen=true;whaleBook[w.type]++;try{localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}
      emit('wal:gesehen',{type:w.type});hint('Ein '+WHALE[w.type].label+'! Pffffff! Schau, wie er pustet.',3500);}}
}
function whaleTarget(w){for(let q=0;q<12;q++){const a=Math.random()*6.283,r=8+Math.random()*16,nx=w.x+Math.cos(a)*r,nz=w.z+Math.sin(a)*r;if(whaleOk(nx,nz)){w.tx=nx;w.tz=nz;return;}}w.tx=w.x;w.tz=w.z;}
let whaleCheck=0;
function updateWhales(dt){
  whaleCheck-=dt;
  if(whaleCheck<=0){whaleCheck=4;
    const sea=[];for(let k=0;k<game.N*game.N;k++)if(tiles[k].g==='meer')sea.push(k);
    const want=Math.min(3,Math.floor(sea.length/30));
    if(whales.length<want){for(let q=0;q<15;q++){const k=sea[Math.floor(Math.random()*sea.length)],c=center(k%game.N,(k/game.N)|0);
      if(whaleOk(c.x,c.z)){const ty=Object.keys(WHALE),has=new Set(whales.map(w=>w.type)),free=ty.filter(t=>!has.has(t));addWhale((free.length?free:ty)[Math.floor(Math.random()*(free.length||ty.length))],c.x,c.z);break;}}}
  }
  for(const w of whales.slice()){
    if(!whaleOk(w.x,w.z)&&!seaAt(w.x,w.z)){removeWhale(w);continue;}
    w.t+=dt;
    const sp=w.st==='swim'?1.1:.7;
    let dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);
    if(d<1)whaleTarget(w),dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);
    if(d>.1){w.h+=clamp(angDiff(Math.atan2(dx,dz),w.h),-.35*dt,.35*dt);
      const nx=w.x+Math.sin(w.h)*sp*dt,nz=w.z+Math.cos(w.h)*sp*dt;if(whaleOk(nx,nz)){w.x=nx;w.z=nz;}else whaleTarget(w);}
    const sc=WHALE[w.type].sc;let yT=-3,pT=0;
    if(w.st==='swim'){if(w.t>w.next){w.st='up';w.t=0;}}
    else if(w.st==='up'){yT=-.62*sc;pT=-.05;
      if(w.blow<1&&w.t>1.6){w.blow=1;spout(w);} if(w.blow<2&&w.t>4){w.blow=2;spout(w);}
      if(w.t>6){w.st='down';w.t=0;}}
    else if(w.st==='down'){const k=Math.min(1,w.t/3);pT=.75*Math.sin(Math.PI*Math.min(1,k*1.1));yT=-.62*sc-k*3;
      if(w.t>3.4){w.st='swim';w.t=0;w.blow=0;w.next=10+Math.random()*14;}}
    const ease=Math.min(1,dt*(w.st==='up'?2.2:1.2));w.y+=(yT-w.y)*(w.st==='down'?Math.min(1,dt*3):ease);w.pitch+=(pT-w.pitch)*Math.min(1,dt*2.5);
    const vis=w.y>-2.6&&nearFocus(w.x,w.z,70);
    w.m.visible=vis;if(vis){w.m.position.set(w.x,w.y,w.z);w.m.rotation.set(w.pitch,w.h,0,'YXZ');}
    w.sil.visible=!vis||w.y<-1.6;w.sil.position.set(w.x,.03,w.z);w.sil.rotation.y=w.h+Math.sin(lightTime*.8+w.x)*.04;
  }
  for(let k=spouts.length-1;k>=0;k--){const p=spouts[k];p.t+=dt;p.vy-=7*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;
    const s=1+p.t*2.2;p.m.scale.setScalar(s);p.m.material.opacity=Math.max(0,.8-p.t*.55);
    if(p.t>1.5||p.m.position.y<0){scene.remove(p.m);p.m.material.dispose();spouts.splice(k,1);}}
}

export { removeWhale, updateWhales, whaleBook, whales };
