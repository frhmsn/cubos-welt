import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new):
    global s
    if s.count(old)!=1: print('MISMATCH',s.count(old),repr(old[:80])); sys.exit(1)
    s=s.replace(old,new)
rep("""<div class="mrow"><button class="mb" id="mExport">Welt-Code kopieren</button><button class="mb" id="mImport">Welt-Code einfügen</button></div>""",
"""<div class="mrow"><button class="mb" id="mExport">Welt-Code kopieren</button><button class="mb" id="mExportAll">Alle Welten kopieren</button></div>
    <div class="mrow"><button class="mb" id="mImport">Code einfügen</button></div>""")
rep("""let codeMode='export';""","""let codeMode='export';
function fangData(){return {c:catchBook,r:catchRec,w:whaleBook};}
function mergeFang(f){
  if(!f||typeof f!=='object')return false;let ch=false;
  for(const k of Object.keys(FISH)){const n=+((f.c||{})[k])||0;if(n>(catchBook[k]||0)){catchBook[k]=n;ch=true;}const r=+((f.r||{})[k])||0;if(r>(catchRec[k]||0)){catchRec[k]=r;ch=true;}}
  for(const k of Object.keys(WHALE)){const n=+((f.w||{})[k])||0;if(n>(whaleBook[k]||0)){whaleBook[k]=n;ch=true;}}
  if(ch){try{localStorage.setItem('kunos-fang',JSON.stringify(catchBook));localStorage.setItem('kunos-fang-rekord',JSON.stringify(catchRec));localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}
    refreshAquariums();aqShown=undefined;if(curCat==='fang')renderItems();}
  return ch;
}
$('#mExportAll').addEventListener('click',async()=>{
  ac();codeMode='export';$('#codeBox').hidden=false;$('#codeInfo').textContent='Code wird erstellt …';$('#codeTxt').value='';$('#codeGo').textContent='Kopieren';
  let l=[];try{l=await store.list();}catch(e){}
  l.sort((a,b)=>(a.updated||0)-(b.updated||0));
  const worlds=l.map(w=>({name:w.name,data:w.id===curWorld?JSON.stringify(serialize()):w.data})).filter(w=>w.data);
  if(curWorld==null||!l.some(w=>w.id===curWorld))worlds.push({name:'Mitgebrachte Welt',data:JSON.stringify(serialize())});
  const code=await encodeWorld({v:2,worlds,fang:fangData()});
  $('#codeTxt').value=code;$('#codeInfo').textContent=worlds.length+(worlds.length===1?' Welt':' Welten')+' plus Fangbuch und Aquarium als ein Code. Kopiere ihn und füge ihn in der anderen Version mit „Code einfügen" ein.';
});""")
rep("""  const code=await encodeWorld({v:1,name,data:JSON.stringify(serialize())});""","""  const code=await encodeWorld({v:1,name,data:JSON.stringify(serialize()),fang:fangData()});""")
rep("""$('#codeTxt').value='';$('#codeGo').textContent='Welt laden';""","""$('#codeTxt').value='';$('#codeGo').textContent='Laden';""")
rep("""  let d=null;try{d=JSON.parse(obj.data);}catch(e){}
  if(!d||!Array.isArray(d.tiles)){$('#codeInfo').textContent='Der Code enthält keine Welt.';nopeSnd();return;}
  const w={id:newId(),name:String(obj.name||'Welt').slice(0,30),updated:Date.now(),thumb:'',data:obj.data};
  try{await store.put(w);}catch(e){$('#codeInfo').textContent='Speichern hat nicht geklappt.';return;}
  $('#codeBox').hidden=true;await openWorld(w);await saveWorld(false,true);""","""  const list=Array.isArray(obj.worlds)?obj.worlds:[{name:obj.name,data:obj.data}];
  const ok=list.filter(x=>{try{const d=JSON.parse(x.data);return d&&Array.isArray(d.tiles);}catch(e){return false;}});
  const fangNew=mergeFang(obj.fang);
  if(!ok.length){if(fangNew){$('#codeBox').hidden=true;hint('Fangbuch übernommen!',2500);return;}$('#codeInfo').textContent='Der Code enthält keine Welt.';nopeSnd();return;}
  let have=[];try{have=await store.list();}catch(e){}
  const known=new Set(have.map(w=>w.data));
  let last=null,added=0,t=Date.now();
  for(const x of ok){
    if(known.has(x.data))continue;
    const w={id:newId(),name:String(x.name||'Welt').slice(0,30),updated:t++,thumb:'',data:x.data};
    try{await store.put(w);}catch(e){$('#codeInfo').textContent='Speichern hat nicht geklappt.';return;}
    known.add(x.data);last=w;added++;
  }
  $('#codeBox').hidden=true;
  if(last){await openWorld(last);await saveWorld(false,true);}
  if(ok.length>1||!last)hint((added?added+(added===1?' Welt':' Welten')+' übernommen':'Alle Welten waren schon da')+(fangNew?', Fangbuch auch!':'.'),3500);
  if(typeof renderWorlds==='function')try{renderWorlds();}catch(e){}""")
open(p,'w').write(s);print('ok11')
