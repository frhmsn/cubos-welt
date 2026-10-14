// Inventar: Kategorien, Gegenstände, Vorschaubilder.
import '../core/worlds.js'; // Ladereihenfolge: läuft nach core/worlds.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { $ } from '../core/util.js';
import { CATS, ITEMS } from '../content/catalog.js';
import { disposeGroup } from '../render/materials.js';
import { groundModel } from '../content/models/rail.js';
import { MODELS } from '../content/models/buildings.js';
import { carModel } from '../content/models/vehicles.js';
import { animalModel } from '../content/models/animals.js';
import { BLOCKS, TEMPLATE, VI, VX, VY, meshVoxels } from '../content/models/blocks.js';
import { expandWorld } from '../core/world.js';
import { trainCarModel } from '../systems/trains.js';
import { ferryModel } from '../systems/ferries.js';
import { ac, plop, tone } from '../systems/audio.js';
import { FISH, fishModel } from '../content/fish.js';
import { WHALE, whaleModel } from '../content/whales.js';
import { on } from '../core/events.js';
import { hint } from './hint.js';
import { catchBook, catchRec, fmtLen, whaleBook } from '../systems/catch-book.js';
import { isUnlocked } from '../systems/quests.js';

let thumbs={};
function select(id){
  if(ITEMS[id]&&ITEMS[id].kind==='action'){if(id==='groesser')expandWorld();return;}
  game.sel=id; document.querySelectorAll('#inv .it').forEach(b=>b.classList.toggle('on',b.dataset.id===id));
  if(id==='hand')hint('Ziehen zum Schieben. Zwei Finger zoomen und drehen.',3000);
  if(id==='eigen')hint('Tippe auf ein freies Feld oder ein eigenes Haus. Dann geht die Bauwerkstatt auf.',4000);
}
document.querySelectorAll('#tools .it').forEach(b=>b.addEventListener('click',()=>{ac();plop();select(b.dataset.id);}));
function renderCats(){
  const el=$('#cats'); el.innerHTML='';
  for(const c of CATS){
    const b=document.createElement('button'); b.className='cat'+(c.id===game.curCat?' on':'');
    b.innerHTML=(thumbs[c.icon]?`<img alt="" src="${thumbs[c.icon]}">`:'<span class="ph"></span>')+`<span>${c.label}</span>`;
    b.addEventListener('click',()=>{ac();tone(560,.07,'sine',.1,0,1.4);game.curCat=c.id;renderCats();renderItems();});
    el.appendChild(b);
  }
}
function renderItems(){
  const el=$('#items'); el.innerHTML='';
  const cat=CATS.find(c=>c.id===game.curCat);
  if(cat.special==='fang'){
    for(const ft of Object.keys(FISH)){
      const n=catchBook[ft]||0,rec=catchRec[ft],b=document.createElement('button');b.className='it fang'+(n?'':' none');
      b.innerHTML=`<span class="ball">${thumbs['F_'+ft]?`<img alt="" src="${thumbs['F_'+ft]}">`:''}${n?`<span class="cnt">${n}</span>`:''}</span><span>${n?FISH[ft].label:'???'}</span><small>${n&&rec?'Rekord '+fmtLen(rec):'noch keiner'}</small>`;
      b.addEventListener('click',()=>{ac();plop();hint(n?`${n} ${n===1?FISH[ft].label:FISH[ft].plural} gefangen. Der größte war ${fmtLen(rec||0)} lang.`:(FISH[ft].plural+' gibt es '+FISH[ft].where+'.')+(n?'':' Fahr mit dem Fischerboot raus und angle!'),3500);});
      el.appendChild(b);
    }
    for(const wt of Object.keys(WHALE)){
      const n=whaleBook[wt]||0,b=document.createElement('button');b.className='it fang'+(n?'':' none');
      b.innerHTML=`<span class="ball">${thumbs['W_'+wt]?`<img alt="" src="${thumbs['W_'+wt]}">`:''}${n?`<span class="cnt">${n}</span>`:''}</span><span>${n?WHALE[wt].label:'???'}</span><small>${n?'gesehen':'noch nicht gesehen'}</small>`;
      b.addEventListener('click',()=>{ac();plop();hint(n?`${n} ${n===1?WHALE[wt].label:WHALE[wt].plural} gesehen. Wale kann man nicht angeln, nur bestaunen!`:'Wale leben im großen Meer. Mal ein riesiges Meer und halte Ausschau nach der Fontäne!',3800);});
      el.appendChild(b);
    }
    const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0),info=document.createElement('div');info.className='fangsum';
    info.innerHTML=`<b>${tot}</b><span>Fische<br>gefangen</span>`;el.appendChild(info);
    return;
  }
  for(const id of cat.items){
    if(ITEMS[id].bonus&&!isUnlocked(ITEMS[id].bonus))continue; // Bonus erst nach geschafftem Kapitel
    const b=document.createElement('button'); b.className='it'+(game.sel===id?' on':''); b.dataset.id=id;
    b.innerHTML=`<span class="ball">${thumbs[id]?`<img alt="" src="${thumbs[id]}">`:(ITEMS[id].icon||'')}</span><span>${ITEMS[id].label}</span>`;
    b.addEventListener('click',()=>{ac();if(ITEMS[id].kind!=='action')plop();select(id);});
    el.appendChild(b);
  }
}
function makeThumbs(){
  let R;
  try{R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(e){return;}
  R.setPixelRatio(1); R.setSize(160,160);
  const S=new THREE.Scene(); S.add(new THREE.HemisphereLight(0xffffff,0x8aa877,.8));
  const L=new THREE.DirectionalLight(0xffffff,.75); L.position.set(3,6,5); S.add(L);
  const C=new THREE.PerspectiveCamera(30,1,.1,300);
  const dir=new THREE.Vector3(1,.8,1.3).normalize();
  for(const id of Object.keys(ITEMS)){
    const it=ITEMS[id]; let obj=null;
    const TC={strasse:{dirs:[1,3]},schiene:{rail:[1,3]},bahnhof:{rail:[1,3],side:0},uebergang:{rail:[0,2],dirs:[1,3]},tunnel:{rail:[0]},anleger:{land:0},seetor:{water:1}};
    if(it.kind==='ground')obj=groundModel(id,Object.assign({alt:true,dirs:[],rail:[]},TC[id]||{}));
    else if(it.kind==='train')obj=trainCarModel(id,'front');
    else if(it.kind==='ferry')obj=ferryModel();
    else if(it.kind==='obj')obj=MODELS[id](id==='baum'||id==='tanne'?11:7,{b:TEMPLATE}).g;
    else if(it.kind==='car')obj=carModel(id);
    else if(it.kind==='animal')obj=animalModel(id);
    if(!obj)continue;
    S.add(obj); obj.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(obj),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
    const rad=sz.length()/2; C.position.copy(ct).addScaledVector(dir,rad/Math.sin(15*Math.PI/180)*.92); C.lookAt(ct);
    R.render(S,C); thumbs[id]=R.domElement.toDataURL('image/png'); S.remove(obj);
  }
  for(const bl of BLOCKS){
    const v=new Array(VX*VX*VY).fill('.');
    if(bl.c==='d'){for(let y=0;y<5;y++)for(let x=0;x<4;x++)v[VI(x,y,0)]=(y<4&&(x===1||x===2))?'d':'p';}
    else v[VI(0,0,0)]=bl.c;
    const obj=meshVoxels(v.join('')); S.add(obj); obj.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(obj),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
    C.position.copy(ct).addScaledVector(dir,sz.length()/2/Math.sin(15*Math.PI/180)*.95); C.lookAt(ct);
    R.render(S,C); thumbs['B_'+bl.c]=R.domElement.toDataURL('image/png'); S.remove(obj);
    obj.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
  }
  for(const ft of Object.keys(FISH)){
    const obj=fishModel(ft);thumbs['fx_'+ft]=null;obj.rotation.y=Math.PI/2;S.add(obj);obj.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(obj),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
    C.position.copy(ct).addScaledVector(new THREE.Vector3(.25,.35,1).normalize(),sz.length()/2/Math.sin(15*Math.PI/180)*.9);C.lookAt(ct);
    R.render(S,C);thumbs['F_'+ft]=thumbs['fx_'+ft]=R.domElement.toDataURL('image/png');S.remove(obj);
  }
  for(const wt of Object.keys(WHALE)){
    const obj=whaleModel(wt);obj.rotation.y=Math.PI/2;S.add(obj);obj.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(obj),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
    C.position.copy(ct).addScaledVector(new THREE.Vector3(.25,.35,1).normalize(),sz.length()/2/Math.sin(15*Math.PI/180)*.9);C.lookAt(ct);
    R.render(S,C);thumbs['W_'+wt]=R.domElement.toDataURL('image/png');S.remove(obj);disposeGroup(obj);
  }
  R.dispose(); try{R.forceContextLoss();}catch(e){}
}

// Fangbuch-Ansicht aktuell halten
const refreshFang=()=>{if(game.curCat==='fang')renderItems();};
on('fang:geaendert',refreshFang);
on('wal:gesehen',refreshFang);
on('kapitel:geschafft',()=>renderItems());
on('aufgaben:geladen',()=>renderItems());

export { makeThumbs, renderCats, renderItems, select, thumbs };
