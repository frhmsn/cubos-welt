import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ---------- CSS ----------
rep("@media (prefers-reduced-motion:reduce)",
"""#travel{position:fixed;inset:0;z-index:12;display:grid;place-items:center;background:radial-gradient(circle at 50% 28%,#2B4C8C,#0D1838 72%);padding-inline:16px;}
#travelCard{width:min(100%,640px);max-height:90vh;overflow-y:auto;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;color:#FFFBF2;touch-action:pan-y;padding-block:16px;}
#travelCard h2{margin:0;font-size:28px;font-weight:700;line-height:1.15;text-wrap:balance;}
#travelCard p{margin:0;font-size:16px;opacity:.88;}
#tvWorlds{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;}
#tvWorlds .wc{color:var(--ink);}
#travelCard .mb{color:var(--ink);}
#codeBox{display:flex;flex-direction:column;gap:8px;}
#codeTxt{width:100%;box-sizing:border-box;min-height:96px;font:12px ui-monospace,Menlo,monospace;border:2px solid #DCCCAB;border-radius:12px;padding:8px;-webkit-user-select:text;user-select:text;touch-action:auto;background:#fff;color:var(--ink);resize:vertical;}
#btnExit.hot{background:var(--sun);box-shadow:inset 0 -4px 0 var(--sun-deep),0 8px 18px rgba(20,40,60,.2);}
@media (prefers-reduced-motion:reduce)""")

# ---------- HTML ----------
rep("""<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>Hupen</button>""",
"""<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg><span id="honkTxt">Hupen</span></button>
  <button class="pill hot" id="btnSail" hidden><svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 14h18l-2.5 4.5h-13z" fill="#fff"/><path d="M8 14V9h6v5M11 9V5.5"/><path d="M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/></svg>Ablegen</button>""")
rep("""    <div class="mrow"><button class="mb" id="mEmpty">Neue leere Wiese</button><button class="mb" id="mSample">Neue Beispielstadt</button></div>
  </div>
</div>""",
"""    <div class="mrow"><button class="mb" id="mEmpty">Neue leere Wiese</button><button class="mb" id="mSample">Neue Beispielstadt</button></div>
    <div class="mrow"><button class="mb" id="mExport">Welt-Code kopieren</button><button class="mb" id="mImport">Welt-Code einfügen</button></div>
    <div id="codeBox" hidden>
      <p id="codeInfo"></p>
      <textarea id="codeTxt" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
      <div class="mrow"><button class="mb go" id="codeGo">Kopieren</button><button class="mb" id="codeClose">Fertig</button></div>
    </div>
  </div>
</div>

<div id="travel" hidden>
  <div id="travelCard">
    <h2 id="tvTitle">Wohin soll die Reise gehen?</h2>
    <p id="tvSub"></p>
    <div id="tvWorlds"></div>
    <div class="mrow"><button class="mb" id="tvNewEmpty">Neue Wiese</button><button class="mb" id="tvNewSample">Neue Stadt</button></div>
    <button class="mb" id="tvStay">Hier bleiben</button>
  </div>
</div>""")

# ---------- Katalog ----------
rep("""  hund:{kind:'animal',label:'Hund',speed:1.7},""",
"""  schiene:{kind:'ground',label:'Gleis',paint:true}, bahnhof:{kind:'ground',label:'Bahnhof'}, uebergang:{kind:'ground',label:'Bahnübergang'},
  tunnel:{kind:'ground',label:'Tunnel'}, zug:{kind:'train',label:'Regionalzug',speed:5.5}, ice:{kind:'train',label:'Schnellzug',speed:8.5},
  anleger:{kind:'ground',label:'Anleger'}, seetor:{kind:'ground',label:'Seetor'}, faehre:{kind:'ferry',label:'Fähre'},
  hund:{kind:'animal',label:'Hund',speed:1.7},""")
rep("""  {id:'auto',label:'Autos',icon:'lambo',items:['lambo','ferrari','polizei','feuerwehrauto','bus']},""",
"""  {id:'auto',label:'Autos',icon:'lambo',items:['lambo','ferrari','polizei','feuerwehrauto','bus']},
  {id:'bahn',label:'Bahn',icon:'zug',items:['schiene','bahnhof','uebergang','tunnel','zug','ice']},
  {id:'see',label:'Wasser',icon:'faehre',items:['wasser','anleger','faehre','seetor']},""")

# ---------- Boden-Modelle ----------
rep("""function groundModel(type,conn){
  const g=new THREE.Group();
  if(type==='wasser'){mesh(BX(TILE,.03,TILE),waterMat,0,0,0,g,false);return g;}""",
r"""/* ---------- Gleise, Bahnhof, Häfen ---------- */
const railMat=M('#9097A0',{metalness:.6,roughness:.35});
const darkMat=new THREE.MeshBasicMaterial({color:0x08090b});
const blinkMat=new THREE.MeshStandardMaterial({color:0x991111,emissive:0xff2020,emissiveIntensity:.1});
const armMat=(()=>{const c=document.createElement('canvas');c.width=64;c.height=8;const x=c.getContext('2d');for(let k=0;k<8;k++){x.fillStyle=k%2?'#FFFFFF':'#D7261E';x.fillRect(k*8,0,8,8);}return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.5});})();
const portalMat=new THREE.MeshBasicMaterial({map:glowTex,color:0x9be7ff,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const signCache={};
function signMat(text,bg){if(signCache[text])return signCache[text];const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,256,64);x.fillStyle='#fff';x.font='bold 38px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,128,35);return signCache[text]=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.6});}
function lsub(g,r){const s=new THREE.Group();s.rotation.y=r*Math.PI/2;g.add(s);return s;}
function lcol(ud,r,cl){
  if(cl[0]==='c'){const q=rot(cl[1],cl[2],r);ud.cols.push(['c',q[0],q[1],cl[3]]);}
  else{const a=rot(cl[1],cl[3],r),b=rot(cl[2],cl[4],r);ud.cols.push(['b',Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]);}
}
function llight(ud,r,x,y,z,c,i,d){const q=rot(x,z,r);ud.lights.push([q[0],y,q[1],c,i,d]);}
function trackPiece(g,x0,z0,x1,z1,yo){
  const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.01)return;
  const s=new THREE.Group();s.position.set((x0+x1)/2,yo||0,(z0+z1)/2);s.rotation.y=Math.atan2(dx,dz);g.add(s);
  box(s,'#A0937F',1.7,.08,L+.04,0,.04,0,false);
  const n=Math.max(1,Math.round(L/.55));
  for(let k=0;k<n;k++)box(s,'#6B4F32',1.35,.06,.2,0,.1,-L/2+(k+.5)*L/n,false);
  for(const x of[-.42,.42])box(s,railMat,.09,.09,L+.04,x,.175,0,false);
}
function railTrack(g,dirs){
  const h=TILE/2;
  if(dirs.length===2&&(dirs[0]+dirs[1])%2===1){
    const a=DIRS[dirs[0]],b=DIRS[dirs[1]],cx=(a[0]+b[0])*h,cz=(a[1]+b[1])*h;let prev=null;
    for(let k=0;k<=6;k++){const t=k/6*Math.PI/2,px=cx+(-b[0]*Math.cos(t)-a[0]*Math.sin(t))*h,pz=cz+(-b[1]*Math.cos(t)-a[1]*Math.sin(t))*h;if(prev)trackPiece(g,prev[0],prev[1],px,pz,k*.001);prev=[px,pz];}
    return;
  }
  if(!dirs.length){trackPiece(g,-h,0,h,0,0);return;}
  const left=new Set(dirs);let n=0;
  for(const d of[0,1]){if(left.has(d)&&left.has(d+2)){const v=DIRS[d];trackPiece(g,-v[0]*h,-v[1]*h,v[0]*h,v[1]*h,n++*.003);left.delete(d);left.delete(d+2);}}
  for(const d of left){const v=DIRS[d],st=dirs.length===1?-.9:0;trackPiece(g,v[0]*st,v[1]*st,v[0]*h,v[1]*h,n++*.003);
    if(dirs.length===1){const pb=box(g,'#D7261E',1.3,.45,.25,-v[0]*1.0,.3,-v[1]*1.0);pb.rotation.y=Math.atan2(v[0],v[1]);}}
}
const stationAxis=rl=>(rl.includes(1)||rl.includes(3))?1:(rl.length?0:1);
function stationBits(g,conn){
  const rl=conn.rail||[],r=stationAxis(rl),ud=g.userData;let sg=1;
  if(conn.side!=null){const q=rot(1,0,r);sg=(q[0]===DIRS[conn.side][0]&&q[1]===DIRS[conn.side][1])?1:-1;}
  const s=lsub(g,r),X=v=>sg*v;
  box(s,'#BFC3C8',1.15,.22,TILE-.04,X(1.43),.11,0);
  box(s,'#F2C230',.1,.012,TILE-.04,X(.93),.226,0,false);
  for(const z of[-1.25,1.25]){box(s,'#4A5058',.1,2.3,.1,X(1.75),1.37,z);lcol(ud,r,['c',X(1.75),z,.14]);}
  box(s,'#2F6BBE',1.35,.1,3.2,X(1.45),2.56,0);
  box(s,'#8B6A45',.4,.08,1.1,X(1.72),.58,0); box(s,'#8B6A45',.06,.36,1.1,X(1.9),.78,0);
  for(const z of[-.45,.45])box(s,'#4A5058',.3,.36,.06,X(1.72),.4,z);
  box(s,signMat('BAHNHOF','#1E5AA8'),.06,.42,1.6,X(1.82),2.2,0);
  mesh(BX(.5,.05,.16),bulbMat,X(1.45),2.49,0,s,false);
  llight(ud,r,X(1.45),2.3,0,0xffe2b0,1.2,8);
  ud.side=rot(X(1.5),0,r);
}
function crossingBits(g,conn){
  const rl=conn.rail||[],rd=conn.dirs||[];
  let r;if(rl.includes(1)||rl.includes(3))r=1;else if(rl.length)r=0;else r=(rd.includes(1)||rd.includes(3))?0:1;
  box(g,'#3D434B',TILE,.4,TILE,0,-.2,0,false);
  const s=lsub(g,r),ud=g.userData;
  box(s,'#6E737A',1.1,.02,TILE,0,.01,0,false);
  for(const x of[-.42,.42])box(s,railMat,.09,.05,TILE,x,.025,0,false);
  for(const [x,z,ry] of [[-1.3,-1.8,0],[1.3,1.8,Math.PI]]){
    box(s,'#F4F4F2',.13,1.15,.13,x,.575,z); lcol(ud,r,['c',x,z,.12]);
    mesh(BX(.17,.17,.07),blinkMat,x,.95,z+(ry?.09:-.09),s,false);
    const arm=mesh(G('arm',()=>{const b=new THREE.BoxGeometry(.09,.09,1.65);b.translate(0,0,.82);return b;}),armMat,x,1.08,z,s,true);
    arm.rotation.y=ry; arm.userData.keep=true; arm.userData.arm=1;
  }
}
function tunnelBits(g,conn){
  const rl=conn.rail||[],r=rl.length?rl[0]:1,s=lsub(g,r),ud=g.userData;
  trackPiece(s,0,-1.2,0,TILE/2,0);
  box(s,'#7A7F86',3.6,3.15,1.5,0,1.57,.2);
  mesh(BX(1.95,2.25,.12),darkMat,0,1.27,.98,s,false);
  box(s,'#9AA0A6',.45,2.75,.4,-1.2,1.37,1.05); box(s,'#9AA0A6',.45,2.75,.4,1.2,1.37,1.05); box(s,'#9AA0A6',2.85,.45,.4,0,2.75,1.05);
  mesh(G('tmount',()=>new THREE.ConeGeometry(2.45,4.8,7)),M('#6E8B4C',{flatShading:true}),0,2.4,-1.6,s);
  mesh(G('tsnow',()=>new THREE.ConeGeometry(.85,1.3,7)),M('#F4F6F8',{flatShading:true}),0,4.2,-1.6,s);
  mesh(G('trock',()=>new THREE.DodecahedronGeometry(.6,0)),M('#8E949B',{flatShading:true}),-1.55,.4,.5,s);
  mesh(G('trock2',()=>new THREE.DodecahedronGeometry(.45,0)),M('#8E949B',{flatShading:true}),1.6,.3,.2,s);
  lcol(ud,r,['b',-2,2,-2,.95]);
}
function seetorBits(g,conn){
  const r=conn.water!=null?conn.water:0,s=lsub(g,r),ud=g.userData;ud.water=r;
  for(const x of[-1.78,1.78]){
    for(let k=0;k<5;k++)mesh(G('tw',()=>new THREE.CylinderGeometry(.32,.36,.72,10)),M(k%2?'#F4F4F2':'#D7261E'),x,.36+k*.72,0,s);
    mesh(G('twtop',()=>new THREE.CylinderGeometry(.22,.22,.35,10)),bulbMat,x,3.78,0,s,false);
    llight(ud,r,x,3.8,0,0xfff0c0,1.3,10); lcol(ud,r,['c',x,0,.4]);
  }
  box(s,'#F4F4F2',3.95,.28,.28,0,4.08,0);
  mesh(G('portalp',()=>new THREE.PlaneGeometry(3.1,3.6)),portalMat,0,1.95,0,s,false);
  for(const [x,z,c] of [[-1.3,1.6,'#D7261E'],[1.3,1.6,'#2E9E4F'],[-1.3,-1.6,'#D7261E'],[1.3,-1.6,'#2E9E4F']])mesh(G('buoy',()=>new THREE.ConeGeometry(.2,.5,8)),c,x,.2,z,s);
}
function anlegerBits(g,conn){
  const r=conn.land!=null?conn.land:0,s=lsub(g,r),ud=g.userData;ud.land=r;
  for(const x of[-1.8,1.8]){
    box(s,'#9B7650',.42,.12,3.7,x,.16,0);
    for(const z of[-1.6,0,1.6])mesh(G('ppost',()=>new THREE.CylinderGeometry(.08,.08,.7,6)),'#5E4632',x,-.1,z,s);
    mesh(G('boll',()=>new THREE.CylinderGeometry(.09,.11,.22,8)),'#2A2A2A',x,.33,-1.2,s);
  }
  box(s,'#9B7650',3.2,.12,.16,0,.16,1.92);
  mesh(G('lpole',()=>new THREE.CylinderGeometry(.06,.08,3.1,8)),'#3D434B',1.8,1.55,1.5,s);
  mesh(BX(.3,.05,.2),bulbMat,1.8,3.08,1.5,s,false); llight(ud,r,1.8,2.9,1.5,0xffd49a,1.3,10);
  box(s,signMat('FÄHRE','#1E8F7E'),.06,.42,1.2,-1.85,1.15,1.5);
  box(s,'#3D434B',.08,.95,.08,-1.85,.48,1.5);
  lcol(ud,r,['c',1.8,1.5,.12]);
}
function groundModel(type,conn){
  const g=new THREE.Group(); g.userData.cols=[]; g.userData.lights=[];
  const water=()=>mesh(BX(TILE,.03,TILE),waterMat,0,0,0,g,false);
  if(type==='wasser'){water();return g;}
  if(type==='anleger'){water();anlegerBits(g,conn);return g;}
  if(type==='seetor'){water();seetorBits(g,conn);return g;}
  if(type==='schiene'){railTrack(g,conn.rail||[]);return g;}
  if(type==='bahnhof'){const rl=conn.rail||[];if(rl.length>=2)railTrack(g,rl);else railTrack(g,stationAxis(rl)?[1,3]:[0,2]);stationBits(g,conn);return g;}
  if(type==='uebergang'){crossingBits(g,conn);return g;}
  if(type==='tunnel'){tunnelBits(g,conn);return g;}""")

# ---------- Weltzustand ----------
rep("""const lightMap=new Map(), garages=new Map(), flames=new Map();
function dropObj(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);garages.delete(grp);flames.delete(grp);}
function resetTiles(nn){
  for(let k=0;k<groundM.length;k++){if(groundM[k]){scene.remove(groundM[k]);disposeGroup(groundM[k]);}dropObj(objM[k]);}
  lightMap.clear();garages.clear();flames.clear();""",
"""const lightMap=new Map(), garages=new Map(), flames=new Map(), crossings=new Map();
const trains=[], ferries=[];
function dropObj(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);garages.delete(grp);flames.delete(grp);}
function dropGround(grp){if(!grp)return;scene.remove(grp);disposeGroup(grp);lightMap.delete(grp);crossings.delete(grp);}
function resetTiles(nn){
  for(let k=0;k<groundM.length;k++){dropGround(groundM[k]);dropObj(objM[k]);}
  lightMap.clear();garages.clear();flames.clear();crossings.clear();
  while(trains.length)removeTrain(trains[0]);
  while(ferries.length)removeFerry(ferries[0]);
  rideTrain=null;""")
rep("""const isRoad=(i,j)=>inb(i,j)&&tiles[I(i,j)].g==='strasse';
function rebuildGround(i,j){
  const k=I(i,j); if(groundM[k]){scene.remove(groundM[k]);disposeGroup(groundM[k]);groundM[k]=null;}
  const t=tiles[k],conn={alt:(i+j)%2===0,dirs:[]};
  if(t.g==='gras')return;
  if(t.g==='strasse')for(let d=0;d<4;d++)if(isRoad(i+DIRS[d][0],j+DIRS[d][1]))conn.dirs.push(d);
  const grp=bake(groundModel(t.g,conn)); const c=center(i,j); grp.position.set(c.x,0,c.z);
  grp.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  scene.add(grp); groundM[k]=grp;
}""",
"""const RAILT=new Set(['schiene','bahnhof','uebergang','tunnel']), ROADT=new Set(['strasse','uebergang']), WATT=new Set(['wasser','anleger','seetor']);
const gAt=(i,j)=>inb(i,j)?tiles[I(i,j)].g:null;
const isRoad=(i,j)=>ROADT.has(gAt(i,j));
const isRail=(i,j)=>RAILT.has(gAt(i,j));
const isWater=(i,j)=>WATT.has(gAt(i,j));
const FLAT=new Set(['strasse','sand','wasser','schiene','uebergang']);
function groundConn(i,j){
  const t=tiles[I(i,j)],conn={alt:(i+j)%2===0,dirs:[],rail:[],land:null,water:null,side:null};
  for(let d=0;d<4;d++){const a=i+DIRS[d][0],b=j+DIRS[d][1];if(isRoad(a,b))conn.dirs.push(d);if(isRail(a,b))conn.rail.push(d);}
  if(t.g==='anleger')for(let d=0;d<4;d++){const a=i+DIRS[d][0],b=j+DIRS[d][1];if(inb(a,b)&&!isWater(a,b)){conn.land=d;break;}}
  if(t.g==='seetor')for(let d=0;d<4;d++){if(isWater(i+DIRS[d][0],j+DIRS[d][1])){conn.water=d;break;}}
  if(t.g==='bahnhof'){const r=stationAxis(conn.rail),cand=r===1?[0,2]:[1,3];
    conn.side=cand.find(d=>{const a=i+DIRS[d][0],b=j+DIRS[d][1];return inb(a,b)&&!isRail(a,b)&&!isWater(a,b)&&!(tiles[I(a,b)].o&&ITEMS[tiles[I(a,b)].o.t].house);});
    if(conn.side==null)conn.side=cand.find(d=>inb(i+DIRS[d][0],j+DIRS[d][1]));if(conn.side==null)conn.side=cand[0];}
  return conn;
}
const _q=new THREE.Quaternion(),_X=new THREE.Vector3(1,0,0);
function setArms(cr,up){cr.up=up;for(const a of cr.arms)a.m.quaternion.copy(a.q0).multiply(_q.setFromAxisAngle(_X,-Math.PI/2*up));}
function rebuildGround(i,j){
  const k=I(i,j); if(groundM[k]){dropGround(groundM[k]);groundM[k]=null;}
  const t=tiles[k]; if(t.g==='gras')return;
  const src=groundModel(t.g,groundConn(i,j)),ud=src.userData;
  const grp=bake(src); const c=center(i,j); grp.position.set(c.x,0,c.z);
  if(FLAT.has(t.g))grp.traverse(o=>{if(o.isMesh&&!o.userData.arm)o.castShadow=false;});
  grp.userData.cols=(ud.cols||[]).map(cl=>toWorld(cl,0,c));
  if(ud.lights&&ud.lights.length)lightMap.set(grp,ud.lights.map(l=>({x:c.x+l[0],y:l[1],z:c.z+l[2],c:l[3],i:l[4],d:l[5],f:0})));
  grp.userData.side=ud.side; grp.userData.land=ud.land; grp.userData.water=ud.water;
  const arms=grp.children.filter(m=>m.userData.arm);
  if(arms.length){const cr={arms:arms.map(m=>({m,q0:m.quaternion.clone()})),x:c.x,z:c.z,up:0,closed:false};crossings.set(grp,cr);setArms(cr,1);}
  scene.add(grp); groundM[k]=grp;
}""")
rep("""function setGround(i,j,g){
  const t=tiles[I(i,j)]; t.g=g;
  if((g==='wasser'||g==='strasse')&&t.o){t.o=null;rebuildObj(i,j);}
  rebuildGround(i,j);
  for(const d of DIRS)if(isRoad(i+d[0],j+d[1]))rebuildGround(i+d[0],j+d[1]);
}""",
"""function setGround(i,j,g){
  const t=tiles[I(i,j)]; t.g=g;
  if(g!=='gras'&&g!=='sand'&&t.o){t.o=null;rebuildObj(i,j);}
  rebuildGround(i,j);
  for(const d of DIRS){const a=i+d[0],b=j+d[1];if(inb(a,b)){const ng=tiles[I(a,b)].g;if(ng!=='gras'&&ng!=='sand')rebuildGround(a,b);}}
}""")
# resolve: ground collisions
rep("""    const i=ti+di,j=tj+dj; if(!inb(i,j))continue;
    for(const c of cols[I(i,j)]){""",
"""    const i=ti+di,j=tj+dj; if(!inb(i,j))continue;
    const gm=groundM[I(i,j)],lists=gm&&gm.userData.cols&&gm.userData.cols.length?[cols[I(i,j)],gm.userData.cols]:[cols[I(i,j)]];
    for(const list of lists)for(const c of list){""")
# expand world: trains, ferries
rep("""  for(const c of cars)if(c.mode==='ai'){c.i+=GROW;c.j+=GROW;}""",
"""  for(const c of cars)if(c.mode==='ai'){c.i+=GROW;c.j+=GROW;}
  const remap=k=>k==null||k<0?k:(Math.floor(k/oN)+GROW)*nN+(k%oN)+GROW;
  for(const tr of trains){tr.i+=GROW;tr.j+=GROW;tr.lastStop=remap(tr.lastStop);tr.stopK=remap(tr.stopK);}
  for(const f of ferries){f.tgt=remap(f.tgt);f.last=remap(f.last);}""")
# animals only on grass/sand
rep("""function animalOk(x,z){const t=tileAt(x,z);if(!t)return false;const tt=tiles[I(t.i,t.j)];if(tt.g==='wasser'||tt.g==='strasse')return false;""",
"""function animalOk(x,z){const t=tileAt(x,z);if(!t)return false;const tt=tiles[I(t.i,t.j)];if(tt.g!=='gras'&&tt.g!=='sand')return false;""")
# objects placed on special ground
rep("""    if(t.g==='wasser'||t.g==='strasse')setGround(i,j,'gras');
    t.o={t:sel,""","""    if(t.g!=='gras'&&t.g!=='sand')setGround(i,j,'gras');
    t.o={t:sel,""")
rep("""    if(t.g==='wasser'||t.g==='strasse')setGround(i,j,'gras');
    const r=(t.o&&t.o.t==='eigen')""","""    if(t.g!=='gras'&&t.g!=='sand')setGround(i,j,'gras');
    const r=(t.o&&t.o.t==='eigen')""")
open(p,'w').write(s)
print('ok1')
