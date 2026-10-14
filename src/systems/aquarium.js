// Aquarium: gefangene Fische schwimmen im runden Becken, Panel beim Betreten.
import './underwater.js'; // Ladereihenfolge: läuft nach systems/underwater.js (siehe docs/ARCHITEKTUR.md)
import { game, pl } from '../core/state.js';
import { $ } from '../core/util.js';
import { scene } from '../render/renderer.js';
import { disposeGroup } from '../render/materials.js';
import { AQ_R } from '../content/models/buildings.js';
import { ac, plop, tone } from './audio.js';
import { FISH, fishModel } from '../content/fish.js';
import { thumbs } from '../ui/inventory.js';
import { on } from '../core/events.js';
import { aquariums } from '../core/world-data.js';
import { nearFocus } from '../core/focus.js';
import { catchBook } from './catch-book.js';

// ---------- Aquarium-Becken ----------
function clearAquarium(aq){for(const f of aq.fish){scene.remove(f.m);disposeGroup(f.m);}aq.fish=[];}
function fillAquarium(aq){
  clearAquarium(aq);
  const kinds=Object.keys(FISH).filter(k=>catchBook[k]>0),per=Math.max(2,Math.min(6,Math.floor(42/Math.max(1,kinds.length))));
  const list=[];for(const k of kinds)for(let q=0;q<Math.min(catchBook[k],per);q++)list.push(k);
  list.slice(0,42).forEach(type=>{
    const m=fishModel(type);m.scale.setScalar(FISH[type].aq*1.45);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});scene.add(m);
    const ly=1.1+Math.random()*2.5;
    aq.fish.push({m,type,th:Math.random()*6.283,rr:.7+Math.random()*1.5,tr:0,ly,ty:ly,dir:Math.random()<.5?-1:1,sp:FISH[type].speed*.45+.25,ph:Math.random()*6,t:0});
  });
  aq.fish.forEach(f=>f.tr=f.rr);
}
function refreshAquariums(){for(const aq of aquariums.values())fillAquarium(aq);}
function updateAquariums(dt){
  for(const aq of aquariums.values()){
    if(!nearFocus(aq.x,aq.z,50))continue;
    for(const f of aq.fish){
      f.t-=dt;if(f.t<=0){f.t=3+Math.random()*6;f.tr=.6+Math.random()*1.6;f.ty=1.1+Math.random()*2.5;if(Math.random()<.15)f.dir*=-1;}
      f.rr+=(f.tr-f.rr)*Math.min(1,dt*.5);f.ly+=(f.ty-f.ly)*Math.min(1,dt*.6);f.ph+=dt*6;
      f.th+=f.dir*f.sp/f.rr*dt;
      const h=Math.atan2(f.dir*Math.cos(f.th),-f.dir*Math.sin(f.th));
      f.m.position.set(aq.x+Math.sin(f.th)*f.rr,f.ly+Math.sin(f.ph*.4)*.05,aq.z+Math.cos(f.th)*f.rr);f.m.rotation.set(0,h+Math.sin(f.ph)*.15,0);
    }
  }
}
function insideAquarium(){
  if(game.mode!=='walk')return null;
  for(const aq of aquariums.values()){if(Math.hypot(pl.x-aq.x,pl.z-aq.z)<AQ_R-.3)return aq;}
  return null;
}
let aqShown=null, aqTimer=0;
$('#aqPanel').addEventListener('click',()=>{ac();const P=$('#aqPanel');clearTimeout(aqTimer);
  if(P.classList.contains('mini')){P.classList.remove('mini');plop();aqTimer=setTimeout(()=>P.classList.add('mini'),6000);}else{P.classList.add('mini');}});
function updateAquaUI(){
  const aq=insideAquarium(),P=$('#aqPanel');
  if(aq===aqShown)return;aqShown=aq;
  clearTimeout(aqTimer);
  if(!aq){P.hidden=true;return;}
  const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0);
  $('#aqMini').textContent=tot?tot+(tot===1?' Fisch':' Fische'):'Leer';
  P.classList.remove('mini');aqTimer=setTimeout(()=>P.classList.add('mini'),4500);
  $('#aqSub').textContent=tot?'Hier schwimmen die Fische, die du gefangen hast:':'Das Becken ist noch leer. Fahr mit dem Fischerboot raus und fang Fische!';
  const L=$('#aqList');L.innerHTML='';
  for(const k of Object.keys(FISH)){const n=catchBook[k]||0;if(!n)continue;
    const d=document.createElement('div');d.className='aqF';d.innerHTML=`${thumbs['F_'+k]?`<img alt="" src="${thumbs['F_'+k]}">`:''}<span><b>${n}</b> ${n===1?FISH[k].label:FISH[k].plural}</span>`;L.appendChild(d);}
  P.hidden=false;tone(660,.12,'sine',.06);tone(880,.16,'sine',.06,.1);
}

// Neuer Fang oder eingefügter Code: Becken neu füllen, Panel beim nächsten Bild neu aufbauen
on('fang:geaendert',()=>{refreshAquariums();aqShown=undefined;});

export { clearAquarium, fillAquarium, refreshAquariums, updateAquaUI, updateAquariums };
