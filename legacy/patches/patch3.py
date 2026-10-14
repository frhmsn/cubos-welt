import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ---------- Laufen / Fahren ----------
rep("""function nearestCar(){let best=null,bd=3.4;for(const c of cars){const d=Math.hypot(c.x-pl.x,c.z-pl.z);if(d<bd){bd=d;best=c;}}return best;}
function updateWalk(dt){
  const {x,y}=input(),s=Math.sin(pl.yaw),c=Math.cos(pl.yaw),fwd=-y,sp=4.4;
  pl.x+=(-s*fwd+c*x)*sp*dt; pl.z+=(-c*fwd-s*x)*sp*dt;
  const p={x:pl.x,z:pl.z}; resolve(p,.32); resolve(p,.32); pl.x=p.x; pl.z=p.z;
  const moving=Math.hypot(x,y)>.1; pl.bob+=moving?dt*9:0;
  walkCam.position.set(pl.x,1.55+(moving?Math.sin(pl.bob)*.04:0),pl.z); walkCam.rotation.set(pl.pitch,pl.yaw,0);
  $('#btnEnter').hidden=!nearestCar();
}""",
"""function nearestCar(){let best=null,bd=3.4;for(const c of cars){const d=Math.hypot(c.x-pl.x,c.z-pl.z);if(d<bd){bd=d;best=c;}}return best;}
function nearestVehicle(){
  const c=nearestCar();if(c)return{car:c};
  for(const tr of trains){if(tr.state!=='halt'||!tr.atStation)continue;for(const cc of tr.cars){const q=cc.g.position;if(Math.hypot(q.x-pl.x,q.z-pl.z)<3.8)return{train:tr};}}
  return null;
}
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
}""")
rep("""  car.x+=Math.sin(car.h)*car.v*dt; car.z+=Math.cos(car.h)*car.v*dt;
  const p={x:car.x,z:car.z}; if(resolve(p,.85))car.v*=.6; resolve(p,.85); car.x=p.x; car.z=p.z;
  car.g.position.set(car.x,0,car.z); car.g.rotation.y=car.h;""",
"""  const ox=car.x,oz=car.z;
  car.x+=Math.sin(car.h)*car.v*dt; car.z+=Math.cos(car.h)*car.v*dt;
  const p={x:car.x,z:car.z}; if(resolve(p,.85))car.v*=.6; resolve(p,.85); pushTrains(p,.85); car.x=p.x; car.z=p.z;
  if(!canStand(car.x,car.z)&&canStand(ox,oz)){car.x=ox;car.z=oz;car.v=0;}
  const deck=onDeck(car.x,car.z);
  car.g.position.set(car.x,deck?.31:0,car.z); car.g.rotation.y=car.h;
  $('#btnSail').hidden=!(deck&&deck.state==='dock');""")

# ---------- Modi ----------
rep("""  const moving=m==='walk'||m==='drive';
  $('#pad').hidden=!moving; $('#joy').hidden=!moving; $('#walkBtns').hidden=!moving;
  $('#btnEnter').hidden=true; $('#btnHonk').hidden=m!=='drive'; $('#btnExit').hidden=m!=='drive';""",
"""  const moving=m==='walk'||m==='drive'||m==='ride',ctl=m==='walk'||m==='drive';
  $('#pad').hidden=!ctl; $('#joy').hidden=!ctl; $('#walkBtns').hidden=!moving;
  $('#btnEnter').hidden=true; $('#btnSail').hidden=true;
  $('#btnHonk').hidden=!(m==='drive'||m==='ride'); $('#honkTxt').textContent=m==='ride'?'Pfeifen':'Hupen';
  $('#btnExit').hidden=!(m==='drive'||m==='ride'); $('#btnExit').classList.remove('hot');""")
rep("""$('#btnView').addEventListener('click',()=>{
  ac(); plop();
  if(mode==='build')startWalk();
  else if(mode==='drive')exitCar(true);""",
"""function startRide(tr){
  rideTrain=tr; const c0=tr.cars[0],q=c0.g.position,fx=Math.sin(c0.th),fz=Math.cos(c0.th);
  walkCam.position.set(q.x-fx*8,4,q.z-fz*8); walkCam.lookAt(q.x+fx*5,1.2,q.z+fz*5);
  setMode('ride'); whistle(tr.type); hint('Du fährst mit! Aussteigen kannst du, wenn der Zug am Bahnhof hält.',4000);
}
function exitTrain(toBuild){
  const tr=rideTrain; if(!tr)return;
  if(toBuild){rideTrain=null;bc.x=tr.x;bc.z=tr.z;bc.d=Math.min(bc.d,40);setMode('build');return;}
  if(!(tr.state==='halt'&&tr.atStation&&tr.stopK!=null)){nopeSnd();hint('Aussteigen geht, wenn der Zug am Bahnhof hält.',2500);return;}
  const k=tr.stopK,gm=groundM[k],c=center(k%N,Math.floor(k/N)),sd=(gm&&gm.userData.side)||[1.5,0];
  pl.x=c.x+sd[0];pl.z=c.z+sd[1];pl.yaw=Math.atan2(sd[0],sd[1]);pl.pitch=-.05;
  rideTrain=null; tr.wait=Math.max(tr.wait,2.5); setMode('walk'); hint('Tschüss Zug!',1800);
}
function updateRide(dt){
  const tr=rideTrain;if(!tr)return;
  const c0=tr.cars[0],q=c0.g.position,fx=Math.sin(c0.th),fz=Math.cos(c0.th),k=1-Math.exp(-dt*3);
  walkCam.position.x+=(q.x-fx*8-walkCam.position.x)*k; walkCam.position.z+=(q.z-fz*8-walkCam.position.z)*k; walkCam.position.y+=(4-walkCam.position.y)*k;
  walkCam.lookAt(q.x+fx*5,1.2,q.z+fz*5);
  $('#btnExit').classList.toggle('hot',tr.state==='halt'&&tr.atStation);
}
$('#btnView').addEventListener('click',()=>{
  ac(); plop();
  if(mode==='build')startWalk();
  else if(mode==='drive')exitCar(true);
  else if(mode==='ride')exitTrain(true);""")
rep("""$('#btnEnter').addEventListener('click',()=>{const c=nearestCar();if(c)enterCar(c);});
$('#btnExit').addEventListener('click',()=>exitCar(false));
$('#btnHonk').addEventListener('click',()=>{if(driveCar)honk(driveCar.type);});""",
"""$('#btnEnter').addEventListener('click',()=>{const v=nearestVehicle();if(!v)return;if(v.train)startRide(v.train);else enterCar(v.car);});
$('#btnExit').addEventListener('click',()=>{if(mode==='ride')exitTrain(false);else exitCar(false);});
$('#btnHonk').addEventListener('click',()=>{if(mode==='ride'&&rideTrain)whistle(rideTrain.type);else if(driveCar)honk(driveCar.type);});
$('#btnSail').addEventListener('click',()=>{ac();const f=mode==='drive'&&driveCar?onDeck(driveCar.x,driveCar.z):onDeck(pl.x,pl.z);if(f&&f.state==='dock'){f.wait=0;tone(130,.7,'sawtooth',.05);}});""")
rep("""function toBuild(){if(driveCar)exitCar(true);if(mode!=='build')setMode('build');}""",
"""function toBuild(){if(driveCar)exitCar(true);rideTrain=null;if(mode!=='build')setMode('build');}""")

# ---------- Reisen + Welt-Codes ----------
TRAVEL=r"""
/* ---------- Weltreise ---------- */
function startTravel(info){
  if(traveling)return; traveling=info;
  tone(392,.2,'sine',.08);tone(523,.2,'sine',.08,.2);tone(659,.35,'sine',.08,.4);
  $('#tvTitle').textContent=info.kind==='train'?'Der Zug fährt in den Tunnel!':'Die Fähre fährt durch das Seetor!';
  $('#tvSub').textContent='In welche Welt soll die Reise gehen?';
  $('#travel').hidden=false; renderTravel();
}
async function renderTravel(){
  let list=[];try{list=await store.list();}catch(e){list=[];}
  list=list.filter(w=>w.id!==curWorld).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const el=$('#tvWorlds');el.innerHTML='';
  if(!list.length){const p=document.createElement('p');p.className='empty';p.style.cssText='grid-column:1/-1;margin:0;padding:14px;border:2px dashed rgba(255,255,255,.4);border-radius:16px;text-align:center;';p.textContent='Es gibt noch keine andere gespeicherte Welt. Fahr in eine neue!';el.appendChild(p);return;}
  for(const w of list){
    const card=document.createElement('div');card.className='wc';
    const shot=document.createElement('button');shot.className='shot';shot.setAttribute('aria-label','Nach '+(w.name||'Welt')+' reisen');
    if(w.thumb){const im=document.createElement('img');im.alt='';im.src=w.thumb;shot.appendChild(im);}
    shot.addEventListener('click',()=>doTravel(w));
    const foot=document.createElement('div');foot.className='foot';const nm=document.createElement('div');nm.className='nm';
    const b=document.createElement('b');b.textContent=w.name||'Welt';nm.appendChild(b);foot.appendChild(nm);
    card.append(shot,foot);el.appendChild(card);
  }
}
function clearTile(i,j){
  const t=tiles[I(i,j)];if(t.o){t.o=null;rebuildObj(i,j);}
  for(const c of cars.slice())if(inTile(c,i,j))removeCar(c);
  for(let k=animals.length-1;k>=0;k--)if(inTile(animals[k],i,j)){scene.remove(animals[k].g);disposeGroup(animals[k].g);animals.splice(k,1);}
}
function ensurePortal(type){
  let found=-1;for(let k=0;k<N*N;k++)if(tiles[k].g===type){found=k;break;}
  const touched=[],set=(i,j,g)=>{if(!inb(i,j))return;clearTile(i,j);tiles[I(i,j)].g=g;touched.push([i,j]);};
  if(found>=0){
    if(type==='tunnel'){const i=found%N,j=(found/N)|0;
      if(![0,1,2,3].some(q=>isRail(i+DIRS[q][0],j+DIRS[q][1]))){
        let best=0,bv=-1e9;for(let q=0;q<4;q++){const v=-(Math.abs(i+DIRS[q][0]*3-N/2)+Math.abs(j+DIRS[q][1]*3-N/2));if(inb(i+DIRS[q][0],j+DIRS[q][1])&&v>bv){bv=v;best=q;}}
        for(let st=1;st<=4;st++)set(i+DIRS[best][0]*st,j+DIRS[best][1]*st,st===3?'bahnhof':'schiene');}}
  } else {
    const m=type==='tunnel'?Math.floor(N/2):N-4;
    if(type==='tunnel'){set(0,m,'tunnel');for(let i=1;i<=5;i++)set(i,m,i===3?'bahnhof':'schiene');}
    else{for(let i=0;i<=3;i++)for(let j=m-1;j<=m+1;j++)set(i,j,'wasser');set(0,m,'seetor');set(3,m,'anleger');if(isWater(4,m)||!inb(4,m))set(4,m,'sand');else touched.push([4,m]);}
    found=I(0,m);
    hint(type==='tunnel'?'Hier gab es noch keinen Tunnel. Ich habe einen gebaut.':'Hier gab es noch kein Seetor. Ich habe einen Hafen gebaut.',4000);
  }
  const done=new Set();
  for(const [i,j] of touched)for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(!inb(a,b)||done.has(a+','+b))continue;done.add(a+','+b);rebuildGround(a,b);}
  return found;
}
async function doTravel(dest){
  const info=traveling;if(!info||info.busy)return;info.busy=true;
  $('#tvSub').textContent='Gute Reise …';$('#tvWorlds').innerHTML='';
  let carType=null;
  if(info.kind==='train'){removeTrain(info.train);rideTrain=null;}
  else if(mode==='drive'&&driveCar){carType=driveCar.type;const c=driveCar;driveCar=null;removeCar(c);}
  setMode('build');
  worldDirty=true;await saveWorld(false,true);
  let name='';
  if(dest==='empty'){emptyWorld();curWorld=null;name='deine neue Welt';}
  else if(dest==='sample'){sampleWorld();curWorld=null;name='die neue Stadt';}
  else{let d=null;try{d=JSON.parse(dest.data);}catch(e){}if(d&&applyData(d)){curWorld=dest.id;name=dest.name;}else{sampleWorld();curWorld=null;name='die neue Stadt';}}
  try{if(curWorld)localStorage.setItem(CKEY,curWorld);else localStorage.removeItem(CKEY);}catch(e){}
  if(info.kind==='train'){
    const k=ensurePortal('tunnel'),i=k%N,j=(k/N)|0;let d=1;for(let q=0;q<4;q++)if(isRail(i+DIRS[q][0],j+DIRS[q][1])){d=q;break;}
    const tr=spawnTrain(info.type,i,j,d,{emerge:true});placeTrainCars(tr);startRide(tr);
  } else {
    const k=ensurePortal('seetor'),gm=groundM[k],w=gm&&gm.userData.water!=null?gm.userData.water:1,dp=dockPose(k);
    const f=spawnFerry(dp.x,dp.z,Math.atan2(DIRS[w][0],DIRS[w][1]));f.wait=4;f.last=k;f.tgt=k;
    if(carType){const c=addCar(carType,f.x,f.z,f.h,false);c.g.position.y=.31;enterCar(c);}
    else{pl.x=f.x;pl.z=f.z;pl.yaw=f.h+Math.PI;pl.pitch=-.05;setMode('walk');}
  }
  bc.x=0;bc.z=3;
  worldDirty=true;save();await saveWorld(false,true);
  $('#travel').hidden=true;traveling=null;
  setTimeout(()=>hint('Willkommen in '+(name||'der neuen Welt')+'!',3500),300);
  tone(523,.15,'sine',.08);tone(659,.15,'sine',.08,.15);tone(784,.3,'sine',.08,.3);
}
function stayHere(){
  const info=traveling;if(!info||info.busy)return;traveling=null;$('#travel').hidden=true;
  if(info.kind==='train')reverseTrain(info.train);else{info.ferry.state='dock';info.ferry.wait=6;}
}
$('#tvNewEmpty').addEventListener('click',()=>doTravel('empty'));
$('#tvNewSample').addEventListener('click',()=>doTravel('sample'));
$('#tvStay').addEventListener('click',stayHere);

/* ---------- Welt-Codes ---------- */
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s);}
function unb64(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
async function encodeWorld(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));
  if(window.CompressionStream){try{const st=new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));return 'KUNOWELT1:'+b64(new Uint8Array(await new Response(st).arrayBuffer()));}catch(e){}}
  return 'KUNOWELT0:'+b64(bytes);
}
async function decodeWorld(code){
  const m=String(code).replace(/\s+/g,'').match(/^KUNOWELT([01]):([A-Za-z0-9+/=]+)$/);if(!m)throw new Error('format');
  let u=unb64(m[2]);
  if(m[1]==='1'){if(!window.DecompressionStream)throw new Error('gzip');const st=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));u=new Uint8Array(await new Response(st).arrayBuffer());}
  return JSON.parse(new TextDecoder().decode(u));
}
let codeMode='export';
$('#mExport').addEventListener('click',async()=>{
  ac();codeMode='export';$('#codeBox').hidden=false;$('#codeInfo').textContent='Code wird erstellt …';$('#codeTxt').value='';$('#codeGo').textContent='Kopieren';
  let name='Welt';try{const l=await store.list();const w=l.find(x=>x.id===curWorld);if(w)name=w.name;}catch(e){}
  const code=await encodeWorld({v:1,name,data:JSON.stringify(serialize())});
  $('#codeTxt').value=code;$('#codeInfo').textContent='Das ist „'+name+'" als Code. Kopiere ihn und füge ihn in der anderen Version mit „Welt-Code einfügen" ein.';
});
$('#mImport').addEventListener('click',()=>{ac();codeMode='import';$('#codeBox').hidden=false;$('#codeInfo').textContent='Füge hier einen Welt-Code ein. Die Welt wird als neue Welt gespeichert.';$('#codeTxt').value='';$('#codeGo').textContent='Welt laden';setTimeout(()=>$('#codeTxt').focus(),50);});
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
  let d=null;try{d=JSON.parse(obj.data);}catch(e){}
  if(!d||!Array.isArray(d.tiles)){$('#codeInfo').textContent='Der Code enthält keine Welt.';nopeSnd();return;}
  const w={id:newId(),name:String(obj.name||'Welt').slice(0,30),updated:Date.now(),thumb:'',data:obj.data};
  try{await store.put(w);}catch(e){$('#codeInfo').textContent='Speichern hat nicht geklappt.';return;}
  $('#codeBox').hidden=true;await openWorld(w);await saveWorld(false,true);
});
"""
rep("""function snapThumb(){""",TRAVEL+"""
function snapThumb(){""")

# fullscreen: hide in standalone, better hint
rep("""  const no=()=>hint('Vollbild ist in diesem Fenster gesperrt. Öffne das Spiel im Safari-Browser, dort klappt es auf dem iPad.',6000);""",
"""  const no=()=>hint('Vollbild ist in der Claude-App gesperrt. Nutze die Web-Version vom Home-Bildschirm, dann läuft das Spiel randlos.',6500);""")
rep("""document.addEventListener('fullscreenchange',updFs);""",
"""if(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||(window.matchMedia&&matchMedia('(display-mode: fullscreen)').matches))$('#btnFull').hidden=true;
document.addEventListener('fullscreenchange',updFs);""")

# ---------- Vorschaubilder ----------
rep("""    if(it.kind==='ground')obj=groundModel(id,{alt:true,dirs:id==='strasse'?[1,3]:[]});""",
"""    const TC={strasse:{dirs:[1,3]},schiene:{rail:[1,3]},bahnhof:{rail:[1,3],side:0},uebergang:{rail:[0,2],dirs:[1,3]},tunnel:{rail:[0]},anleger:{land:0},seetor:{water:1}};
    if(it.kind==='ground')obj=groundModel(id,Object.assign({alt:true,dirs:[],rail:[]},TC[id]||{}));
    else if(it.kind==='train')obj=trainCarModel(id,'front');
    else if(it.kind==='ferry')obj=ferryModel();""")

# ---------- Speichern ----------
rep("""    animals:animals.map(a=>[a.type,+a.x.toFixed(2),+a.z.toFixed(2)])};""",
"""    animals:animals.map(a=>[a.type,+a.x.toFixed(2),+a.z.toFixed(2)]),
    trains:trains.map(t=>[t.type,t.i,t.j,t.dIn]),
    ferries:ferries.map(f=>[+f.x.toFixed(2),+f.z.toFixed(2),+f.h.toFixed(3)])};""")
rep("""  (d.animals||[]).forEach(a=>{if(ITEMS[a[0]]&&ITEMS[a[0]].kind==='animal')addAnimal(a[0],a[1],a[2]);});""",
"""  (d.animals||[]).forEach(a=>{if(ITEMS[a[0]]&&ITEMS[a[0]].kind==='animal')addAnimal(a[0],a[1],a[2]);});
  (d.trains||[]).forEach(t=>{if(!ITEMS[t[0]]||ITEMS[t[0]].kind!=='train'||!isRail(t[1],t[2]))return;let dd=t[3]|0;
    if(!isRail(t[1]+DIRS[dd][0],t[2]+DIRS[dd][1])){const q=[0,1,2,3].find(q=>isRail(t[1]+DIRS[q][0],t[2]+DIRS[q][1]));if(q==null)return;dd=q;}
    spawnTrain(t[0],t[1],t[2],dd);});
  (d.ferries||[]).forEach(f=>{const tl=tileAt(f[0],f[1]);if(tl&&isWater(tl.i,tl.j)){const fe=spawnFerry(f[0],f[1],f[2]);fe.wait=3;}});""")

# ---------- Beispielstadt ----------
rep("""  for(let i=0;i<=2;i++)for(let j=16;j<N;j++)W(i,j,'wasser');
  for(let j=15;j<N;j++)W(3,j,'sand'); for(let i=0;i<3;i++)W(i,15,'sand');""",
"""  for(let i=0;i<=13;i++){W(i,16,'sand');for(let j=17;j<N;j++)W(i,j,'wasser');}
  for(const i of[8,12]){R(i,15);R(i,16);W(i,17,'anleger');}
  W(0,18,'seetor');
  for(let i=3;i<=16;i++)W(i,1,'schiene');
  W(5,1,'bahnhof');W(13,1,'bahnhof');W(17,1,'tunnel');
  R(10,0);W(10,1,'uebergang');R(10,2);R(10,3);""")
rep("""[17,1,'berg'],""","")
rep("""[2,13,'baum'],[5,16,'blumen'],[6,17,'baum'],""","""[2,13,'baum'],""")
rep("""  placeCarOn(7,4,'lambo',1);""",
"""  spawnTrain('zug',8,1,1);
  {const k=I(8,17),dp=dockPose(k),f=spawnFerry(dp.x,dp.z,dp.axis);f.last=k;f.tgt=k;f.wait=8;}
  placeCarOn(7,4,'lambo',1);""")

# ---------- Schleife ----------
rep("""  if(mode==='build'||mode==='edit')placeBuildCam(); else if(mode==='walk')updateWalk(dt); else updateDrive(dt);
  if(mode==='build'||mode==='edit')focus.set(bc.x,0,bc.z); else if(mode==='walk')focus.set(pl.x,0,pl.z); else focus.set(driveCar.x,0,driveCar.z);
  const night=updateDay(dt,focus);
  updateLights(dt,night); updateGarages(dt);
  for(const c of cars)if(c.mode==='ai')updateCarAI(c,dt);
  for(const a of animals)updateAnimal(a,dt);""",
"""  if(mode==='build'||mode==='edit')placeBuildCam(); else if(!traveling){if(mode==='walk')updateWalk(dt); else if(mode==='drive')updateDrive(dt);}
  if(mode==='build'||mode==='edit')focus.set(bc.x,0,bc.z); else if(mode==='walk')focus.set(pl.x,0,pl.z); else if(mode==='drive'&&driveCar)focus.set(driveCar.x,0,driveCar.z); else if(mode==='ride'&&rideTrain)focus.set(rideTrain.x,0,rideTrain.z);
  const night=updateDay(dt,focus);
  updateLights(dt,night); updateGarages(dt);
  if(!traveling){
    updateTrains(dt);
    for(const f of ferries.slice())updateFerry(f,dt);
    for(const c of cars)if(c.mode==='ai')updateCarAI(c,dt);
    for(const a of animals)updateAnimal(a,dt);
  }
  updateCrossings(dt);
  if(mode==='ride')updateRide(dt);
  portalMat.color.setHSL((now*.00008)%1,.8,.7); portalMat.opacity=.55+.2*Math.sin(now*.003);""")
# light focus for ride
rep("""  if(mode==='walk')lp.copy(walkCam.position); else if(mode==='drive')lp.set(driveCar.x,1,driveCar.z); else lp.set(bc.x,0,bc.z);""",
"""  if(mode==='walk')lp.copy(walkCam.position); else if(mode==='drive'&&driveCar)lp.set(driveCar.x,1,driveCar.z); else if(mode==='ride'&&rideTrain)lp.set(rideTrain.x,1,rideTrain.z); else lp.set(bc.x,0,bc.z);""")
open(p,'w').write(s)
print('ok3')
