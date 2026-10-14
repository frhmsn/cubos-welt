import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ===== Bahnhofs-Menü =====
rep("#btnExit.hot{","""#stPanel{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 132px);transform:translateX(-50%);z-index:6;width:min(calc(100% - 32px),460px);box-sizing:border-box;
  background:var(--tray-solid);border-radius:24px;padding:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;box-shadow:0 10px 30px rgba(20,40,60,.25);}
#stPanel .stIc{width:52px;height:52px;border-radius:50%;background:#1E5AA8;display:grid;place-items:center;flex:0 0 auto;}
#stPanel .stIc svg{width:32px;height:32px;}
#stPanel .stTx{flex:1 1 160px;min-width:0;display:flex;flex-direction:column;gap:2px;}
#stPanel .stTx b{font-size:19px;font-weight:700;line-height:1.15;}
#stPanel .stTx span{font-size:14px;color:#4A5563;line-height:1.3;}
#stPanel .stBtns{display:flex;gap:8px;flex:1 1 100%;}
#stPanel .stBtns .pill{flex:1 1 0;justify-content:center;height:56px;padding:0 14px;font-size:17px;}
#stPanel .stBtns .pill[hidden]{display:none!important;}
#btnExit.hot{""")
rep("""<div id="hint" class="off"></div>""",
"""<div id="hint" class="off"></div>
<div id="stPanel" hidden>
  <div class="stIc"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 10h12M9 20l-1.5 1.5M15 20l1.5 1.5"/><circle cx="9" cy="13.5" r=".9" fill="#fff"/><circle cx="15" cy="13.5" r=".9" fill="#fff"/></svg></div>
  <div class="stTx"><b id="stTitle">Bahnhof</b><span id="stSub"></span></div>
  <div class="stBtns"><button class="pill hot" id="stGo">Einsteigen</button><button class="pill" id="stAlt">Weiterfahren</button></div>
</div>""")

# trains: hold at station while child decides
rep("""      if(rem<=0){tr.state='halt';tr.wait=6;tr.v=0;tr.atStation=true;tr.stopAt=null;""",
"""      if(rem<=0){tr.state='halt';tr.wait=6;tr.v=0;tr.atStation=true;tr.stopAt=null;tr.go=false;tr.holdT=0;""")
rep("""    if(tr.state==='halt'){tr.wait-=dt;if(tr.wait<=0){""",
"""    if(tr.state==='halt'){
      const hold=tr.atStation&&!tr.go&&((rideTrain===tr)||(mode==='walk'&&!traveling&&tr.holdT<30&&stationNear()===tr.stopK));
      if(hold)tr.holdT+=dt;else tr.wait-=dt;
      if(tr.wait<=0){""")

rep("""function nearestVehicle(){
  const c=nearestCar();if(c)return{car:c};
  for(const tr of trains){if(tr.state!=='halt'||!tr.atStation)continue;for(const cc of tr.cars){const q=cc.g.position;if(Math.hypot(q.x-pl.x,q.z-pl.z)<3.8)return{train:tr};}}
  return null;
}""",
"""function nearestVehicle(){const c=nearestCar();return c?{car:c}:null;}
function stationNear(){
  const t=tileAt(pl.x,pl.z);if(!t)return -1;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i=t.i+di,j=t.j+dj;if(gAt(i,j)!=='bahnhof')continue;
    const k=I(i,j),gm=groundM[k],c=center(i,j),sd=(gm&&gm.userData.side)||[0,0];
    if(Math.hypot(pl.x-(c.x+sd[0]),pl.z-(c.z+sd[1]))<2.9)return k;}
  return -1;
}
const trainAt=k=>trains.find(tr=>tr.state==='halt'&&tr.atStation&&tr.stopK===k);
let stState='';
function showStation(state,title,sub,go,alt){
  if(state===stState)return;stState=state;
  const P=$('#stPanel');if(!state){P.hidden=true;return;}
  P.hidden=false;$('#stTitle').textContent=title;$('#stSub').textContent=sub||'';
  $('#stGo').hidden=!go;if(go)$('#stGo').textContent=go;$('#stAlt').hidden=!alt;if(alt)$('#stAlt').textContent=alt;
  if(state==='here'||state==='ridestop')tone(988,.12,'sine',.07);
}
function updateStationUI(){
  if(traveling){showStation('');return;}
  if(mode==='walk'){
    const k=stationNear();
    if(k<0){showStation('');return;}
    if(!trains.length){showStation('none','Bahnhof','Hier fährt noch kein Zug. Setz einen Zug aufs Gleis.');return;}
    const tr=trainAt(k);
    if(tr&&!tr.go&&tr.holdT<30){showStation('here','Der Zug ist da!','Willst du mitfahren?','Einsteigen');return;}
    showStation('wait','Bahnhof','Bleib hier stehen. Der Zug kommt und wartet auf dich.');return;
  }
  if(mode==='ride'&&rideTrain){
    const tr=rideTrain;
    if(tr.state==='halt'&&tr.atStation&&!tr.go){showStation('ridestop','Bahnhof!','Willst du hier aussteigen?','Aussteigen','Weiterfahren');return;}
    showStation('');return;
  }
  showStation('');
}
$('#stGo').addEventListener('click',()=>{
  ac();
  if(mode==='walk'){const k=stationNear(),tr=k>=0&&trainAt(k);if(tr){showStation('');startRide(tr);}}
  else if(mode==='ride'){showStation('');exitTrain(false);}
});
$('#stAlt').addEventListener('click',()=>{ac();if(mode==='ride'&&rideTrain){rideTrain.go=true;rideTrain.wait=0;showStation('');}});""")
rep("""  $('#btnExit').hidden=!(m==='drive'||m==='ride'); $('#btnExit').classList.remove('hot');""",
"""  $('#btnExit').hidden=m!=='drive'; $('#btnExit').classList.remove('hot');
  stState='x';showStation('');""")
rep("""  rideTrain=null; tr.wait=Math.max(tr.wait,2.5); setMode('walk'); hint('Tschüss Zug!',1800);""",
"""  rideTrain=null; tr.go=true; tr.wait=2.5; setMode('walk'); hint('Tschüss Zug!',1800);""")
rep("""  setMode('ride'); whistle(tr.type); hint('Du fährst mit! Aussteigen kannst du, wenn der Zug am Bahnhof hält.',4000);""",
"""  tr.go=true; tr.wait=Math.min(tr.wait,1.2);
  setMode('ride'); whistle(tr.type); hint('Du fährst mit! Am nächsten Bahnhof kannst du aussteigen.',3500);""")
rep("""  $('#btnExit').classList.toggle('hot',tr.state==='halt'&&tr.atStation);
}""","""}""")

# ===== Flackern =====
# Gleisstücke ohne Überlappung, deutliche Höhenstufen
rep("""  box(s,'#A0937F',1.7,.08,L+.04,0,.04,0,false);""","""  box(s,'#A0937F',1.7,.08,L,0,.04,0,false);""")
rep("""  for(const x of[-.42,.42])box(s,railMat,.09,.09,L+.04,x,.175,0,false);""","""  for(const x of[-.42,.42])box(s,railMat,.09,.09,L,x,.175,0,false);""")
rep("""if(prev)trackPiece(g,prev[0],prev[1],px,pz,k*.001);""","""if(prev)trackPiece(g,prev[0],prev[1],px,pz,(k%2)*.008);""")
rep("""trackPiece(g,-v[0]*h,-v[1]*h,v[0]*h,v[1]*h,n++*.003);""","""trackPiece(g,-v[0]*h,-v[1]*h,v[0]*h,v[1]*h,n++*.008);""")
rep("""trackPiece(g,v[0]*st,v[1]*st,v[0]*h,v[1]*h,n++*.003);""","""trackPiece(g,v[0]*st,v[1]*st,v[0]*h,v[1]*h,n++*.008);""")
# Fähre ohne deckungsgleiche Flächen
rep("""  box(g,'#2F5E9E',3.0,.5,4.2,0,0,0);
  box(g,'#F4F4F2',3.02,.1,4.22,0,.2,0,false);
  box(g,'#7D858D',2.4,.06,4.2,0,.28,0,false);
  for(const z of[-1.4,0,1.4])box(g,'#F2C230',.08,.012,.7,0,.315,z,false);""",
"""  box(g,'#2F5E9E',3.0,.46,4.2,0,-.02,0);
  box(g,'#F4F4F2',3.04,.1,4.24,0,.17,0,false);
  box(g,'#7D858D',2.4,.08,4.16,0,.27,0,false);
  for(const z of[-1.4,0,1.4])box(g,'#F2C230',.08,.01,.7,0,.317,z,false);""")
rep("""  box(g,'#F4F4F2',.55,1.3,1.3,1.38,1.2,0);
  box(g,glassMat,.57,.32,1.32,1.38,1.62,0,false);""","""  box(g,'#F4F4F2',.55,1.3,1.3,1.38,1.2,0);
  box(g,glassMat,.59,.32,1.34,1.38,1.62,0,false);""")
# Kamera-Nahebene: mehr Tiefengenauigkeit
rep("""const buildCam=new THREE.PerspectiveCamera(45,1,.5,800);""","""const buildCam=new THREE.PerspectiveCamera(45,1,1,900);""")
rep("""baseGround.rotation.x=-Math.PI/2; baseGround.position.y=-.01;""","""baseGround.rotation.x=-Math.PI/2; baseGround.position.y=-.02;""")
# Schatten: Sonnenwinkel in Stufen, Schattenkamera am Texelraster
rep("""  const ang=(dayT-.25)*Math.PI*2,elev=Math.sin(ang);
  const sd=new THREE.Vector3(Math.cos(ang),elev,.35).normalize();""",
"""  const ang=Math.round((dayT-.25)*Math.PI*2/.006)*.006,elev=Math.sin(ang);
  const sd=_sd.set(Math.cos(ang),elev,.35).normalize();""")
rep("""  sun.position.copy(focus).addScaledVector(sd,70); sun.target.position.copy(focus);
  moon.intensity=.34*night; moon.position.copy(focus).addScaledVector(sd,-70); moon.target.position.copy(focus);""",
"""  const sh=mode==='build'?clamp(bc.d*.9,30,110):34;
  if(Math.abs(sh-sun.shadow.camera.right)>2){const c=sun.shadow.camera;c.left=c.bottom=-sh;c.right=c.top=sh;c.far=Math.max(220,sh*3);c.updateProjectionMatrix();}
  const tx=2*sun.shadow.camera.right/sun.shadow.mapSize.x;
  _sr.crossVectors(sd,_up);if(_sr.lengthSq()<1e-6)_sr.set(1,0,0);_sr.normalize();_su.crossVectors(_sr,sd).normalize();
  const a=Math.round(focus.dot(_sr)/tx)*tx,b=Math.round(focus.dot(_su)/tx)*tx,cc=focus.dot(sd);
  _sf.copy(_sr).multiplyScalar(a).addScaledVector(_su,b).addScaledVector(sd,cc);
  sun.position.copy(_sf).addScaledVector(sd,70); sun.target.position.copy(_sf);
  moon.intensity=.34*night; moon.position.copy(focus).addScaledVector(sd,-70); moon.target.position.copy(focus);
  moon.visible=night>.03;""")
rep("""  const fogBase=mode==='build'?bc.d:30; scene.fog.near=fogBase+60; scene.fog.far=fogBase+220;
  const sh=mode==='build'?clamp(bc.d*.9,30,110):34;
  if(Math.abs(sh-sun.shadow.camera.right)>2){const c=sun.shadow.camera;c.left=c.bottom=-sh;c.right=c.top=sh;c.far=Math.max(220,sh*3);c.updateProjectionMatrix();}
  return night;""","""  const fogBase=mode==='build'?bc.d:30; scene.fog.near=fogBase+60; scene.fog.far=fogBase+220;
  return night;""")
rep("""function updateDay(dt,focus){""","""const _sd=new THREE.Vector3(),_sr=new THREE.Vector3(),_su=new THREE.Vector3(),_sf=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function updateDay(dt,focus){""")

# Lampen: sanft ein- und ausblenden statt springen, tagsüber ganz aus
rep("""  if(lightPick<=0){
    lightPick=.35;
    const best=[];
    if(night>.05){
      for(const arr of lightMap.values())for(const s of arr){
        const d=(s.x-lp.x)**2+(s.z-lp.z)**2+((s.y-lp.y)**2)*.3;
        if(best.length<LIGHT_N){best.push([d,s]);best.sort((a,b)=>a[0]-b[0]);}
        else if(d<best[LIGHT_N-1][0]){best[LIGHT_N-1]=[d,s];best.sort((a,b)=>a[0]-b[0]);}
      }
    }
    lightPool.forEach((L,k)=>{const s=best[k]?best[k][1]:null;L.userData.src=s;if(s){L.position.set(s.x,s.y,s.z);L.color.setHex(s.c);L.distance=s.d;}});
  }
  for(const L of lightPool){const s=L.userData.src;if(!s){L.intensity=0;continue;}
    let f=1;if(s.f)f=.8+.18*Math.sin(lightTime*13+s.x)+.12*Math.sin(lightTime*29+s.z);
    L.intensity=s.i*night*f;}""",
"""  const want=night>(lightsOn?.03:.07);
  if(want!==lightsOn){lightsOn=want;for(const L of lightPool){L.visible=want;L.intensity=0;L.userData.src=null;L.userData.out=false;}}
  if(lightsOn&&lightPick<=0){
    lightPick=.3;
    const best=[];
    for(const arr of lightMap.values())for(const s of arr){
      const d=(s.x-lp.x)**2+(s.z-lp.z)**2+((s.y-lp.y)**2)*.3;
      if(best.length<LIGHT_N){best.push([d,s]);best.sort((a,b)=>a[0]-b[0]);}
      else if(d<best[LIGHT_N-1][0]){best[LIGHT_N-1]=[d,s];best.sort((a,b)=>a[0]-b[0]);}
    }
    const keep=new Set(best.map(b=>b[1]));
    for(const L of lightPool){const sr=L.userData.src;if(sr&&!keep.has(sr))L.userData.out=true;if(sr&&keep.has(sr))L.userData.out=false;}
    const used=new Set(lightPool.map(L=>L.userData.src).filter(Boolean));
    for(const b of best){const sr=b[1];if(used.has(sr))continue;
      const L=lightPool.find(L=>!L.userData.src);if(!L)break;
      L.userData.src=sr;L.userData.out=false;L.intensity=0;L.position.set(sr.x,sr.y,sr.z);L.color.setHex(sr.c);L.distance=sr.d;used.add(sr);}
  }
  if(lightsOn)for(const L of lightPool){const sr=L.userData.src;if(!sr){L.intensity=0;continue;}
    let f=1;if(sr.f)f=.8+.18*Math.sin(lightTime*13+sr.x)+.12*Math.sin(lightTime*29+sr.z);
    const tg=L.userData.out?0:sr.i*night*f;L.intensity+=(tg-L.intensity)*Math.min(1,dt*(sr.f?14:5));
    if(L.userData.out&&L.intensity<.02){L.intensity=0;L.userData.src=null;L.userData.out=false;}}""")
rep("""let lightPick=0,lightTime=0;""","""let lightPick=0,lightTime=0,lightsOn=false;""")
rep("""for(let k=0;k<LIGHT_N;k++){const L=new THREE.PointLight(0xffd9a0,0,10,1.4);L.position.set(0,-60,0);L.userData.src=null;scene.add(L);lightPool.push(L);}
const headSpot=new THREE.SpotLight(0xfff6e0,0,34,.42,.55,1.1); scene.add(headSpot,headSpot.target);""",
"""for(let k=0;k<LIGHT_N;k++){const L=new THREE.PointLight(0xffd9a0,0,10,1.4);L.position.set(0,-60,0);L.userData.src=null;L.visible=false;scene.add(L);lightPool.push(L);}
const headSpot=new THREE.SpotLight(0xfff6e0,0,34,.42,.55,1.1); headSpot.visible=false; scene.add(headSpot,headSpot.target);""")
rep("""    headSpot.intensity=2.4*night;
  } else headSpot.intensity=0;""","""    headSpot.intensity=2.4*night; headSpot.visible=true;
  } else {headSpot.intensity=0; headSpot.visible=false;}""")

# ===== Leistung =====
# 1. Auflösung passt sich der Bildrate an
rep("""renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;""",
"""let dprMax=Math.min(window.devicePixelRatio||1,2),dpr=Math.min(dprMax,1.5),dprLock=false;
renderer.setPixelRatio(dpr);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;""")
rep("""  const dt=Math.min(.05,(now-last)/1000); last=now;""",
"""  const raw=now-last,dt=Math.min(.05,raw/1000); last=now;
  if(raw>0&&raw<250){perf.acc+=raw;perf.n++;}
  perf.cool-=raw;
  if(perf.n>=50){const avg=perf.acc/perf.n;perf.acc=perf.n=0;
    if(perf.cool<=0&&mode!=='edit'){
      if(avg>23&&dpr>.75){if(perf.raised)dprLock=true;dpr=Math.max(.75,+(dpr-.25).toFixed(2));perf.raised=false;renderer.setPixelRatio(dpr);resize();perf.cool=2500;}
      else if(avg<18&&dpr<dprMax&&!dprLock){dpr=Math.min(dprMax,+(dpr+.25).toFixed(2));perf.raised=true;renderer.setPixelRatio(dpr);resize();perf.cool=5000;}
      else perf.raised=false;
    }}""")
rep("""const focus=new THREE.Vector3(); let last=performance.now(),""","""const perf={acc:0,n:0,cool:3000,raised:false};
const focus=new THREE.Vector3(); let last=performance.now(),""")
# 2. Stillstehende Objekte: keine Matrix-Neuberechnung pro Bild
rep("""  grp.position.set(c.x,0,c.z); grp.rotation.y=o.r*Math.PI/2; scene.add(grp); objM[k]=grp;""",
"""  grp.position.set(c.x,0,c.z); grp.rotation.y=o.r*Math.PI/2; scene.add(grp); objM[k]=grp; freeze(grp);""")
rep("""  scene.add(grp); groundM[k]=grp;
}""","""  scene.add(grp); groundM[k]=grp; freeze(grp);
}
function freeze(grp){grp.updateMatrix();grp.matrixAutoUpdate=false;for(const m of grp.children){m.updateMatrix();if(!m.userData.keep){m.matrixAutoUpdate=false;}}grp.updateMatrixWorld(true);}""")
rep("""p.g.scale.setScalar(Math.max(.05,s));if(t>=1){p.g.scale.setScalar(1);pops.splice(k,1);}}""",
"""p.g.scale.setScalar(Math.max(.05,s));if(t>=1){p.g.scale.setScalar(1);pops.splice(k,1);}if(!p.g.matrixAutoUpdate)p.g.updateMatrix();}""")
# 3. Winzige Objekte werfen keinen Schatten
rep("""      if(k<6){mesh(G('tuft',()=>new THREE.ConeGeometry(.12,.35,5)),'#4FA63C',x,.17,z,g,false);continue;}""",
"""      if(k<6){mesh(G('tuft',()=>new THREE.ConeGeometry(.12,.35,5)),'#4FA63C',x,.17,z,g,false);continue;}
      /* kleine Blüten ohne Schatten */""")

# Bahnhof-UI pro Bild
rep("""  if(mode==='ride')updateRide(dt);""","""  if(mode==='ride')updateRide(dt);
  updateStationUI();""")
open(p,'w').write(s)
print('ok4')
