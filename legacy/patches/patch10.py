import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

NEW=['makrele','bonito','mahimahi','barrakuda','schwertfisch','marlin','mondfisch']
LBL={'makrele':'Makrele','bonito':'Bonito','mahimahi':'Mahi-Mahi','barrakuda':'Barrakuda','schwertfisch':'Schwertfisch','marlin':'Marlin','mondfisch':'Mondfisch'}

# ---------- Items ----------
rep("""fx_hai:{kind:'fish',fish:'hai',label:'Hai'},""","""fx_hai:{kind:'fish',fish:'hai',label:'Hai'},
  """+' '.join(f"fx_{k}:{{kind:'fish',fish:'{k}',label:'{LBL[k]}'}}," for k in NEW))
rep("""'fx_thunfisch','fx_hai']},""","""'fx_thunfisch','fx_hai',"""+','.join(f"'fx_{k}'" for k in NEW)+"""]},""")

# ---------- FISH-Daten ----------
rep("""  hai:{label:'Hai',plural:'Haie',len:[1.5,3.5],sil:2.5,speed:1.2,jump:0,uw:1.15,aq:.3,where:'im Meer'}""",
"""  hai:{label:'Hai',plural:'Haie',len:[1.5,3.5],sil:2.5,speed:1.2,jump:0,uw:1.15,aq:.3,where:'im Meer',wow:1},
  makrele:{label:'Makrele',plural:'Makrelen',art:'eine',len:[.25,.5],sil:.7,speed:1.4,jump:1,uw:1.8,aq:.5,rs:1.6,where:'im Meer'},
  bonito:{label:'Bonito',plural:'Bonitos',len:[.4,.8],sil:.9,speed:1.5,jump:1,uw:1.6,aq:.45,rs:1.3,where:'im Meer'},
  mahimahi:{label:'Mahi-Mahi',plural:'Mahi-Mahis',len:[.6,1.6],sil:1.2,speed:1.3,jump:1,uw:1.3,aq:.36,rs:1.1,where:'im Meer'},
  barrakuda:{label:'Barrakuda',plural:'Barrakudas',len:[.6,1.8],sil:1.2,speed:1.4,jump:0,uw:1.2,aq:.32,rs:1,where:'im Meer'},
  schwertfisch:{label:'Schwertfisch',plural:'Schwertfische',len:[1.2,3],sil:2,speed:1.5,jump:1,uw:1,aq:.25,rs:.85,where:'im Meer',wow:1},
  marlin:{label:'Marlin',plural:'Marline',len:[1.5,4],sil:2.4,speed:1.7,jump:1,uw:.95,aq:.23,rs:.8,where:'im Meer',wow:1},
  mondfisch:{label:'Mondfisch',plural:'Mondfische',len:[1,3],sil:1.8,speed:.3,jump:0,uw:1,aq:.28,rs:.9,where:'im Meer',wow:1}""")
rep("""const SEA_FISH=[['thunfisch',.4],['barsch',.25],['hai',.2],['stoer',.15]];""",
"""const SEA_FISH=[['thunfisch',.2],['barsch',.1],['hai',.1],['stoer',.06],['makrele',.14],['bonito',.1],['mahimahi',.08],['barrakuda',.07],['schwertfisch',.05],['marlin',.04],['mondfisch',.06]];""")
rep("""  if(type==='thunfisch'||type==='hai')return g==='meer';return g==='wasser';}""",
"""  if(FISH[type].where==='im Meer')return g==='meer';return g==='wasser';}""")
rep("""F.model.scale.setScalar(F.type==='barsch'""","""F.model.scale.setScalar(FISH[F.type].rs||(F.type==='barsch'""")
rep("""F.type==='thunfisch'?1.1:.9);scene.add(F.model);""","""F.type==='thunfisch'?1.1:.9));scene.add(F.model);""")
rep("""$('#catchTitle').textContent=type==='hai'?'Wow, ein Hai!':(type==='wels'&&len>2)?'Wow, ein Riesen-Wels!':'Du hast einen '+S.label+' gefangen!';""",
"""$('#catchTitle').textContent=S.wow?'Wow, ein '+S.label+'!':(type==='wels'&&len>2)?'Wow, ein Riesen-Wels!':'Du hast '+(S.art||'einen')+' '+S.label+' gefangen!';""")

# ---------- Modelle ----------
rep("""  } else {
    body('#7D8A96',.42,.42,1.6,0,0); body('#F2F4F6',.36,.24,1.4,-.12,0);""","""  } else if(type==='makrele'){
    body('#2F7F8F',.2,.26,1.0,.02,0); body('#E4ECEE',.18,.14,.85,-.08,0);
    for(let k=0;k<6;k++){const b=box(g,'#16343B',.21,.04,.06,0,.09,-.3+k*.12,false);b.rotation.x=(k%2?.5:-.5);}
    const t1=box(g,'#2A5560',.04,.3,.1,0,.12,-.56);t1.rotation.x=-.6;const t2=box(g,'#2A5560',.04,.3,.1,0,-.12,-.56);t2.rotation.x=.6;
    for(const z of[-.3,-.4])box(g,'#F2D24A',.05,.06,.05,0,.14,z,false);
    box(g,'#151515',.22,.05,.05,0,.05,.36,false);
  } else if(type==='bonito'){
    body('#2D4A7A',.28,.34,1.1,.02,0); body('#D5DCE4',.26,.2,.95,-.1,0);
    for(let k=0;k<5;k++){const b=box(g,'#18294A',.29,.04,.4,0,.13,-.15+k*.1,false);b.rotation.x=.9;}
    const t1=box(g,'#2D4A7A',.04,.4,.1,0,.16,-.64);t1.rotation.x=-.6;const t2=box(g,'#2D4A7A',.04,.4,.1,0,-.16,-.64);t2.rotation.x=.6;
    box(g,'#2D4A7A',.04,.18,.22,0,.22,.05);
    box(g,'#151515',.3,.06,.06,0,.06,.4,false);
  } else if(type==='mahimahi'){
    body('#3FA34D',.28,.5,1.3,.04,0); body('#F2C230',.26,.3,1.15,-.14,-.02);
    box(g,'#3FA34D',.26,.56,.2,0,.02,.52);
    box(g,'#2E6FD0',.04,.22,1.05,0,.32,-.05);
    for(const [x,y,z] of[[.14,.05,.2],[-.14,.08,0],[.14,-.02,-.2],[-.14,0,.3],[.14,.12,-.05]])box(g,'#4FA8F0',.02,.05,.05,x,y,z,false);
    const t1=box(g,'#C9A020',.04,.4,.12,0,.16,-.72);t1.rotation.x=-.6;const t2=box(g,'#C9A020',.04,.4,.12,0,-.16,-.72);t2.rotation.x=.6;
    box(g,'#151515',.3,.06,.06,0,.12,.5,false);
  } else if(type==='barrakuda'){
    body('#8D9AA4',.18,.22,1.7,0,0); body('#E6EAEE',.16,.12,1.5,-.06,0);
    for(let k=0;k<7;k++)box(g,'#4A5560',.19,.1,.06,0,.06,-.55+k*.17,false);
    box(g,'#8D9AA4',.1,.07,.4,0,-.01,.92); box(g,'#7A858E',.08,.05,.3,0,-.06,.9);
    box(g,'#4A5560',.04,.16,.14,0,.14,.2); box(g,'#4A5560',.04,.14,.14,0,.12,-.4);
    const t1=box(g,'#4A5560',.04,.3,.1,0,.12,-.9);t1.rotation.x=-.6;const t2=box(g,'#4A5560',.04,.3,.1,0,-.12,-.9);t2.rotation.x=.6;
    box(g,'#151515',.2,.05,.05,0,.05,.68,false);
  } else if(type==='schwertfisch'){
    body('#545A6A',.32,.36,1.5,0,0); body('#C8CCD4',.28,.2,1.3,-.1,0);
    box(g,'#3E4350',.1,.04,1.0,0,.0,1.2);
    const d=box(g,'#3E4350',.04,.5,.24,0,.32,.3);d.rotation.x=-.4;
    for(const x of[-.18,.18]){const pf=box(g,'#3E4350',.3,.04,.18,x,-.12,.35);pf.rotation.z=x>0?-.5:.5;}
    const t1=box(g,'#3E4350',.04,.6,.12,0,.24,-.86);t1.rotation.x=-.7;const t2=box(g,'#3E4350',.04,.6,.12,0,-.24,-.86);t2.rotation.x=.7;
    box(g,'#151515',.34,.07,.07,0,.06,.6,false);
  } else if(type==='marlin'){
    body('#24477A',.32,.38,1.6,0,0); body('#EEF2F6',.28,.2,1.4,-.12,0);
    for(let k=0;k<7;k++)box(g,'#7FB8E8',.33,.22,.05,0,.0,-.5+k*.15,false);
    box(g,'#1B3560',.06,.06,.9,0,.02,1.2);
    box(g,'#1E3A8A',.04,.5,.85,0,.4,.05); box(g,'#3A64C8',.045,.12,.85,0,.6,.05,false);
    const t1=box(g,'#1B3560',.04,.7,.12,0,.28,-.92);t1.rotation.x=-.7;const t2=box(g,'#1B3560',.04,.7,.12,0,-.28,-.92);t2.rotation.x=.7;
    box(g,'#151515',.34,.07,.07,0,.06,.64,false);
  } else if(type==='mondfisch'){
    body('#A7AFB6',.24,1.15,1.0,0,0); body('#D9DEE2',.2,.7,.75,-.15,.05);
    box(g,'#8D959C',.05,.75,.2,0,.8,-.25); box(g,'#8D959C',.05,.75,.2,0,-.8,-.25);
    box(g,'#9CA4AB',.06,1.0,.12,0,0,-.5);
    box(g,'#8D959C',.12,.08,.06,0,-.02,.5,false);
    box(g,'#151515',.26,.08,.08,0,.18,.34,false);
  } else {
    body('#7D8A96',.42,.42,1.6,0,0); body('#F2F4F6',.36,.24,1.4,-.12,0);""")

# ---------- Aquarium: mehr Platz, alle Arten ----------
rep("""  const list=[];for(const k of Object.keys(FISH))for(let q=0;q<Math.min(catchBook[k]||0,6);q++)list.push(k);
  list.slice(0,34).forEach(type=>{""","""  const kinds=Object.keys(FISH).filter(k=>catchBook[k]>0),per=Math.max(2,Math.min(6,Math.floor(42/Math.max(1,kinds.length))));
  const list=[];for(const k of kinds)for(let q=0;q<Math.min(catchBook[k],per);q++)list.push(k);
  list.slice(0,42).forEach(type=>{""")

# ---------- Aquarium-Liste schrumpft zum Knopf ----------
rep("""  <div id="aqList"></div>
</div>""","""  <div id="aqList"></div>
  <span id="aqMini"></span>
</div>""")
rep("""#aqList{display:flex;""","""#aqPanel{cursor:pointer;transition:width .25s,padding .25s;}
#aqMini{display:none;font-size:16px;font-weight:700;padding-right:6px;}
#aqPanel.mini{width:auto;padding:6px;border-radius:40px;gap:8px;}
#aqPanel.mini .stTx,#aqPanel.mini #aqList{display:none;}
#aqPanel.mini #aqMini{display:block;}
#aqPanel.mini .stIc{width:44px;height:44px;}
#aqList{display:flex;""")
rep("""  if(!aq){P.hidden=true;return;}
  const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0);""","""  clearTimeout(aqTimer);
  if(!aq){P.hidden=true;return;}
  const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0);
  $('#aqMini').textContent=tot?tot+(tot===1?' Fisch':' Fische'):'Leer';
  P.classList.remove('mini');aqTimer=setTimeout(()=>P.classList.add('mini'),4500);""")
rep("""let aqShown=null;""","""let aqShown=null,aqTimer=0;
$('#aqPanel').addEventListener('click',()=>{ac();const P=$('#aqPanel');clearTimeout(aqTimer);
  if(P.classList.contains('mini')){P.classList.remove('mini');plop();aqTimer=setTimeout(()=>P.classList.add('mini'),6000);}else{P.classList.add('mini');}});""")

# ---------- Wale ----------
WH=r"""
/* ---------- Wale ---------- */
const WHALE={
  buckelwal:{label:'Buckelwal',plural:'Buckelwale',sc:1,uw:.55},
  pottwal:{label:'Pottwal',plural:'Pottwale',sc:1,uw:.55},
  orca:{label:'Orca',plural:'Orcas',sc:.75,uw:.7}
};
let whaleBook={};for(const k of Object.keys(WHALE))whaleBook[k]=0;try{const c=JSON.parse(localStorage.getItem('kunos-wale')||'null');if(c)whaleBook=Object.assign(whaleBook,c);}catch(e){}
function whaleModel(type){
  const g=new THREE.Group();
  const ell=(c,sx,sy,sz,x,y,z)=>{const m=mesh(G('wb',()=>new THREE.IcosahedronGeometry(.5,2)),M(c,{flatShading:true}),x||0,y,z,g);m.scale.set(sx,sy,sz);return m;};
  const fluke=(c,w,z)=>{for(const x of[-1,1]){const f=box(g,c,w,.08,.7,x*w*.42,0,z);f.rotation.y=x*.35;}box(g,c,.3,.1,.5,0,0,z+.2);};
  if(type==='buckelwal'){
    ell('#3A4250',2.2,1.9,7,0,0,0); ell('#D9DDE2',1.9,1.1,6.2,0,-.45,.2);
    for(let k=0;k<6;k++)box(g,'#C2C7CD',.06,.05,2.4,(k-2.5)*.2,-.92,1.4,false);
    for(const x of[-1,1]){const f=box(g,'#E4E7EA',2.8,.12,.55,x*2.1,-.4,1.2);f.rotation.set(0,x*.5,x*-.35);}
    box(g,'#3A4250',.18,.35,.5,0,.95,-1.6);
    ell('#3A4250',1,1,3,0,.05,-3.6); fluke('#3A4250',1.6,-5);
    for(const x of[-.75,.75])box(g,'#151515',.1,.12,.12,x,-.1,2.3,false);
  } else if(type==='pottwal'){
    box(g,'#4A4440',2,2,3.4,0,.15,2.2); ell('#4A4440',2.1,2,6,0,0,-.6);
    box(g,'#3A3430',.6,.3,2.8,0,-.95,2.1);
    for(let k=0;k<5;k++)box(g,'#EDE6D6',.05,.12,.05,.15,-.8,1.2+k*.5,false);
    box(g,'#4A4440',.3,.3,.8,0,.95,-1.8);
    for(const x of[-1,1]){const f=box(g,'#3A3430',.9,.1,.4,x*1.1,-.5,1);f.rotation.y=x*.6;}
    ell('#4A4440',1,1,2.8,0,0,-3.9); fluke('#3A3430',1.5,-5.2);
    for(const x of[-1.01,1.01])box(g,'#151515',.05,.12,.12,x,-.2,1.2,false);
  } else {
    ell('#15171A',1.7,1.8,6,0,0,0); ell('#F4F4F2',1.4,.9,4.6,0,-.5,.6);
    for(const x of[-.7,.7])box(g,'#F4F4F2',.08,.4,.9,x*1.0,.25,1.9,false);
    box(g,'#C9CCD0',1.2,.4,.9,0,.75,-.6,false);
    const d=box(g,'#15171A',.15,1.9,.7,0,1.6,-.2);d.rotation.x=-.15;
    for(const x of[-1,1]){const f=box(g,'#15171A',1.2,.1,.7,x*1.1,-.5,1.1);f.rotation.y=x*.4;}
    ell('#15171A',.8,.8,2.6,0,0,-3.1); fluke('#15171A',1.3,-4.4);
  }
  return bake(g);
}
const whales=[],spouts=[];
const spoutGeo=new THREE.SphereGeometry(.22,6,5),spoutMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false});
function seaAt(x,z){const t=tileAt(x,z);return !!t&&gAt(t.i,t.j)==='meer';}
function whaleOk(x,z){if(!seaAt(x,z))return false;for(let a=0;a<8;a++){const r=a%2?5.5:4.2;if(!seaAt(x+Math.cos(a*.785)*r,z+Math.sin(a*.785)*r))return false;}return true;}
function addWhale(type,x,z){
  const sil=new THREE.Mesh(silGeo,silMat);sil.scale.set(5*WHALE[type].sc,1,8*WHALE[type].sc);sil.position.set(x,.03,z);scene.add(sil);
  const m=whaleModel(type);m.scale.setScalar(WHALE[type].sc);m.visible=false;scene.add(m);
  const w={type,x,z,h:Math.random()*6.3,tx:x,tz:z,st:'swim',t:0,next:5+Math.random()*10,m,sil,y:-3,pitch:0,seen:false,blow:0};whales.push(w);return w;
}
function removeWhale(w){const k=whales.indexOf(w);if(k<0)return;scene.remove(w.sil);scene.remove(w.m);disposeGroup(w.m);whales.splice(k,1);}
function blowSound(){const a=ac();if(!a)return;const len=a.sampleRate*1.1,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(let q=0;q<len;q++){const t=q/len;d[q]=(Math.random()*2-1)*Math.min(1,t*12)*(1-t)**2;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=buf;f.type='bandpass';f.frequency.value=900;f.Q.value=.6;g.gain.value=.35;s.connect(f).connect(g).connect(a.destination);s.start();}
function spout(w){
  const sc=WHALE[w.type].sc,hx=w.x+Math.sin(w.h)*2*sc,hz=w.z+Math.cos(w.h)*2*sc;
  for(let q=0;q<16&&spouts.length<60;q++){const m=new THREE.Mesh(spoutGeo,spoutMat.clone());m.position.set(hx,.8,hz);scene.add(m);
    spouts.push({m,vx:(Math.random()-.5)*1.2,vy:5+Math.random()*3,vz:(Math.random()-.5)*1.2,t:0});}
  if(nearFocus(w.x,w.z,40)){blowSound();
    if(!w.seen){w.seen=true;whaleBook[w.type]++;try{localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}
      if(curCat==='fang')renderItems();hint('Ein '+WHALE[w.type].label+'! Pffffff! Schau, wie er pustet.',3500);}}
}
function whaleTarget(w){for(let q=0;q<12;q++){const a=Math.random()*6.283,r=8+Math.random()*16,nx=w.x+Math.cos(a)*r,nz=w.z+Math.sin(a)*r;if(whaleOk(nx,nz)){w.tx=nx;w.tz=nz;return;}}w.tx=w.x;w.tz=w.z;}
let whaleCheck=0;
function updateWhales(dt){
  whaleCheck-=dt;
  if(whaleCheck<=0){whaleCheck=4;
    const sea=[];for(let k=0;k<N*N;k++)if(tiles[k].g==='meer')sea.push(k);
    const want=Math.min(3,Math.floor(sea.length/30));
    if(whales.length<want){for(let q=0;q<15;q++){const k=sea[Math.floor(Math.random()*sea.length)],c=center(k%N,(k/N)|0);
      if(whaleOk(c.x,c.z)){const ty=Object.keys(WHALE),has=new Set(whales.map(w=>w.type)),free=ty.filter(t=>!has.has(t));addWhale((free.length?free:ty)[Math.floor(Math.random()*(free.length||ty.length))],c.x,c.z);break;}}}
  }
  for(const w of whales.slice()){
    if(!whaleOk(w.x,w.z)&&!seaAt(w.x,w.z)){removeWhale(w);continue;}
    w.t+=dt;
    const sp=w.st==='swim'?1.1:.7;
    let dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);
    if(d<1)whaleTarget(w),dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);
    if(d>.1){w.h+=clamp(angDiff(Math.atan2(dx,dz),w.h),-.35*dt,.35*dt);
      const nx=w.x+Math.sin(w.h)*sp*dt,nz=w.z+Math.cos(w.h)*sp*dt;if(whaleOk(nx,nz)){w.x=nx;w.z=nz;}else whaleTarget(w);}
    const sc=WHALE[w.type].sc;let yT=-3,pT=0;
    if(w.st==='swim'){if(w.t>w.next){w.st='up';w.t=0;}}
    else if(w.st==='up'){yT=-.65*sc;pT=-.05;
      if(w.blow<1&&w.t>1.6){w.blow=1;spout(w);} if(w.blow<2&&w.t>4){w.blow=2;spout(w);}
      if(w.t>6){w.st='down';w.t=0;}}
    else if(w.st==='down'){const k=Math.min(1,w.t/3);pT=.75*Math.sin(Math.PI*Math.min(1,k*1.1));yT=-.65*sc-k*3;
      if(w.t>3.4){w.st='swim';w.t=0;w.blow=0;w.next=10+Math.random()*14;}}
    const ease=w.st==='down'?1:Math.min(1,dt*1.2);w.y+=(yT-w.y)*(w.st==='down'?Math.min(1,dt*3):ease);w.pitch+=(pT-w.pitch)*Math.min(1,dt*2.5);
    const vis=w.y>-2.6&&nearFocus(w.x,w.z,70);
    w.m.visible=vis;if(vis){w.m.position.set(w.x,w.y,w.z);w.m.rotation.set(w.pitch,w.h,0,'YXZ');}
    w.sil.visible=!vis||w.y<-1.6;w.sil.position.set(w.x,.03,w.z);w.sil.rotation.y=w.h+Math.sin(lightTime*.8+w.x)*.04;
  }
  for(let k=spouts.length-1;k>=0;k--){const p=spouts[k];p.t+=dt;p.vy-=7*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;
    const s=1+p.t*2.2;p.m.scale.setScalar(s);p.m.material.opacity=Math.max(0,.8-p.t*.55);
    if(p.t>1.5||p.m.position.y<0){scene.remove(p.m);p.m.material.dispose();spouts.splice(k,1);}}
}
"""
rep("""let fishing=null;
const fishLine=""",WH+"""
let fishing=null;
const fishLine=""")
rep("""    updateFish(dt); updateFishing(dt);""","""    updateFish(dt); updateWhales(dt); updateFishing(dt);""")
rep("""  while(fishes.length)removeFish(fishes[0]);
  rideTrain=null;""","""  while(fishes.length)removeFish(fishes[0]);
  while(whales.length)removeWhale(whales[0]);
  rideTrain=null;""")

# Unterwasser
rep("""  for(const [f,m] of under.models)if(!seen.has(f)){underScene.remove(m);disposeGroup(m);under.models.delete(f);}""",
"""  for(const w of whales){let m=under.models.get(w);
    if(!m){m=whaleModel(w.type);m.scale.setScalar(WHALE[w.type].uw);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});underScene.add(m);under.models.set(w,m);}
    seen.add(w);m.position.set(w.x,Math.max(-2.4,Math.min(-1.3,w.y*.5-1.3)),w.z);m.rotation.set(w.pitch*.5,w.h,0,'YXZ');
    if(!w.seen&&(w.x-car.x)**2+(w.z-car.z)**2<100){w.seen=true;whaleBook[w.type]++;try{localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}hint('Ein '+WHALE[w.type].label+' direkt neben dir!',3500);tone(160,1.2,'sine',.06,0,.6);}}
  for(const [f,m] of under.models)if(!seen.has(f)){underScene.remove(m);disposeGroup(m);under.models.delete(f);}""")

# Fang-Übersicht: Wale
rep("""    const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0),info=document.createElement('div');info.className='fangsum';""",
"""    for(const wt of Object.keys(WHALE)){
      const n=whaleBook[wt]||0,b=document.createElement('button');b.className='it fang'+(n?'':' none');
      b.innerHTML=`<span class="ball">${thumbs['W_'+wt]?`<img alt="" src="${thumbs['W_'+wt]}">`:''}${n?`<span class="cnt">${n}</span>`:''}</span><span>${n?WHALE[wt].label:'???'}</span><small>${n?'gesehen':'noch nicht gesehen'}</small>`;
      b.addEventListener('click',()=>{ac();plop();hint(n?`${n} ${n===1?WHALE[wt].label:WHALE[wt].plural} gesehen. Wale kann man nicht angeln, nur bestaunen!`:'Wale leben im großen Meer. Mal ein riesiges Meer und halte Ausschau nach der Fontäne!',3800);});
      el.appendChild(b);
    }
    const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0),info=document.createElement('div');info.className='fangsum';""")
rep("""    R.render(S,C);thumbs['F_'+ft]=thumbs['fx_'+ft]=R.domElement.toDataURL('image/png');S.remove(obj);
  }""","""    R.render(S,C);thumbs['F_'+ft]=thumbs['fx_'+ft]=R.domElement.toDataURL('image/png');S.remove(obj);
  }
  for(const wt of Object.keys(WHALE)){
    const obj=whaleModel(wt);obj.rotation.y=Math.PI/2;S.add(obj);obj.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(obj),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
    C.position.copy(ct).addScaledVector(new THREE.Vector3(.25,.35,1).normalize(),sz.length()/2/Math.sin(15*Math.PI/180)*.9);C.lookAt(ct);
    R.render(S,C);thumbs['W_'+wt]=R.domElement.toDataURL('image/png');S.remove(obj);disposeGroup(obj);
  }""")
open(p,'w').write(s)
print('ok10')
