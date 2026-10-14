import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ---------- Katalog ----------
rep("""  anleger:{kind:'ground',label:'Anleger'}, seetor:{kind:'ground',label:'Seetor'}, faehre:{kind:'ferry',label:'Fähre'},""",
"""  anleger:{kind:'ground',label:'Anleger'}, seetor:{kind:'ground',label:'Seetor'}, faehre:{kind:'ferry',label:'Fähre'},
  meer:{kind:'ground',label:'Meer',paint:true}, boot:{kind:'car',label:'Fischerboot',speed:3,max:9,boat:true},""")
rep("""  {id:'see',label:'Wasser',icon:'faehre',items:['wasser','anleger','faehre','seetor']},""",
"""  {id:'see',label:'Wasser',icon:'boot',items:['meer','wasser','boot','anleger','faehre','seetor']},""")
rep("""WATT=new Set(['wasser','anleger','seetor']);""","""WATT=new Set(['wasser','meer','anleger','seetor']);""")
rep("""const FLAT=new Set(['strasse','sand','wasser',""","""const FLAT=new Set(['strasse','sand','wasser','meer',""")

# ---------- Meer-Material ----------
rep("""const waterMat=new THREE.MeshStandardMaterial({color:0x3da9e6,roughness:.15,metalness:.1});""",
"""const waterMat=new THREE.MeshStandardMaterial({color:0x3da9e6,roughness:.15,metalness:.1});
const seaTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#1E6FB8';x.fillRect(0,0,64,64);
  x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=2;
  for(const [cx,cy] of [[10,12],[42,8],[26,30],[56,40],[8,50],[36,54]])for(const ox of[-64,0,64])for(const oy of[-64,0,64]){x.beginPath();x.arc(cx+ox,cy+oy,6,Math.PI*1.15,Math.PI*1.85);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const seaMat=new THREE.MeshStandardMaterial({map:seaTex,roughness:.2,metalness:.1});""")
rep("""  if(type==='wasser'){water();return g;}""","""  if(type==='wasser'){water();return g;}
  if(type==='meer'){mesh(BX(TILE,.03,TILE),seaMat,0,0,0,g,false);return g;}""")

# ---------- Fischerboot-Modell ----------
rep("""function carModel(type){
  const g=new THREE.Group();
  if(type==='lambo'){""","""function carModel(type){
  const g=new THREE.Group();
  if(type==='boot'){
    const hull=M('#F4F4F2',{roughness:.5});
    box(g,hull,1.4,.5,2.4,0,.05,-.15);
    const bow=box(g,hull,1.0,.5,1.0,0,.05,1.0);bow.rotation.y=Math.PI/4;bow.scale.set(1,1,1);
    box(g,'#2F5E9E',1.42,.12,2.42,0,.22,-.15,false);
    const bs=box(g,'#2F5E9E',1.02,.12,1.02,0,.22,1.0,false);bs.rotation.y=Math.PI/4;
    box(g,'#9B7650',1.2,.05,2.2,0,.3,-.15,false);
    box(g,'#F4F4F2',.9,.75,.8,0,.7,-.55);
    box(g,glassMat,.92,.28,.82,0,.86,-.55,false);
    box(g,'#D7261E',1.05,.1,.95,0,1.12,-.55);
    mesh(G('mast',()=>new THREE.CylinderGeometry(.04,.04,1.3,6)),'#5A4630',0,1.5,-.55,g);
    const rod=mesh(G('rod',()=>new THREE.CylinderGeometry(.025,.035,1.7,6)),'#3A2A1A',.45,1.0,.55,g);rod.rotation.x=.9;
    for(const z of[-1.1,-.85])box(g,'#F28C28',.3,.18,.18,-.45,.42,z,false);
    box(g,'#6E737A',.35,.25,.35,.4,.45,-1.05);
    mesh(BX(.12,.08,.12),headMat,0,1.22,-.2,g,false);
    return bake(g);
  }
  if(type==='lambo'){""")
rep("""function honk(type){""","""function honk(type){
  if(ITEMS[type].boat){tone(98,.9,'sawtooth',.07);tone(123,.9,'sawtooth',.05);return;}""")

# ---------- Fische & Angeln ----------
FISH=r"""
/* ---------- Fische und Angeln ---------- */
const FISH={
  barsch:{label:'Barsch',plural:'Barsche',len:[.18,.45],sil:.75,speed:.8},
  thunfisch:{label:'Thunfisch',plural:'Thunfische',len:[.8,2.2],sil:1.5,speed:1.6},
  hai:{label:'Hai',plural:'Haie',len:[1.5,3.5],sil:2.5,speed:1.2}
};
const fishes=[], splashes=[];
const silGeo=(()=>{const s=new THREE.Shape();s.moveTo(0,.5);s.quadraticCurveTo(.22,.2,.17,-.2);s.lineTo(.04,-.32);s.lineTo(.2,-.5);s.lineTo(-.2,-.5);s.lineTo(-.04,-.32);s.lineTo(-.17,-.2);s.quadraticCurveTo(-.22,.2,0,.5);const g=new THREE.ShapeGeometry(s);g.rotateX(Math.PI/2);return g;})();
const silMat=new THREE.MeshBasicMaterial({color:0x08243f,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});
const finGeo=(()=>{const s=new THREE.Shape();s.moveTo(-.18,0);s.lineTo(.1,0);s.quadraticCurveTo(.02,.2,-.12,.42);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false});g.translate(0,0,-.02);g.rotateY(-Math.PI/2);return g;})();
const splashGeo=new THREE.RingGeometry(.15,.32,20);splashGeo.rotateX(-Math.PI/2);
function fishModel(type){
  const g=new THREE.Group(),fl=M('#F28C28');
  const body=(c,sx,sy,sz,y,z)=>{const m=mesh(G('fb',()=>new THREE.IcosahedronGeometry(.5,1)),M(c,{flatShading:true}),0,y,z,g);m.scale.set(sx,sy,sz);return m;};
  if(type==='barsch'){
    body('#7E9A3C',.28,.42,1.0,0,0); body('#E8E2B8',.24,.2,.8,-.12,.02);
    for(const z of[-.2,0,.2])box(g,'#3E4E1E',.3,.36,.06,0,.02,z,false);
    const t=box(g,fl,.04,.34,.26,0,0,-.58);t.rotation.x=.0; box(g,fl,.04,.18,.34,0,.24,-.05);
    box(g,'#151515',.3,.06,.06,0,.06,.36,false);
  } else if(type==='thunfisch'){
    body('#1F3D78',.36,.46,1.25,.03,0); body('#C9D2DA',.32,.26,1.1,-.1,0);
    const t1=box(g,'#1F3D78',.04,.5,.12,0,.2,-.74);t1.rotation.x=-.6;const t2=box(g,'#1F3D78',.04,.5,.12,0,-.2,-.74);t2.rotation.x=.6;
    for(const z of[-.3,-.42])box(g,'#F2C230',.06,.08,.06,0,.2,z,false);
    box(g,'#151515',.38,.06,.06,0,.08,.45,false);
  } else {
    body('#7D8A96',.42,.42,1.6,0,0); body('#F2F4F6',.36,.24,1.4,-.12,0);
    mesh(finGeo,M('#6B7782'),0,.18,.05,g).scale.set(1.4,1.4,1.4);
    const t1=box(g,'#6B7782',.05,.6,.16,0,.22,-.9);t1.rotation.x=-.55;const t2=box(g,'#6B7782',.05,.36,.14,0,-.14,-.88);t2.rotation.x=.6;
    for(const x of[-.2,.2]){const pf=box(g,'#6B7782',.4,.04,.22,x,-.12,.2);pf.rotation.z=x>0?-.4:.4;}
    box(g,'#151515',.44,.06,.06,0,.06,.6,false);
  }
  return bake(g);
}
function fishOk(type,x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return type==='barsch'?(g==='wasser'||g==='meer'):g==='meer';}
function addFish(type,x,z){
  const sil=new THREE.Mesh(silGeo,silMat);sil.scale.setScalar(FISH[type].sil);sil.position.set(x,.035,z);scene.add(sil);
  let fin=null;if(type==='hai'){fin=new THREE.Mesh(finGeo,M('#4A5560'));fin.scale.setScalar(1.6);fin.castShadow=false;scene.add(fin);}
  const f={type,x,z,h:Math.random()*6.3,tx:x,tz:z,sil,fin,jumpT:6+Math.random()*14,jump:null,model:null,hook:false,flee:0};fishes.push(f);return f;
}
function removeFish(f){const k=fishes.indexOf(f);if(k<0)return;scene.remove(f.sil);if(f.fin)scene.remove(f.fin);if(f.model){scene.remove(f.model);disposeGroup(f.model);}fishes.splice(k,1);}
function splash(x,z,big){const m=new THREE.Mesh(splashGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false}));m.position.set(x,.05,z);scene.add(m);splashes.push({m,t:0,big:big?1.8:1});}
let fishCheck=0;
function updateFish(dt){
  fishCheck-=dt;
  if(fishCheck<=0){fishCheck=2.5;
    let sea=[],lake=[];for(let k=0;k<N*N;k++){const g=tiles[k].g;if(g==='meer')sea.push(k);else if(g==='wasser')lake.push(k);}
    const nSea=fishes.filter(f=>f.type!=='barsch'||gAt(...(t=>[t.i,t.j])(tileAt(f.x,f.z)||{i:-1,j:-1}))==='meer').length;
    const wantSea=Math.min(22,Math.round(sea.length*.35)),wantLake=Math.min(8,Math.round(lake.length*.25));
    const lakeN=fishes.length-nSea;
    for(let q=0;q<2;q++){
      if(nSea+q<wantSea&&sea.length){const k=sea[Math.floor(Math.random()*sea.length)],c=center(k%N,(k/N)|0),r=Math.random(),sharks=fishes.filter(f=>f.type==='hai').length;
        const type=r<.45?'thunfisch':(r<.75||sharks>=4)?'barsch':'hai';addFish(type,c.x+(Math.random()-.5)*3,c.z+(Math.random()-.5)*3);}
      if(lakeN+q<wantLake&&lake.length){const k=lake[Math.floor(Math.random()*lake.length)],c=center(k%N,(k/N)|0);addFish('barsch',c.x+(Math.random()-.5)*3,c.z+(Math.random()-.5)*3);}
    }
  }
  for(const f of fishes.slice()){
    if(!fishOk(f.type,f.x,f.z)){removeFish(f);continue;}
    const sp=FISH[f.type].speed*(f.flee>0?2.5:1);if(f.flee>0)f.flee-=dt;
    if(f.hook&&fishing&&fishing.phase==='wait'){f.tx=fishing.x;f.tz=fishing.z;}
    let dx=f.tx-f.x,dz=f.tz-f.z,d=Math.hypot(dx,dz);
    if(d<.3&&!f.hook){for(let q=0;q<6;q++){const a=Math.random()*6.3,r=2+Math.random()*5,nx=f.x+Math.cos(a)*r,nz=f.z+Math.sin(a)*r;if(fishOk(f.type,nx,nz)){f.tx=nx;f.tz=nz;break;}}dx=f.tx-f.x;dz=f.tz-f.z;d=Math.hypot(dx,dz);}
    if(d>.05){const want=Math.atan2(dx,dz);f.h+=clamp(angDiff(want,f.h),-2.2*dt,2.2*dt);
      const st=Math.min(sp*dt*(.5+.5*Math.max(0,Math.cos(angDiff(want,f.h)))),d);const nx=f.x+Math.sin(f.h)*st,nz=f.z+Math.cos(f.h)*st;
      if(fishOk(f.type,nx,nz)){f.x=nx;f.z=nz;}else{f.tx=f.x;f.tz=f.z;}}
    const wig=Math.sin(lightTime*8+f.x)*.12;
    f.sil.position.set(f.x,.035,f.z);f.sil.rotation.y=f.h+wig;
    if(f.fin){f.fin.position.set(f.x+Math.sin(f.h)*.2,-.02+Math.sin(lightTime*2+f.z)*.03,f.z+Math.cos(f.h)*.2);f.fin.rotation.y=f.h;}
    if(f.type!=='hai'&&!f.hook){f.jumpT-=dt;
      if(f.jumpT<=0&&!f.jump&&nearFocus(f.x,f.z,45)){f.jump={t:0};f.jumpT=8+Math.random()*16;if(!f.model){f.model=fishModel(f.type);f.model.scale.setScalar(f.type==='barsch'?1.4:1.1);scene.add(f.model);}f.model.visible=true;splash(f.x,f.z);}}
    if(f.jump){f.jump.t+=dt/1.0;const t=f.jump.t;
      if(t>=1){f.jump=null;f.model.visible=false;f.sil.visible=true;splash(f.x+Math.sin(f.h)*.8,f.z+Math.cos(f.h)*.8);}
      else{f.sil.visible=false;f.model.position.set(f.x+Math.sin(f.h)*t*.8,Math.sin(Math.PI*t)*1.1-.1,f.z+Math.cos(f.h)*t*.8);f.model.rotation.set(-(t-.5)*2.2,f.h,0);}}
  }
  for(let k=splashes.length-1;k>=0;k--){const sp=splashes[k];sp.t+=dt;const s=(1+sp.t*4)*sp.big;sp.m.scale.set(s,1,s);sp.m.material.opacity=Math.max(0,.8-sp.t*1.3);if(sp.t>.65){scene.remove(sp.m);sp.m.material.dispose();splashes.splice(k,1);}}
}

let fishing=null;
const fishLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:12},()=>new THREE.Vector3())),new THREE.LineBasicMaterial({color:0x222222}));
fishLine.visible=false;fishLine.frustumCulled=false;scene.add(fishLine);
const bobber=(()=>{const g=new THREE.Group();mesh(G('bob1',()=>new THREE.SphereGeometry(.13,10,8,0,Math.PI*2,0,Math.PI/2)),'#E8343C',0,0,0,g,false);const b=mesh(G('bob2',()=>new THREE.SphereGeometry(.13,10,8,0,Math.PI*2,Math.PI/2,Math.PI/2)),'#FFFFFF',0,0,0,g,false);mesh(G('bobst',()=>new THREE.CylinderGeometry(.02,.02,.25,5)),'#E8343C',0,.2,0,g,false);g.visible=false;scene.add(g);return g;})();
const isBoat=()=>mode==='drive'&&driveCar&&ITEMS[driveCar.type].boat;
function rodTip(){const c=driveCar,fx=Math.sin(c.h),fz=Math.cos(c.h),rx=Math.cos(c.h),rz=-Math.sin(c.h);return new THREE.Vector3(c.x+rx*.45+fx*1.25,1.75,c.z+rz*.45+fz*1.25);}
function startFishing(){
  if(!isBoat())return;const c=driveCar;c.v=0;
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
    if(!F.fish){let best=null,bd=81;for(const f of fishes){if(f.jump||f.flee>0)continue;const d=(f.x-F.x)**2+(f.z-F.z)**2;if(d<bd&&fishOk(f.type,F.x,F.z)){bd=d;best=f;}}
      if(best){F.fish=best;best.hook=true;}
      else{F.wait+=dt;if(F.wait>7&&!F.told){F.told=true;hint('Hier beißt nichts. Fahr dorthin, wo du Fische siehst.',3200);}if(F.wait>16){stopFishing();return;}}}
    else if(!fishes.includes(F.fish)){F.fish=null;}
    else if(Math.hypot(F.fish.x-F.x,F.fish.z-F.z)<.45){F.phase='bite';F.t=0;F.biteT=2.2;$('#btnFish').classList.add('hot');fishBtn('Zieh!');tone(1200,.08,'square',.06);tone(1200,.08,'square',.06,.15);navigator.vibrate&&navigator.vibrate(120);}
  }
  else if(F.phase==='bite'){
    bobber.position.set(F.x,-.12+Math.abs(Math.sin(F.t*14))*.1,F.z);F.biteT-=dt;
    if(Math.floor(F.t*5)!==Math.floor((F.t-dt)*5))splash(F.x,F.z);
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
  F.model=fishModel(F.type);F.model.scale.setScalar(F.type==='barsch'?1.6:F.type==='thunfisch'?1.1:.9);scene.add(F.model);
  splash(F.x,F.z,true);tone(400,.12,'sine',.08,0,2);tone(600,.12,'sine',.08,.12,2);
}
let catchBook={barsch:0,thunfisch:0,hai:0};try{const c=JSON.parse(localStorage.getItem('kunos-fang')||'null');if(c)catchBook=Object.assign(catchBook,c);}catch(e){}
let lastCatch=null;
function fmtLen(m){return m<1?Math.round(m*100)+' cm':m.toFixed(2).replace('.',',')+' m';}
function showCatch(type,len){
  lastCatch={type,len};catchBook[type]++;try{localStorage.setItem('kunos-fang',JSON.stringify(catchBook));}catch(e){}
  const S=FISH[type];
  $('#catchImg').src=thumbs['F_'+type]||'';$('#catchImg').hidden=!thumbs['F_'+type];
  $('#catchTitle').textContent=type==='hai'?'Wow, ein Hai!':'Du hast einen '+S.label+' gefangen!';
  $('#catchSub').textContent=(type==='hai'?'Er':'Er')+' ist '+fmtLen(len)+' lang.';
  $('#catchBook').textContent='Dein Fang: '+Object.keys(FISH).map(k=>catchBook[k]+' '+(catchBook[k]===1?FISH[k].label:FISH[k].plural)).join(', ');
  $('#catch').hidden=false;
  tone(523,.15,'sine',.09);tone(659,.15,'sine',.09,.15);tone(784,.15,'sine',.09,.3);tone(1047,.35,'sine',.09,.45);
}
$('#catchKeep').addEventListener('click',()=>{ac();$('#catch').hidden=true;plop();hint('Ab in den Eimer!',1800);});
$('#catchFree').addEventListener('click',()=>{ac();$('#catch').hidden=true;if(lastCatch&&driveCar){const c=driveCar,x=c.x+Math.sin(c.h)*3,z=c.z+Math.cos(c.h)*3;if(fishOk(lastCatch.type,x,z)){const f=addFish(lastCatch.type,x,z);f.flee=2.5;splash(x,z,true);}}hint('Tschüss Fisch!',1800);});
$('#btnFish').addEventListener('click',()=>{ac();if(!fishing)startFishing();else reelIn();});
"""
rep("""/* ---------- Weltreise ---------- */""",FISH+"""
/* ---------- Weltreise ---------- */""")

# ---------- HTML ----------
rep("""  <button class="pill hot" id="btnSail" hidden>""",
"""  <button class="pill" id="btnFish" hidden><svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 15 4"/><path d="M15 4c3 2 4 6 4 10"/><path d="M19 14v3a2 2 0 1 1-2-2"/><path d="M3 12c2-2 5-2 7 0-2 2-5 2-7 0z" fill="#F28C28"/></svg><span id="fishTxt">Angeln</span></button>
  <button class="pill hot" id="btnSail" hidden>""")
rep("""<div id="stPanel" hidden>""","""<div id="catch" hidden>
  <div id="catchCard">
    <img id="catchImg" alt="">
    <h2 id="catchTitle"></h2>
    <p id="catchSub"></p>
    <p id="catchBook"></p>
    <div class="mrow"><button class="mb go" id="catchKeep">Mitnehmen</button><button class="mb" id="catchFree">Freilassen</button></div>
  </div>
</div>
<div id="stPanel" hidden>""")
rep("""#btnExit.hot{""","""#catch{position:fixed;inset:0;z-index:11;display:grid;place-items:center;background:rgba(10,30,60,.45);padding-inline:16px;}
#catchCard{background:var(--tray-solid);border-radius:28px;padding:20px;width:min(100%,380px);box-sizing:border-box;display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.35);animation:pop .35s ease-out;}
#catchCard img{width:180px;height:180px;max-width:100%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#E3F4FF,#9CD3F5);}
#catchCard h2{margin:4px 0 0;font-size:24px;font-weight:700;line-height:1.15;text-wrap:balance;}
#catchCard p{margin:0;font-size:15px;color:#4A5563;}
#catchCard #catchSub{font-size:18px;font-weight:600;color:var(--ink);}
#catchCard .mrow{width:100%;margin-top:6px;}
@keyframes pop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
#btnFish.hot{animation:pulse .5s infinite alternate;}
@keyframes pulse{to{transform:scale(1.08);}}
#btnExit.hot{""")

# ---------- Fahren: Boot nur auf Wasser ----------
rep("""  const car=driveCar,spec=ITEMS[car.type],{x,y}=input(),thr=-y;""",
"""  const car=driveCar,spec=ITEMS[car.type],inp=input(),boat=!!spec.boat,x=fishing?0:inp.x,y=fishing?0:inp.y,thr=-y;""")
rep("""  if(!canStand(car.x,car.z)&&canStand(ox,oz)){car.x=ox;car.z=oz;car.v=0;}
  const deck=onDeck(car.x,car.z);
  car.g.position.set(car.x,deck?.31:0,car.z); car.g.rotation.y=car.h;""",
"""  const ok=boat?boatOk:canStand;
  if(!ok(car.x,car.z)&&ok(ox,oz)){car.x=ox;car.z=oz;car.v=0;}
  const deck=boat?null:onDeck(car.x,car.z);
  if(boat){car.g.position.set(car.x,Math.sin(lightTime*2.2)*.04,car.z);car.g.rotation.set(Math.sin(lightTime*1.7)*.03,car.h,Math.sin(lightTime*1.3)*.04);}
  else{car.g.position.set(car.x,deck?.31:0,car.z); car.g.rotation.y=car.h;}
  $('#btnFish').hidden=!boat;""")
rep("""function camFree(car,back){""","""function boatOk(x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return (g==='wasser'||g==='meer'||g==='anleger'||g==='seetor')&&!onDeck(x,z);}
function camFree(car,back){""")
rep("""  $('#btnEnter').hidden=true; $('#btnSail').hidden=true;""","""  $('#btnEnter').hidden=true; $('#btnSail').hidden=true; $('#btnFish').hidden=true; if(fishing)stopFishing();""")
rep("""function exitCar(toBuild){
  const car=driveCar; if(!car)return; driveCar=null;
  const rx=-Math.cos(car.h),rz=Math.sin(car.h);
  pl.x=car.x+rx*1.9; pl.z=car.z+rz*1.9; pl.yaw=car.h+Math.PI; pl.pitch=-.05;""",
"""function exitCar(toBuild){
  const car=driveCar; if(!car)return;
  if(ITEMS[car.type].boat&&!toBuild){
    let spot=null;for(const r of[1.8,2.4,3,3.6])for(let a=0;a<16&&!spot;a++){const x=car.x+Math.cos(a/16*6.283)*r,z=car.z+Math.sin(a/16*6.283)*r;const t=tileAt(x,z);if(t&&!isWater(t.i,t.j)&&canStand(x,z)&&!resolve({x,z},.32))spot={x,z};}
    if(!spot){nopeSnd();hint('Fahr ans Ufer, dann kannst du aussteigen.',2800);return;}
    driveCar=null;pl.x=spot.x;pl.z=spot.z;pl.yaw=Math.atan2(car.x-spot.x,car.z-spot.z)+Math.PI;pl.pitch=-.05;
    car.v=0;car.mode='park';saveSoon();setMode('walk');return;
  }
  driveCar=null;
  const rx=-Math.cos(car.h),rz=Math.sin(car.h);
  pl.x=car.x+rx*1.9; pl.z=car.z+rz*1.9; pl.yaw=car.h+Math.PI; pl.pitch=-.05;""")
rep("""  setMode('drive'); honk(car.type); hint('Links lenken und Gas geben. Brumm!');""",
"""  setMode('drive'); honk(car.type);
  if(ITEMS[car.type].boat){$('#btnFish').hidden=false;hint(fishes.length?'Fahr zu den Schatten im Wasser. Das sind Fische! Dann tippe auf Angeln.':'Fische gibt es im Meer. Mal mit dem Feld „Meer" ein großes Meer.',4500);}
  else hint('Links lenken und Gas geben. Brumm!');""")
# ferry must not carry boats
rep("""  for(const c of cars)if(c.mode!=='ai'&&onDeckF(f,c.x,c.z))carried.push({o:c,p:0,l:deckLocal(f,c.x,c.z)});""",
"""  for(const c of cars)if(c.mode!=='ai'&&!ITEMS[c.type].boat&&onDeckF(f,c.x,c.z))carried.push({o:c,p:0,l:deckLocal(f,c.x,c.z)});""")
# placement
rep("""    if(isWater(i,j)){
      const f=ferries.find(f=>inTile(f,i,j));""","""    if(it.boat){
      if(!isWater(i,j)){nope();hint('Das Boot braucht Wasser.',2500);return;}
      const c=center(i,j);car=addCar(sel,c.x,c.z,bc.yaw+Math.PI,false);
      if(gAt(i,j)!=='meer'&&!fishes.length)hint('Tipp: Im Meer gibt es Thunfische und Haie. Mal ein Meer mit dem Feld „Meer".',4000);
    }
    else if(isWater(i,j)){
      const f=ferries.find(f=>inTile(f,i,j));""")
# reset fish on world reset
rep("""  while(ferries.length)removeFerry(ferries[0]);""","""  while(ferries.length)removeFerry(ferries[0]);
  while(fishes.length)removeFish(fishes[0]);""")

# ---------- Schleife ----------
rep("""    for(const f of ferries.slice())updateFerry(f,dt);""","""    for(const f of ferries.slice())updateFerry(f,dt);
    updateFish(dt); updateFishing(dt);""")
rep("""  waterMat.color.setHSL(.56,.72,.55+Math.sin(now*.0012)*.03);""","""  waterMat.color.setHSL(.56,.72,.55+Math.sin(now*.0012)*.03);
  seaTex.offset.set((now*.00002)%1,(now*.000012)%1);""")
# ---------- Vorschaubilder Fische ----------
rep("""  R.dispose(); try{R.forceContextLoss();}catch(e){}
}""","""  for(const ft of Object.keys(FISH)){
    const obj=fishModel(ft);obj.rotation.y=Math.PI/2;S.add(obj);obj.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(obj),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
    C.position.copy(ct).addScaledVector(new THREE.Vector3(.25,.35,1).normalize(),sz.length()/2/Math.sin(15*Math.PI/180)*.9);C.lookAt(ct);
    R.render(S,C);thumbs['F_'+ft]=R.domElement.toDataURL('image/png');S.remove(obj);
  }
  R.dispose(); try{R.forceContextLoss();}catch(e){}
}""")
# ---------- Beispielwelt: Meer mit Boot ----------
rep("""  for(let i=0;i<=13;i++){W(i,16,'sand');for(let j=17;j<N;j++)W(i,j,'wasser');}""",
"""  for(let i=0;i<=13;i++){W(i,16,'sand');for(let j=17;j<N;j++)W(i,j,'meer');}""")
rep("""  spawnTrain('zug',8,1,1);""","""  spawnTrain('zug',8,1,1);
  {const c=center(4,17);addCar('boot',c.x,c.z-.6,Math.PI/2,false);}""")
open(p,'w').write(s)
print('ok5')
