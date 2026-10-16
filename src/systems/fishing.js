// Angeln: Rute, Schnur, Biss, Fang, Fangbuch und Rekorde.
import './fish.js'; // Ladereihenfolge: läuft nach systems/fish.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { $ } from '../core/util.js';
import { tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { G, disposeGroup, mesh } from '../render/materials.js';
import { ac, nopeSnd, plop, tone } from './audio.js';
import { FISH, fishModel, fishes, pickFish } from '../content/fish.js';
import { addFish, anyWater, fishOk, okF, removeFish, splash } from './fish.js';
import { thumbs } from '../ui/inventory.js';
import { FISH_BY_ID } from '../content/fish/index.js';
import { hint } from '../ui/hint.js';
import { gAt, isWater } from '../core/world-data.js';
import { catchBook, fmtLen, recordCatch } from './catch-book.js';
import { speak } from './speech.js';
import { putInBucket } from './rucksack.js';

let fishing=null;
const fishLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:12},()=>new THREE.Vector3())),new THREE.LineBasicMaterial({color:0x222222}));
fishLine.visible=false;fishLine.frustumCulled=false;scene.add(fishLine);
const bobber=(()=>{const g=new THREE.Group();mesh(G('bob1',()=>new THREE.SphereGeometry(.13,10,8,0,Math.PI*2,0,Math.PI/2)),'#E8343C',0,0,0,g,false);const b=mesh(G('bob2',()=>new THREE.SphereGeometry(.13,10,8,0,Math.PI*2,Math.PI/2,Math.PI/2)),'#FFFFFF',0,0,0,g,false);mesh(G('bobst',()=>new THREE.CylinderGeometry(.02,.02,.25,5)),'#E8343C',0,.2,0,g,false);g.visible=false;scene.add(g);return g;})();
const isBoat=()=>game.mode==='drive'&&game.driveCar&&ITEMS[game.driveCar.type].boat;
function rodTip(){const c=game.driveCar,fx=Math.sin(c.h),fz=Math.cos(c.h),rx=Math.cos(c.h),rz=-Math.sin(c.h);return new THREE.Vector3(c.x+rx*.45+fx*1.25,1.75,c.z+rz*.45+fz*1.25);}
function startFishing(){
  if(!isBoat())return;const c=game.driveCar;c.v=0;
  let x=c.x+Math.sin(c.h)*4.2,z=c.z+Math.cos(c.h)*4.2;
  if(!isWater(...(t=>t?[t.i,t.j]:[-1,-1])(tileAt(x,z)))){x=c.x+Math.sin(c.h)*2.6;z=c.z+Math.cos(c.h)*2.6;}
  fishing={phase:'cast',t:0,x,z,wait:0,fish:null,biteT:0};
  bobber.visible=true;fishLine.visible=true;tone(700,.25,'sine',.06,0,.4);
  $('#btnFish').classList.remove('hot');fishBtn('Einholen');
}
function stopFishing(msg){fishing=null;bobber.visible=false;fishLine.visible=false;for(const f of fishes)f.hook=false;fishBtn('Angeln');if(msg)hint(msg,2800);}
function fishBtn(txt){$('#fishTxt').textContent=txt;}
function updateFishing(dt){
  if(!fishing)return;
  if(!isBoat()){stopFishing();return;}
  const F=fishing,tip=rodTip();F.t+=dt;
  let by=.04+Math.sin(F.t*3)*.03;
  if(F.phase==='cast'){const k=Math.min(1,F.t/.6);bobber.position.set(tip.x+(F.x-tip.x)*k,tip.y*(1-k)+Math.sin(Math.PI*k)*1.2+by*k,tip.z+(F.z-tip.z)*k);if(k>=1){F.phase='wait';F.t=0;splash(F.x,F.z);}}
  else if(F.phase==='wait'){
    bobber.position.set(F.x,by,F.z);
    if(!F.fish){let best=null,bd=81;for(const f of fishes){if(f.jump||f.flee>0)continue;const d=(f.x-F.x)**2+(f.z-F.z)**2;if(d<bd*1.8&&okF(f,F.x,F.z)){bd=d;best=f;}}
      if(best){F.fish=best;best.hook=true;}
      else{F.wait+=dt;
        if(F.wait>3.5){const tile=tileAt(F.x,F.z),sea=tile&&gAt(tile.i,tile.j)==='meer';
          for(let q=0;q<10;q++){const a=Math.random()*6.283,x=F.x+Math.cos(a)*7,z=F.z+Math.sin(a)*7,type=pickFish(sea);
            if(fishOk(type,x,z)&&fishOk(type,F.x,F.z)){const f=addFish(type,x,z);F.fish=f;f.hook=true;break;}}
          if(!F.fish&&F.wait>8){stopFishing('Hier gibt es keine Fische. Fahr weiter raus aufs Wasser.');return;}}}}
    else if(!fishes.includes(F.fish)){F.fish=null;}
    else if(Math.hypot(F.fish.x-F.x,F.fish.z-F.z)<.45){F.phase='bite';F.t=0;F.biteT=2.2;$('#btnFish').classList.add('hot');fishBtn('Zieh!');tone(1200,.08,'square',.06);tone(1200,.08,'square',.06,.15);navigator.vibrate&&navigator.vibrate(120);}
  }
  else if(F.phase==='bite'){
    bobber.position.set(F.x,-.12+Math.abs(Math.sin(F.t*14))*.1,F.z);F.biteT-=dt;
    if(Math.floor(F.t*2.5)!==Math.floor((F.t-dt)*2.5))splash(F.x,F.z,.45);
    if(F.biteT<=0){const f=F.fish;if(f){f.hook=false;f.flee=3;}F.fish=null;F.phase='wait';F.t=0;F.wait=0;$('#btnFish').classList.remove('hot');fishBtn('Einholen');hint('Zu langsam! Der Fisch ist weggeschwommen.',2500);nopeSnd();}
  }
  else if(F.phase==='reel'){
    const k=Math.min(1,F.t/1.1),m=F.model;
    m.position.set(F.x+(tip.x-F.x)*k,Math.sin(Math.PI*k)*2+.2+(tip.y-.6)*k,F.z+(tip.z-F.z)*k);m.rotation.set(Math.sin(F.t*18)*.4,F.t*3,Math.PI/2);
    bobber.position.copy(m.position);
    if(k>=1){scene.remove(m);disposeGroup(m);showCatch(F.type,F.len);fishing=null;bobber.visible=false;fishLine.visible=false;fishBtn('Angeln');return;}
  }
  const pos=fishLine.geometry.attributes.position,b=bobber.position;
  for(let q=0;q<12;q++){const t=q/11;pos.setXYZ(q,tip.x+(b.x-tip.x)*t,tip.y+(b.y+.1-tip.y)*t-Math.sin(Math.PI*t)*(F.phase==='bite'||F.phase==='reel'?.05:.45),tip.z+(b.z-tip.z)*t);}
  pos.needsUpdate=true;
}
function reelIn(){
  const F=fishing;if(!F)return;
  if(F.phase!=='bite'){stopFishing();return;}
  const f=F.fish;const L=FISH[f.type].len;F.type=f.type;F.len=L[0]+Math.random()*(L[1]-L[0]);
  removeFish(f);F.fish=null;F.phase='reel';F.t=0;$('#btnFish').classList.remove('hot');
  F.model=fishModel(F.type);F.model.scale.setScalar(FISH[F.type].rs);scene.add(F.model);
  splash(F.x,F.z,true);tone(400,.12,'sine',.08,0,2);tone(600,.12,'sine',.08,.12,2);
}
let lastCatch=null;
function showCatch(type,len){
  lastCatch={type,len};const rec=recordCatch(type,len);
  const S=FISH[type];
  $('#catchImg').src=thumbs['F_'+type]||'';$('#catchImg').hidden=!thumbs['F_'+type];
  const big=FISH_BY_ID[type].bigCatch;
  $('#catchTitle').textContent=S.wow?'Wow, ein '+S.label+'!':(big&&len>big.from)?big.title:'Du hast '+(S.art||'einen')+' '+S.label+' gefangen!';
  $('#catchSub').textContent='Er ist '+fmtLen(len)+' lang.'+(rec&&catchBook[type]>1?' Neuer Rekord!':'')+' Auf dem Markt gibt es '+S.taler+' Taler dafür.';
  speak($('#catchTitle').textContent+(rec&&catchBook[type]>1?' Neuer Rekord!':''));
  $('#catchBook').textContent='Dein Fang: '+Object.keys(FISH).filter(k=>catchBook[k]).map(k=>catchBook[k]+' '+(catchBook[k]===1?FISH[k].label:FISH[k].plural)).join(', ');
  $('#catch').hidden=false;
  tone(523,.15,'sine',.09);tone(659,.15,'sine',.09,.15);tone(784,.15,'sine',.09,.3);tone(1047,.35,'sine',.09,.45);
}
$('#catchKeep').addEventListener('click',()=>{ac();$('#catch').hidden=true;plop();if(lastCatch)putInBucket(lastCatch.type);hint('Ab in den Eimer!',1800);});
$('#catchFree').addEventListener('click',()=>{ac();$('#catch').hidden=true;if(lastCatch&&game.driveCar){const c=game.driveCar,x=c.x+Math.sin(c.h)*3,z=c.z+Math.cos(c.h)*3;if(anyWater(x,z)){const f=addFish(lastCatch.type,x,z);f.free=!fishOk(lastCatch.type,x,z);f.flee=2.5;splash(x,z,true);}}hint('Tschüss Fisch!',1800);});
$('#btnFish').addEventListener('click',()=>{ac();if(!fishing)startFishing();else reelIn();});
export { fishing, stopFishing, updateFishing };
