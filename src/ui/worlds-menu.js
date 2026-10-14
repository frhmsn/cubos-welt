// Menü Meine Welten: speichern, öffnen, löschen, Codes kopieren und einfügen.
import '../core/world-codes.js'; // Ladereihenfolge: dieses Modul läuft nach core/world-codes.js
import { game } from '../core/state.js';
import { $ } from '../core/util.js';
import { buildCam, renderer, scene } from '../render/renderer.js';
import { ac, nopeSnd, plop, tone } from '../systems/audio.js';
import { bc, placeBuildCam } from '../render/build-camera.js';
import { exitCar, hint, setMode } from './modes.js';
import { CKEY, localStore, store } from '../core/storage.js';
import { fangData, mergeFang } from '../systems/fishing.js';
import { decodeWorld, encodeWorld } from '../core/world-codes.js';
import { applyData, emptyWorld, save, serialize } from '../core/save.js';
import { sampleWorld } from '../content/sample-world.js';

let codeMode='export';
$('#mExportAll').addEventListener('click',async()=>{
  ac();codeMode='export';$('#codeBox').hidden=false;$('#codeInfo').textContent='Code wird erstellt …';$('#codeTxt').value='';$('#codeGo').textContent='Kopieren';
  let l=[];try{l=await store.list();}catch(e){}
  l.sort((a,b)=>(a.updated||0)-(b.updated||0));
  const worlds=l.map(w=>({name:w.name,data:w.id===game.curWorld?JSON.stringify(serialize()):w.data})).filter(w=>w.data);
  if(game.curWorld==null||!l.some(w=>w.id===game.curWorld))worlds.push({name:'Mitgebrachte Welt',data:JSON.stringify(serialize())});
  const code=await encodeWorld({v:2,worlds,fang:fangData()});
  $('#codeTxt').value=code;$('#codeInfo').textContent=worlds.length+(worlds.length===1?' Welt':' Welten')+' plus Fangbuch und Aquarium als ein Code. Kopiere ihn und füge ihn in der anderen Version mit „Code einfügen" ein.';
});
$('#mExport').addEventListener('click',async()=>{
  ac();codeMode='export';$('#codeBox').hidden=false;$('#codeInfo').textContent='Code wird erstellt …';$('#codeTxt').value='';$('#codeGo').textContent='Kopieren';
  let name='Mitgebrachte Welt';try{const l=await store.list();const w=l.find(x=>x.id===game.curWorld);if(w)name=w.name;}catch(e){}
  const code=await encodeWorld({v:1,name,data:JSON.stringify(serialize()),fang:fangData()});
  $('#codeTxt').value=code;$('#codeInfo').textContent='Das ist „'+name+'" als Code. Kopiere ihn und füge ihn in der anderen Version mit „Welt-Code einfügen" ein.';
});
$('#mImport').addEventListener('click',()=>{ac();codeMode='import';$('#codeBox').hidden=false;$('#codeInfo').textContent='Füge hier einen Code ein. Welten, Fangbuch und Aquarium werden übernommen. Was schon da ist, wird nicht doppelt gespeichert.';$('#codeTxt').value='';$('#codeGo').textContent='Laden';setTimeout(()=>$('#codeTxt').focus(),50);});
$('#codeClose').addEventListener('click',()=>{$('#codeBox').hidden=true;});
$('#codeGo').addEventListener('click',async()=>{
  const ta=$('#codeTxt');
  if(codeMode==='export'){
    const v=ta.value;if(!v)return;
    const sel=()=>{ta.focus();ta.select();ta.setSelectionRange(0,v.length);};
    try{navigator.clipboard.writeText(v).then(()=>hint('Code kopiert!',2000),()=>{sel();hint('Markiere den Text und kopiere ihn.',3000);});}catch(e){sel();hint('Markiere den Text und kopiere ihn.',3000);}
    return;
  }
  let obj=null;try{obj=await decodeWorld(ta.value);}catch(e){$('#codeInfo').textContent=e&&e.message==='gzip'?'Dieser Code braucht ein neueres iOS. Bitte iPadOS aktualisieren.':'Das ist kein gültiger Welt-Code. Prüfe, ob er vollständig kopiert wurde.';nopeSnd();return;}
  const list=Array.isArray(obj.worlds)?obj.worlds:[{name:obj.name,data:obj.data}];
  const ok=list.filter(x=>{try{const d=JSON.parse(x.data);return d&&Array.isArray(d.tiles);}catch(e){return false;}});
  const fangNew=mergeFang(obj.fang);
  if(!ok.length){if(fangNew){$('#codeBox').hidden=true;hint('Fangbuch übernommen!',2500);return;}$('#codeInfo').textContent='Der Code enthält keine Welt.';nopeSnd();return;}
  let have=[];try{have=await store.list();}catch(e){}
  const tk=data=>{try{return JSON.stringify(JSON.parse(data).tiles);}catch(e){return data;}};
  const known=new Set(have.map(w=>tk(w.data)));
  let last=null,added=0,t=Date.now();
  for(const x of ok){
    const key=tk(x.data);if(known.has(key))continue;
    const w={id:newId(),name:String(x.name||'Welt').slice(0,30),updated:t++,thumb:'',data:x.data};
    try{await store.put(w);}catch(e){$('#codeInfo').textContent='Speichern hat nicht geklappt.';return;}
    known.add(key);last=w;added++;
  }
  $('#codeBox').hidden=true;
  if(last){await openWorld(last);await saveWorld(false,true);}
  if(ok.length>1||!last)hint((added?added+(added===1?' Welt':' Welten')+' übernommen':'Alle Welten waren schon da')+(fangNew?', Fangbuch auch!':'.'),3500);
  if(typeof renderWorlds==='function')try{renderWorlds();}catch(e){}
});

function snapThumb(){
  try{
    placeBuildCam(); renderer.render(scene,buildCam);
    const src=renderer.domElement,c=document.createElement('canvas');c.width=240;c.height=150;
    const sw=src.width,sh=src.height,ar=240/150;let w=sw,h=sw/ar;if(h>sh){h=sh;w=sh*ar;}
    c.getContext('2d').drawImage(src,(sw-w)/2,(sh-h)/2,w,h,0,0,240,150);
    return c.toDataURL('image/jpeg',.72);
  }catch(e){return '';}
}
function newId(){return 'w_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
async function saveWorld(asNew,silent){
  if(game.saving)return null; game.saving=true;
  try{
    let list=[]; try{list=await store.list();}catch(e){list=[];}
    const existing=(!asNew&&game.curWorld)?list.find(w=>w.id===game.curWorld):null;
    let id,name;
    if(existing){id=existing.id;name=existing.name;}
    else{id=newId();const names=new Set(list.map(w=>w.name));let n=list.length+1;while(names.has('Welt '+n))n++;name='Welt '+n;}
    const w={id,name,updated:Date.now(),thumb:snapThumb(),data:JSON.stringify(serialize())};
    try{await store.put(w);}catch(e){if(store!==localStore){await localStore.put(w);}else throw e;}
    game.curWorld=id; try{localStorage.setItem(CKEY,id);}catch(e){}
    game.worldDirty=false;
    if(!silent){hint('Gespeichert: '+name,2500);tone(523,.1,'sine',.1);tone(784,.16,'sine',.1,.1);}
    return w;
  }catch(e){
    if(!silent)hint('Speichern hat nicht geklappt. Vielleicht ist der Speicher voll: lösche eine alte Welt im Menü.',5000);
    return null;
  }finally{game.saving=false;}
}
async function keepCurrent(){if(game.worldDirty)await saveWorld(false,true);}
function toBuild(){if(game.driveCar)exitCar(true);game.rideTrain=null;if(game.mode!=='build')setMode('build');}
async function openWorld(w){
  await keepCurrent(); toBuild();
  let d=null; try{d=JSON.parse(w.data);}catch(e){d=null;}
  if(!d||!applyData(d)){hint('Diese Welt konnte nicht geladen werden.',3500);return;}
  game.curWorld=w.id; try{localStorage.setItem(CKEY,w.id);}catch(e){}
  game.worldDirty=false; bc.x=0;bc.z=3;bc.d=48; save();
  $('#menu').hidden=true; plop(); hint('Willkommen in '+w.name+'!',2500);
}
async function freshWorld(kind){
  await keepCurrent(); toBuild();
  if(kind==='sample')sampleWorld();else emptyWorld();
  game.curWorld=null; try{localStorage.removeItem(CKEY);}catch(e){}
  game.worldDirty=false; save(); $('#menu').hidden=true; plop();
  hint('Neue Welt! Mit der Wolke oben speicherst du sie.',3500);
}
const fmtDate=t=>{try{const d=new Date(t);return d.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+', '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' Uhr';}catch(e){return '';}};
const ICO_PEN='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>';
const ICO_BIN='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>';
async function renderWorlds(){
  $('#mStore').textContent=store.kind==='db'?'Deine Welten liegen in deinem Claude-Konto. So siehst du sie auf iPhone und iPad.':'Deine Welten liegen nur auf diesem Gerät.';
  let list=[]; try{list=await store.list();}catch(e){list=[];}
  list.sort((a,b)=>(b.updated||0)-(a.updated||0)); game.worldCache=list;
  const el=$('#worlds'); el.innerHTML='';
  if(!list.length){const p=document.createElement('p');p.className='empty';p.textContent='Noch keine Welt gespeichert. Tippe auf „Als neue Welt speichern".';el.appendChild(p);return;}
  for(const w of list){
    const card=document.createElement('div'); card.className='wc'+(w.id===game.curWorld?' cur':'');
    const shot=document.createElement('button'); shot.className='shot'; shot.setAttribute('aria-label',(w.name||'Welt')+' laden');
    if(w.thumb){const im=document.createElement('img');im.alt='';im.src=w.thumb;shot.appendChild(im);}
    if(w.id===game.curWorld){const tg=document.createElement('span');tg.className='tag';tg.textContent='GERADE OFFEN';shot.appendChild(tg);}
    shot.addEventListener('click',()=>{if(w.id===game.curWorld){$('#menu').hidden=true;return;}openWorld(w);});
    const foot=document.createElement('div'); foot.className='foot';
    const nm=document.createElement('div'); nm.className='nm';
    const b=document.createElement('b'); b.textContent=w.name||'Welt'; const sm=document.createElement('small'); sm.textContent=fmtDate(w.updated);
    nm.append(b,sm);
    const pen=document.createElement('button'); pen.className='ib'; pen.innerHTML=ICO_PEN; pen.setAttribute('aria-label','Umbenennen');
    const bin=document.createElement('button'); bin.className='ib'; bin.innerHTML=ICO_BIN; bin.setAttribute('aria-label','Löschen');
    pen.addEventListener('click',()=>{
      nm.innerHTML=''; const inp=document.createElement('input'); inp.id='rn_'+w.id; inp.value=w.name||''; inp.maxLength=30; nm.appendChild(inp); inp.focus(); inp.select();
      let done=false; const finish=async()=>{if(done)return;done=true;const v=inp.value.trim()||w.name;if(v!==w.name){try{await store.put(Object.assign({},w,{name:v}));}catch(e){}}renderWorlds();};
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();}); inp.addEventListener('blur',finish);
    });
    bin.addEventListener('click',()=>{
      card.innerHTML=''; const ask=document.createElement('div'); ask.className='ask';
      const q=document.createElement('p'); q.textContent='„'+(w.name||'Welt')+'" für immer löschen?';
      const yes=document.createElement('button'); yes.className='mb warn'; yes.textContent='Ja, löschen';
      const no=document.createElement('button'); no.className='mb'; no.textContent='Nein';
      yes.addEventListener('click',async()=>{try{await store.del(w.id);}catch(e){}if(game.curWorld===w.id){game.curWorld=null;try{localStorage.removeItem(CKEY);}catch(e){}game.worldDirty=true;}renderWorlds();});
      no.addEventListener('click',renderWorlds);
      ask.append(q,yes,no); card.appendChild(ask);
    });
    foot.append(nm,pen,bin); card.append(shot,foot); el.appendChild(card);
  }
}
$('#btnMenu').addEventListener('click',()=>{ac();$('#menu').hidden=false;renderWorlds();});
$('#mClose').addEventListener('click',()=>{$('#menu').hidden=true;});
$('#menu').addEventListener('click',e=>{if(e.target.id==='menu')$('#menu').hidden=true;});
$('#mSaveNew').addEventListener('click',async()=>{ac();const w=await saveWorld(true,false);if(w)renderWorlds();});
$('#mSample').addEventListener('click',()=>freshWorld('sample'));
$('#mEmpty').addEventListener('click',()=>freshWorld('empty'));
$('#btnSave').addEventListener('click',()=>{ac();saveWorld(false,false);});

export { renderWorlds, saveWorld };
