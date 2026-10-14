// Menü Meine Welten: speichern, öffnen, löschen, Codes kopieren und einfügen.
import { game } from '../core/state.js';
import { $ } from '../core/util.js';
import { ac, nopeSnd } from '../systems/audio.js';
import { CKEY, store } from '../core/storage.js';
import { decodeWorld, encodeWorld } from '../core/world-codes.js';
import { serialize } from '../core/save.js';
import { hint } from './hint.js';
import { fangData, mergeFang } from '../systems/catch-book.js';
import { freshWorld, newId, openWorld, saveWorld } from '../core/worlds.js';
import { setSpeech, speak, speechAvailable, speechOn } from '../systems/speech.js';

let codeMode='export';
$('#mExportAll').addEventListener('click',async()=>{
  ac();codeMode='export';$('#codeBox').hidden=false;$('#codeInfo').textContent='Code wird erstellt …';$('#codeTxt').value='';$('#codeGo').textContent='Kopieren';
  let l=[];try{l=await store.list();}catch(e){}
  l.sort((a,b)=>(a.updated||0)-(b.updated||0));
  const worlds=l.map(w=>({name:w.name,data:w.id===game.curWorld?JSON.stringify(serialize()):w.data})).filter(w=>w.data);
  if(game.curWorld==null||!l.some(w=>w.id===game.curWorld))worlds.push({name:'Mitgebrachte Welt',data:JSON.stringify(serialize())});
  const code=await encodeWorld({v:2,worlds,fang:fangData()});
  $('#codeTxt').value=code;$('#codeInfo').textContent=worlds.length+(worlds.length===1?' Welt':' Welten')+' plus Fangbuch und Aquarium als ein Code. Kopiere ihn und füge ihn auf dem anderen Gerät mit „Code einfügen" ein.';
});
$('#mExport').addEventListener('click',async()=>{
  ac();codeMode='export';$('#codeBox').hidden=false;$('#codeInfo').textContent='Code wird erstellt …';$('#codeTxt').value='';$('#codeGo').textContent='Kopieren';
  let name='Mitgebrachte Welt';try{const l=await store.list();const w=l.find(x=>x.id===game.curWorld);if(w)name=w.name;}catch(e){}
  const code=await encodeWorld({v:1,name,data:JSON.stringify(serialize()),fang:fangData()});
  $('#codeTxt').value=code;$('#codeInfo').textContent='Das ist „'+name+'" als Code. Kopiere ihn und füge ihn auf dem anderen Gerät mit „Code einfügen" ein.';
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

const fmtDate=t=>{try{const d=new Date(t);return d.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+', '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' Uhr';}catch(e){return '';}};
const ICO_PEN='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>';
const ICO_BIN='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>';
async function renderWorlds(){
  $('#mStore').textContent='Deine Welten liegen auf diesem Gerät. Mit „Alle Welten kopieren“ nimmst du sie mit.';
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

// ---------- Einstellungen ----------
const updSpeechBtn=()=>{$('#mSpeech').textContent='Vorlesen: '+(speechOn()?'an':'aus');$('#mSpeech').hidden=!speechAvailable();};
updSpeechBtn();
$('#mSpeech').addEventListener('click',()=>{ac();setSpeech(!speechOn());updSpeechBtn();if(speechOn())speak('Ich lese dir jetzt alles vor.');});

export { renderWorlds };
