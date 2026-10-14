import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ===== Katalog =====
rep("""boot:{kind:'car',label:'Fischerboot',speed:3,max:9,boat:true},""",
"""boot:{kind:'car',label:'Fischerboot',speed:3,max:9,boat:true}, uboot:{kind:'car',label:'U-Boot',speed:3,max:8,boat:true,sub:true},""")
rep("""items:['meer','wasser','boot','anleger','faehre','seetor']},""","""items:['meer','wasser','boot','uboot','anleger','faehre','seetor']},
  {id:'fang',label:'Mein Fang',icon:'F_thunfisch',special:'fang',items:[]},""")

# ===== Fang-Übersicht im Inventar =====
rep("""function renderItems(){
  const el=$('#items'); el.innerHTML='';
  for(const id of CATS.find(c=>c.id===curCat).items){""",
"""function renderItems(){
  const el=$('#items'); el.innerHTML='';
  const cat=CATS.find(c=>c.id===curCat);
  if(cat.special==='fang'){
    for(const ft of Object.keys(FISH)){
      const n=catchBook[ft]||0,rec=catchRec[ft],b=document.createElement('button');b.className='it fang'+(n?'':' none');
      b.innerHTML=`<span class="ball">${thumbs['F_'+ft]?`<img alt="" src="${thumbs['F_'+ft]}">`:''}${n?`<span class="cnt">${n}</span>`:''}</span><span>${n?FISH[ft].label:'???'}</span><small>${n&&rec?'Rekord '+fmtLen(rec):'noch keiner'}</small>`;
      b.addEventListener('click',()=>{ac();plop();hint(n?`${n} ${n===1?FISH[ft].label:FISH[ft].plural} gefangen. Der größte war ${fmtLen(rec||0)} lang.`:(ft==='barsch'?'Barsche gibt es in Seen und im Meer.':FISH[ft].plural+' gibt es nur im Meer.')+(n?'':' Fahr mit dem Fischerboot raus und angle!'),3500);});
      el.appendChild(b);
    }
    const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0),info=document.createElement('div');info.className='fangsum';
    info.innerHTML=`<b>${tot}</b><span>Fische<br>gefangen</span>`;el.appendChild(info);
    return;
  }
  for(const id of cat.items){""")
rep("""#btnFish.hot{""","""#items .it.fang .ball{position:relative;overflow:visible;}
#items .it.fang .ball img{border-radius:50%;}
#items .it.fang.none .ball img{filter:brightness(0);opacity:.28;}
#items .it.fang .cnt{position:absolute;right:-4px;top:-4px;min-width:24px;height:24px;padding:0 6px;box-sizing:border-box;border-radius:12px;background:var(--sun);font-weight:700;font-size:13px;display:grid;place-items:center;font-variant-numeric:tabular-nums;box-shadow:0 2px 4px rgba(0,0,0,.15);}
#items .it.fang small{font-size:10.5px;font-weight:500;color:#6A7280;margin-top:-3px;font-variant-numeric:tabular-nums;}
#items .fangsum{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:0 14px;margin-left:4px;border-left:2px dashed #DCCCAB;align-self:center;height:60px;}
#items .fangsum b{font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;}
#items .fangsum span{font-size:12px;line-height:1.2;color:#4A5563;font-weight:600;}
#fade{position:fixed;inset:0;z-index:7;background:#0b4a72;opacity:0;pointer-events:none;transition:opacity .35s;}
#fade.on{opacity:.85;transition:none;}
#btnFish.hot{""")
rep("""let catchBook={barsch:0,thunfisch:0,hai:0};try{const c=JSON.parse(localStorage.getItem('kunos-fang')||'null');if(c)catchBook=Object.assign(catchBook,c);}catch(e){}""",
"""let catchBook={barsch:0,thunfisch:0,hai:0};try{const c=JSON.parse(localStorage.getItem('kunos-fang')||'null');if(c)catchBook=Object.assign(catchBook,c);}catch(e){}
let catchRec={};try{catchRec=JSON.parse(localStorage.getItem('kunos-fang-rekord')||'{}')||{};}catch(e){catchRec={};}""")
rep("""  lastCatch={type,len};catchBook[type]++;try{localStorage.setItem('kunos-fang',JSON.stringify(catchBook));}catch(e){}""",
"""  lastCatch={type,len};catchBook[type]++;const rec=!catchRec[type]||len>catchRec[type];if(rec)catchRec[type]=len;
  try{localStorage.setItem('kunos-fang',JSON.stringify(catchBook));localStorage.setItem('kunos-fang-rekord',JSON.stringify(catchRec));}catch(e){}
  if(curCat==='fang')renderItems();""")
rep("""  $('#catchSub').textContent=(type==='hai'?'Er':'Er')+' ist '+fmtLen(len)+' lang.';""",
"""  $('#catchSub').textContent='Er ist '+fmtLen(len)+' lang.'+(rec&&catchBook[type]>1?' Neuer Rekord!':'');""")

# ===== U-Boot-Modell =====
rep("""  if(type==='boot'){""","""  if(type==='uboot'){
    const y=M('#F5C211',{roughness:.4,metalness:.25}),dk=M('#2A2D31');
    mesh(G('subbody',()=>{const c=new THREE.CylinderGeometry(.55,.55,2.3,16);c.rotateX(Math.PI/2);return c;}),y,0,.2,0,g);
    for(const z of[-1.15,1.15]){const e=mesh(G('subend',()=>new THREE.SphereGeometry(.55,16,10)),y,0,.2,z,g);e.scale.set(1,1,z>0?1.25:.9);}
    box(g,y,.5,.6,.95,0,.85,-.1);
    box(g,dk,.52,.14,.97,0,1.08,-.1,false);
    mesh(G('peri',()=>new THREE.CylinderGeometry(.04,.04,.6,6)),'#5A6168',.12,1.4,.15,g);box(g,'#5A6168',.08,.08,.22,.12,1.68,.24);
    for(const z of[-.6,0,.6])for(const x of[-1,1]){const w=mesh(G('port',()=>{const c=new THREE.CylinderGeometry(.13,.13,.06,12);c.rotateZ(Math.PI/2);return c;}),winMat,x*.54,.32,z,g,false);}
    box(g,y,1.5,.06,.35,0,.2,-1.3); box(g,y,.06,.7,.35,0,.25,-1.3);
    mesh(BX(.22,.14,.06),headMat,0,.25,1.83,g,false);
    const pr=new THREE.Group();pr.position.set(0,.2,-1.68);g.add(pr);
    for(const a of[0,Math.PI/2]){const bl=box(pr,'#C9A227',.08,.6,.05,0,0,0);bl.rotation.z=a;}
    pr.children.forEach(m=>{m.userData.keep=true;m.userData.prop=1;});
    const out=bake(g);out.userData.props=out.children.filter(m=>m.userData.prop);return out;
  }
  if(type==='boot'){""")
rep("""function honk(type){""","""function honk(type){
  if(ITEMS[type].sub){tone(1400,.18,'sine',.07);tone(1400,.6,'sine',.025,.25);tone(1400,.8,'sine',.012,.6);return;}""")

# ===== Unterwasserwelt =====
UNDER=r"""
/* ---------- Unterwasserwelt ---------- */
const underScene=new THREE.Scene();
underScene.background=new THREE.Color(0x0b4a72);
underScene.fog=new THREE.Fog(0x0b4a72,3,30);
const uHemi=new THREE.HemisphereLight(0x9fd8ff,0x0b2a40,.95);underScene.add(uHemi);
const uSun=new THREE.DirectionalLight(0xbfe9ff,.55);uSun.position.set(4,20,6);underScene.add(uSun,uSun.target);
const subLamp=new THREE.SpotLight(0xfff2c8,1.6,22,.5,.6,1.2);underScene.add(subLamp,subLamp.target);
const SUB_Y=-2.4;
let under=null;
const bubbleGeo=new THREE.BufferGeometry();bubbleGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(40*3),3));
const bubbles=new THREE.Points(bubbleGeo,new THREE.PointsMaterial({color:0xdff6ff,size:.12,transparent:true,opacity:.8,depthWrite:false}));bubbles.frustumCulled=false;underScene.add(bubbles);
const bubbleState=Array.from({length:40},()=>({x:0,y:-99,z:0,v:0}));
function buildUnderwater(){
  if(under)return;
  const grp=new THREE.Group(),r=mulberry(4711),wall=M('#5E5444',{flatShading:true}),sandA=M('#C9B27A'),sandB=M('#BBA36C'),mud=M('#7A6A4A');
  const rock=G('urock',()=>new THREE.DodecahedronGeometry(.5,0)),weed=G('uweed',()=>new THREE.ConeGeometry(.12,1.6,4)),coral=G('ucoral',()=>new THREE.IcosahedronGeometry(.35,0));
  const coralM=['#F27C9B','#F2A541','#B57BE0','#E8504A'].map(c=>M(c,{flatShading:true})),weedM=M('#2E8B57',{flatShading:true}),rockM=M('#7D8288',{flatShading:true});
  let rays=0;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    if(!isWater(i,j))continue;const c=center(i,j),sea=gAt(i,j)!=='wasser';
    box(grp,sea?((i+j)%2?sandA:sandB):mud,TILE,.2,TILE,c.x,-4.1,c.z,false);
    const n=sea?4:2;
    for(let k=0;k<n;k++){const x=c.x+(r()-.5)*3.4,z=c.z+(r()-.5)*3.4,q=r();
      if(q<.35){const m=mesh(weed,weedM,x,-3.2,z,grp,false);m.scale.set(1,.7+r()*.8,1);m.rotation.z=(r()-.5)*.3;}
      else if(q<.6&&sea){const m=mesh(coral,coralM[Math.floor(r()*4)],x,-3.85,z,grp,false);m.scale.set(1+r(),1+r()*1.5,1+r());}
      else{const m=mesh(rock,rockM,x,-3.9,z,grp,false);m.scale.set(.6+r(),.4+r()*.6,.6+r());m.rotation.y=r()*3;}}
    for(let d=0;d<4;d++){const a=i+DIRS[d][0],b=j+DIRS[d][1];if(isWater(a,b))continue;
      const w=box(grp,wall,d%2?.6:TILE+.6,4.3,d%2?TILE+.6:.6,c.x+DIRS[d][0]*(TILE/2+.3),-2.05,c.z+DIRS[d][1]*(TILE/2+.3),false);
      for(let k=0;k<2;k++){const m=mesh(rock,wall,c.x+DIRS[d][0]*(TILE/2-.1)+(d%2?0:(r()-.5)*3),-3.6+r()*2.5,c.z+DIRS[d][1]*(TILE/2-.1)+(d%2?(r()-.5)*3:0),grp,false);m.scale.setScalar(.8+r());}}
    if(sea&&rays<24&&r()<.3){rays++;const ray=mesh(G('uray',()=>new THREE.PlaneGeometry(1.2,6)),rayMat,c.x+(r()-.5)*2,-2,c.z+(r()-.5)*2,grp,false);ray.rotation.set(0,r()*3,.25);ray.userData.keep=true;}
  }
  const baked=bake(grp);baked.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;}});underScene.add(baked);
  const st=seaTex.clone();st.needsUpdate=true;st.repeat.set(N,N);
  const surf=new THREE.Mesh(new THREE.PlaneGeometry(N*TILE,N*TILE),new THREE.MeshBasicMaterial({map:st,color:0x9fe0ff,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false,fog:false}));
  surf.rotation.x=Math.PI/2;surf.position.y=0;underScene.add(surf);
  under={baked,surf,st,models:new Map()};
}
const rayMat=new THREE.MeshBasicMaterial({map:glowTex,color:0x9fe8ff,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
function destroyUnderwater(){
  if(!under)return;underScene.remove(under.baked);disposeGroup(under.baked);underScene.remove(under.surf);under.surf.geometry.dispose();under.surf.material.dispose();under.st.dispose();
  for(const m of under.models.values()){underScene.remove(m);disposeGroup(m);}under=null;
}
function updateUnderwater(dt,car){
  if(!under)return;
  const seen=new Set();
  for(const f of fishes){seen.add(f);let m=under.models.get(f);
    if(!m){m=fishModel(f.type);m.scale.setScalar(f.type==='barsch'?1.8:f.type==='thunfisch'?1.3:1.15);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});f.depth=f.depth||(-1+-(Math.random()*2.3));underScene.add(m);under.models.set(f,m);}
    const dx=f.x-car.x,dz=f.z-car.z,d2=dx*dx+dz*dz;
    if(d2<9&&f.flee<=0){f.flee=2;const a=Math.atan2(dx,dz),nx=f.x+Math.sin(a)*4,nz=f.z+Math.cos(a)*4;if(fishOk(f.type,nx,nz)){f.tx=nx;f.tz=nz;}}
    m.position.set(f.x,f.depth+Math.sin(lightTime*1.5+f.x)*.12,f.z);m.rotation.set(0,f.h+Math.sin(lightTime*(f.flee>0?16:7)+f.z)*.18,0);}
  for(const [f,m] of under.models)if(!seen.has(f)){underScene.remove(m);disposeGroup(m);under.models.delete(f);}
  under.st.offset.set((lightTime*.01)%1,(lightTime*.006)%1);
  const fx=Math.sin(car.h),fz=Math.cos(car.h);
  subLamp.position.set(car.x+fx*1.9,car.g.position.y+.25,car.z+fz*1.9);subLamp.target.position.set(car.x+fx*10,car.g.position.y-1,car.z+fz*10);
  const pos=bubbleGeo.attributes.position;
  bubbleState.forEach((b,k)=>{if(b.y<-50||b.y>-.05){if(Math.random()<dt*14*(Math.abs(car.v)+.4)){b.x=car.x-fx*1.8+(Math.random()-.5)*.3;b.z=car.z-fz*1.8+(Math.random()-.5)*.3;b.y=car.g.position.y+.2;b.v=.6+Math.random()*.8;}else{b.y=-99;}}
    else{b.y+=b.v*dt;b.x+=(Math.random()-.5)*.02;}pos.setXYZ(k,b.x,b.y,b.z);});
  pos.needsUpdate=true;
}
function setDive(car,on){
  if(!car||!ITEMS[car.type].sub)return;
  if(on&&!car.diving){buildUnderwater();car.diving=true;tone(220,.8,'sine',.06,0,.5);hint('Abtauchen! Blubb blubb.',2000);}
  else if(!on&&car.diving){car.diving=false;tone(180,.8,'sine',.06,0,1.8);}
  updDiveBtn(car);
}
function updDiveBtn(car){$('#diveTxt').textContent=car&&car.diving?'Auftauchen':'Abtauchen';}
let wasUnder=false;
function subUnder(){return mode==='drive'&&driveCar&&ITEMS[driveCar.type].sub&&(driveCar.dive||0)>.45;}
function forceSurface(car){if(!car||!ITEMS[car.type].sub)return;car.diving=false;car.dive=0;if(car.g.parent!==scene){underScene.remove(car.g);scene.add(car.g);}car.g.position.y=-.22;destroyUnderwater();}
$('#btnDive').addEventListener('click',()=>{ac();if(driveCar)setDive(driveCar,!driveCar.diving);});
"""
rep("""/* ---------- Weltreise ---------- */""",UNDER+"""
/* ---------- Weltreise ---------- */""")

# ===== HTML: Tauch-Knopf, Blende =====
rep("""  <button class="pill" id="btnFish" hidden>""","""  <button class="pill hot" id="btnDive" hidden><svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="13" rx="8" ry="3.6" fill="#F5C211"/><path d="M10 9.4V7h3v2.4M12 7V4.5h1.5"/><path d="M12 18.5v3m-2.5-1.5L12 22.5l2.5-2.5"/></svg><span id="diveTxt">Abtauchen</span></button>
  <button class="pill" id="btnFish" hidden>""")
rep("""<div id="hint" class="off"></div>""","""<div id="hint" class="off"></div>
<div id="fade"></div>""")

# ===== Fahren mit U-Boot =====
rep("""  if(boat){car.g.position.set(car.x,Math.sin(lightTime*2.2)*.04,car.z);car.g.rotation.set(Math.sin(lightTime*1.7)*.03,car.h,Math.sin(lightTime*1.3)*.04);}
  else{car.g.position.set(car.x,deck?.31:0,car.z); car.g.rotation.y=car.h;}
  $('#btnFish').hidden=!boat;""",
"""  if(spec.sub){
    car.dive=clamp((car.dive||0)+(car.diving?dt:-dt)/1.8,0,1);const e=car.dive*car.dive*(3-2*car.dive);
    car.g.position.set(car.x,-.22+(SUB_Y+.22)*e+(e<.05?Math.sin(lightTime*2.2)*.04:Math.sin(lightTime*1.1)*.06),car.z);
    car.g.rotation.set(car.v*.012*(car.diving?1:0)+(car.diving&&e<.95?.12:0)+(!car.diving&&e>.05?-.12:0),car.h,e<.05?Math.sin(lightTime*1.3)*.03:Math.sin(-x)*.08);
    const props=car.g.userData.props;if(props)for(const pm of props)pm.rotation.z+=dt*(2+Math.abs(car.v)*3);
  }
  else if(boat){car.g.position.set(car.x,Math.sin(lightTime*2.2)*.04,car.z);car.g.rotation.set(Math.sin(lightTime*1.7)*.03,car.h,Math.sin(lightTime*1.3)*.04);}
  else{car.g.position.set(car.x,deck?.31:0,car.z); car.g.rotation.y=car.h;}
  $('#btnFish').hidden=!boat||!!spec.sub; $('#btnDive').hidden=!spec.sub;
  if(spec.sub&&(car.dive||0)>.45){
    const fx=Math.sin(car.h),fz=Math.cos(car.h),k=1-Math.exp(-dt*4),cy=car.g.position.y;
    walkCam.position.x+=(car.x-fx*6.5-walkCam.position.x)*k;walkCam.position.z+=(car.z-fz*6.5-walkCam.position.z)*k;walkCam.position.y+=(Math.min(-.6,cy+1.7)-walkCam.position.y)*k;
    walkCam.lookAt(car.x+fx*3,cy+.2,car.z+fz*3);updateUnderwater(dt,car);return;
  }""")
rep("""function boatOk(x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return (g==='wasser'||g==='meer'||g==='anleger'||g==='seetor')&&!onDeck(x,z);}""",
"""function boatOk(x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return (g==='wasser'||g==='meer'||g==='anleger'||g==='seetor')&&((driveCar&&driveCar.diving)||!onDeck(x,z));}""")
# Ein- und Aussteigen
rep("""  if(ITEMS[car.type].boat&&!toBuild){""","""  if(ITEMS[car.type].sub&&car.diving&&!toBuild){nopeSnd();hint('Erst auftauchen, dann aussteigen.',2500);return;}
  if(ITEMS[car.type].sub)forceSurface(car);
  if(ITEMS[car.type].boat&&!toBuild){""")
rep("""  if(ITEMS[car.type].boat){$('#btnFish').hidden=false;""","""  if(ITEMS[car.type].sub){car.diving=false;car.dive=0;updDiveBtn(car);$('#btnDive').hidden=false;hint('Tippe auf Abtauchen und fahr unter Wasser zu den Fischen!',4000);}
  else if(ITEMS[car.type].boat){$('#btnFish').hidden=false;""")
rep("""  $('#btnEnter').hidden=true; $('#btnSail').hidden=true; $('#btnFish').hidden=true; if(fishing)stopFishing();""",
"""  $('#btnEnter').hidden=true; $('#btnSail').hidden=true; $('#btnFish').hidden=true; $('#btnDive').hidden=true; if(fishing)stopFishing();
  if(m!=='drive'&&driveCar)forceSurface(driveCar);""")
rep("""    if(it.boat){
      if(!isWater(i,j)){nope();hint('Das Boot braucht Wasser.',2500);return;}""","""    if(it.boat){
      if(!isWater(i,j)){nope();hint(it.sub?'Das U-Boot braucht Wasser.':'Das Boot braucht Wasser.',2500);return;}""")

# ===== Rendern =====
rep("""  } else renderer.render(scene,cam);
  requestAnimationFrame(frame);""","""  } else {
    const uw=subUnder();
    if(uw!==wasUnder){wasUnder=uw;const fd=$('#fade');fd.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>fd.classList.remove('on')));
      const c=driveCar;if(uw&&c.g.parent===scene){scene.remove(c.g);underScene.add(c.g);}else if(!uw&&c&&c.g.parent===underScene){underScene.remove(c.g);scene.add(c.g);}
      if(!uw&&c&&!c.diving)destroyUnderwater();}
    if(uw){const nt=updateDay.lastNight||0;uHemi.intensity=.95-.6*nt;uSun.intensity=.55-.45*nt;renderer.render(underScene,walkCam);}
    else renderer.render(scene,cam);
  }
  requestAnimationFrame(frame);""")
rep("""  glowWarm.opacity=night*.6;""","""  glowWarm.opacity=night*.6; updateDay.lastNight=night;""")
open(p,'w').write(s)
print('ok6')
