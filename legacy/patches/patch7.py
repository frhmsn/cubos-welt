import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

rep("""garage:{kind:'obj',label:'Garage',house:true},""","""garage:{kind:'obj',label:'Garage',house:true}, aquarium:{kind:'obj',label:'Aquarium',house:true},""")
rep("""items:['eigen','haus','villa','hochhaus','feuerwache','garage']},""","""items:['eigen','haus','villa','hochhaus','feuerwache','garage','aquarium']},""")

# ---------- Modell ----------
rep("""function glow(g,mat,x,z,r){""","""const tankWater=new THREE.MeshStandardMaterial({color:0x48B4E0,transparent:true,opacity:.3,roughness:.1,depthWrite:false});
const tankGlass=new THREE.MeshStandardMaterial({color:0xdff4ff,transparent:true,opacity:.12,roughness:.05,depthWrite:false});
MODELS.aquarium=function(seed){
  const g=new THREE.Group(),cols=[],w=3.6,d=3.6,h=3.2,hd=d/2;
  shell(g,cols,{w,d,h,wall:'#8ED8E8',doorW:1.2,doorH:2.2,winW:.6,winY:1.7,floor:'#5E8FA8'});
  box(g,'#2F7FA0',w+.3,.22,d+.3,0,h+.11,0);
  box(g,'#F4F4F2',w+.34,.1,d+.34,0,h+.27,0,false);
  const big=fishModel('thunfisch');big.scale.setScalar(1.7);big.position.set(0,h+1.05,0);big.rotation.set(0,Math.PI/2,.25);g.add(big);
  box(g,'#3A3F46',.12,.7,.12,0,h+.55,0);
  box(g,signMat('AQUARIUM','#1E8F9E'),2.2,.45,.08,0,h-.4,hd+.05);
  /* Becken an der Rückwand */
  const tz=-1.27;
  box(g,'#3A3F46',3.24,.6,.82,0,.3,tz);
  box(g,'#E8D9A8',3.1,.14,.7,0,.67,tz,false);
  mesh(BX(3.1,2.0,.7),tankWater,0,1.74,tz,g,false);
  mesh(BX(3.14,2.04,.04),tankGlass,0,1.74,tz+.37,g,false);
  box(g,'#3A3F46',3.24,.16,.82,0,2.82,tz);
  for(const x of[-1.6,1.6])box(g,'#3A3F46',.08,2.3,.82,x,1.74,tz);
  const r=mulberry(9);
  for(let k=0;k<9;k++){const x=-1.4+k*.35+(r()-.5)*.1;const m=mesh(G('tweed',()=>new THREE.ConeGeometry(.07,.9,4)),M('#2E8B57',{flatShading:true}),x,.74+.4,tz-.2+(r()-.5)*.2,g,false);m.scale.y=.6+r()*.8;}
  for(const [x,c] of [[-1.1,'#F27C9B'],[.3,'#F2A541'],[1.2,'#B57BE0']]){const m=mesh(G('tcor',()=>new THREE.IcosahedronGeometry(.16,0)),M(c,{flatShading:true}),x,.82,tz+.12,g,false);m.scale.set(1.2,1.5,1);}
  mesh(G('trk',()=>new THREE.DodecahedronGeometry(.2,0)),M('#7D8288',{flatShading:true}),-.4,.8,tz+.05,g,false);
  const names=['BARSCH','THUNFISCH','HAI'];
  names.forEach((n,k)=>box(g,signMat(n,'#2A3442'),.8,.2,.03,-1.05+k*1.05,.38,tz+.42,false));
  mesh(BX(2.9,.05,.12),M('#BFE9FF',{emissive:'#7FD8FF',emissiveIntensity:.8}),0,2.76,tz,g,false);
  box(g,'#8B6A45',1.6,.08,.4,0,.48,.45); for(const x of[-.7,.7])box(g,'#5E4632',.08,.44,.36,x,.22,.45);
  cols.push(['b',-1.65,1.65,tz-.42,tz+.42],['b',-.85,.85,.25,.65]);
  return {g,cols,lights:[[0,2.6,tz+.3,0x7fd8ff,1.3,6],[0,2.7,.8,0xffe2b0,1.1,6.5]],tank:true};
};
function glow(g,mat,x,z,r){""")

# ---------- Fische im Becken ----------
rep("""const lightMap=new Map(), garages=new Map(), flames=new Map(), crossings=new Map();""",
"""const lightMap=new Map(), garages=new Map(), flames=new Map(), crossings=new Map(), aquariums=new Map();""")
rep("""function dropObj(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);garages.delete(grp);flames.delete(grp);}""",
"""function dropObj(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);garages.delete(grp);flames.delete(grp);const aq=aquariums.get(grp);if(aq){clearAquarium(aq);aquariums.delete(grp);}}""")
rep("""  lightMap.clear();garages.clear();flames.clear();crossings.clear();""","""  for(const aq of aquariums.values())clearAquarium(aq);
  lightMap.clear();garages.clear();flames.clear();crossings.clear();aquariums.clear();""")
rep("""  const fl=grp.children.filter(m=>m.userData.flame); if(fl.length)flames.set(grp,fl);""",
"""  const fl=grp.children.filter(m=>m.userData.flame); if(fl.length)flames.set(grp,fl);
  if(mdl.tank){const aq={x:c.x,z:c.z,r:o.r,fish:[]};aquariums.set(grp,aq);fillAquarium(aq);}""")
AQ=r"""
/* ---------- Aquarium-Becken ---------- */
const TANK={z:-1.27,x:1.35,y0:.95,y1:2.5};
function clearAquarium(aq){for(const f of aq.fish){scene.remove(f.m);disposeGroup(f.m);}aq.fish=[];}
function fillAquarium(aq){
  clearAquarium(aq);
  const list=[];for(const k of Object.keys(FISH))for(let q=0;q<Math.min(catchBook[k]||0,4);q++)list.push(k);
  const sc={barsch:.55,thunfisch:.36,hai:.3};
  list.slice(0,10).forEach((type,k)=>{
    const m=fishModel(type);m.scale.setScalar(sc[type]);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});scene.add(m);
    aq.fish.push({m,type,lx:(Math.random()*2-1)*TANK.x,ly:TANK.y0+Math.random()*(TANK.y1-TANK.y0),lz:TANK.z+(Math.random()-.5)*.3,dir:Math.random()<.5?-1:1,ang:0,sp:type==='barsch'?.35:type==='thunfisch'?.6:.45,ph:Math.random()*6,ty:0});
  });
  aq.fish.forEach(f=>{f.ang=f.dir>0?Math.PI/2:-Math.PI/2;f.ty=f.ly;});
}
function refreshAquariums(){for(const aq of aquariums.values())fillAquarium(aq);}
function updateAquariums(dt){
  for(const aq of aquariums.values()){
    if(!nearFocus(aq.x,aq.z,45))continue;
    for(const f of aq.fish){
      f.lx+=f.dir*f.sp*dt;if(Math.abs(f.lx)>TANK.x){f.dir=-Math.sign(f.lx);f.lx=Math.sign(f.lx)*TANK.x;f.ty=TANK.y0+Math.random()*(TANK.y1-TANK.y0);}
      f.ly+=(f.ty-f.ly)*Math.min(1,dt*.8);f.ph+=dt*6;
      const want=f.dir>0?Math.PI/2:-Math.PI/2;f.ang+=angDiff(want,f.ang)*Math.min(1,dt*4);
      const p=rot(f.lx,f.lz,aq.r);
      f.m.position.set(aq.x+p[0],f.ly+Math.sin(f.ph*.4)*.05,aq.z+p[1]);f.m.rotation.set(0,f.ang+aq.r*Math.PI/2+Math.sin(f.ph)*.15,0);
    }
  }
}
function insideAquarium(){
  if(mode!=='walk')return null;
  for(const aq of aquariums.values()){if(Math.abs(pl.x-aq.x)<1.75&&Math.abs(pl.z-aq.z)<1.75)return aq;}
  return null;
}
let aqShown=null;
function updateAquaUI(){
  const aq=insideAquarium(),P=$('#aqPanel');
  if(aq===aqShown)return;aqShown=aq;
  if(!aq){P.hidden=true;return;}
  const tot=Object.keys(FISH).reduce((a,k)=>a+(catchBook[k]||0),0);
  $('#aqSub').textContent=tot?'Hier schwimmen die Fische, die du gefangen hast:':'Das Becken ist noch leer. Fahr mit dem Fischerboot raus und fang Fische!';
  const L=$('#aqList');L.innerHTML='';
  for(const k of Object.keys(FISH)){const n=catchBook[k]||0;if(!n)continue;
    const d=document.createElement('div');d.className='aqF';d.innerHTML=`${thumbs['F_'+k]?`<img alt="" src="${thumbs['F_'+k]}">`:''}<span><b>${n}</b> ${n===1?FISH[k].label:FISH[k].plural}</span>`;L.appendChild(d);}
  P.hidden=false;tone(660,.12,'sine',.06);tone(880,.16,'sine',.06,.1);
}
"""
rep("""/* ---------- Weltreise ---------- */""",AQ+"""
/* ---------- Weltreise ---------- */""")
rep("""  if(curCat==='fang')renderItems();""","""  if(curCat==='fang')renderItems();
  refreshAquariums();aqShown=undefined;""")
rep("""  updateStationUI();""","""  updateStationUI(); updateAquaUI(); updateAquariums(dt);""")

# ---------- Panel ----------
rep("""<div id="stPanel" hidden>""","""<div id="aqPanel" hidden>
  <div class="stIc" style="background:#1E8F9E"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c3-4 8-4 12 0-4 4-9 4-12 0z"/><path d="M15 12l5-3v6z"/><circle cx="7.5" cy="11.3" r=".8" fill="#fff"/></svg></div>
  <div class="stTx"><b>Dein Aquarium</b><span id="aqSub"></span></div>
  <div id="aqList"></div>
</div>
<div id="stPanel" hidden>""")
rep("""#stPanel .stBtns .pill[hidden]{display:none!important;}""","""#stPanel .stBtns .pill[hidden]{display:none!important;}
#aqPanel{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 76px);transform:translateX(-50%);z-index:6;width:min(calc(100% - 32px),480px);box-sizing:border-box;
  background:var(--tray-solid);border-radius:24px;padding:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;box-shadow:0 10px 30px rgba(20,40,60,.25);}
#aqPanel .stIc{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;}
#aqPanel .stIc svg{width:32px;height:32px;}
#aqPanel .stTx{flex:1 1 160px;min-width:0;display:flex;flex-direction:column;gap:2px;}
#aqPanel .stTx b{font-size:19px;font-weight:700;line-height:1.15;}
#aqPanel .stTx span{font-size:14px;color:#4A5563;line-height:1.3;}
#aqList{display:flex;gap:8px;flex:1 1 100%;flex-wrap:wrap;}
#aqList:empty{display:none;}
.aqF{display:flex;align-items:center;gap:6px;background:#E6F5FA;border-radius:16px;padding:4px 12px 4px 4px;font-size:14px;}
.aqF img{width:44px;height:44px;border-radius:50%;background:#fff;}
.aqF b{font-variant-numeric:tabular-nums;}""")
open(p,'w').write(s)
print('ok7')
