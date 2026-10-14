import sys,re
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ----- neues Modell: runder Kuppelbau -----
a=s.index("MODELS.aquarium=function(seed){")
b=s.index("};",a)+2
s=s[:a]+r"""const AQ_R=5.6,AQ_H=4.4,AQ_GAP=.48;
MODELS.aquarium=function(seed){
  const g=new THREE.Group(),cols=[],R=AQ_R,H=AQ_H,gap=AQ_GAP,DS=THREE.DoubleSide;
  const wallM=M('#BFEAF2',{side:DS}),inM=M('#E8F6FA',{side:DS}),trim=M('#2F7FA0');
  mesh(G('aqw1',()=>new THREE.CylinderGeometry(R,R,H,56,1,true,gap/2,Math.PI*2-gap)),wallM,0,H/2,0,g);
  mesh(G('aqw2',()=>new THREE.CylinderGeometry(R-.25,R-.25,H,56,1,true,gap/2,Math.PI*2-gap)),inM,0,H/2,0,g,false);
  mesh(G('aqwin',()=>new THREE.CylinderGeometry(R+.03,R+.03,.75,56,1,true,gap/2+.2,Math.PI*2-gap-.4)),winMat,0,3.1,0,g,false);
  mesh(G('aqbase',()=>new THREE.CylinderGeometry(R+.05,R+.05,.35,56,1,true,gap/2,Math.PI*2-gap)),trim,0,.17,0,g,false);
  mesh(G('aqcap',()=>{const r=new THREE.RingGeometry(R-.3,R+.2,56);r.rotateX(-Math.PI/2);return r;}),trim,0,H+.01,0,g);
  const dome=mesh(G('aqdome',()=>new THREE.SphereGeometry(R+.1,48,14,0,Math.PI*2,0,Math.PI/2)),M('#5FC3DA',{side:DS,roughness:.35}),0,H,0,g);dome.scale.y=.42;
  mesh(G('aqdome2',()=>new THREE.SphereGeometry(1.4,24,8,0,Math.PI*2,0,Math.PI/2)),M('#F4F4F2'),0,H+R*.42-.35,0,g).scale.y=.5;
  const big=fishModel('thunfisch');big.scale.setScalar(2.6);big.position.set(0,H+R*.42+1.1,0);big.rotation.set(0,Math.PI/2,.3);g.add(big);
  box(g,'#3A3F46',.16,1,.16,0,H+R*.42+.3,0);
  for(const sg of[-1,1]){const an=sg*gap/2,j=box(g,trim,.35,H,.45,Math.sin(an)*(R-.1),H/2,Math.cos(an)*(R-.1));j.rotation.y=an;}
  box(g,trim,2*R*Math.sin(gap/2)+.4,.8,.45,0,H-.4,R-.1);
  box(g,signMat('AQUARIUM','#1E8F9E'),3.4,.62,.1,0,H+.25,R+.08);
  mesh(G('aqfloor',()=>{const c=new THREE.CircleGeometry(R-.25,56);c.rotateX(-Math.PI/2);return c;}),M('#4F7FA0'),0,.02,0,g,false);
  mesh(G('aqpath',()=>{const c=new THREE.RingGeometry(3.2,3.6,56);c.rotateX(-Math.PI/2);return c;}),M('#8CC8DC'),0,.03,0,g,false);
  box(g,'#7A5A3A',2.6,.02,.9,0,.015,R+.5,false);
  /* rundes Becken */
  mesh(G('tkbase',()=>new THREE.CylinderGeometry(2.75,2.9,.55,44)),'#2A3442',0,.27,0,g);
  mesh(G('tksand',()=>new THREE.CylinderGeometry(2.45,2.45,.14,44)),'#E8D9A8',0,.61,0,g,false);
  mesh(G('tkwater',()=>new THREE.CylinderGeometry(2.45,2.45,3.3,44,1,true)),tankWater,0,2.33,0,g,false);
  mesh(G('tkglass',()=>new THREE.CylinderGeometry(2.55,2.55,3.5,44,1,true)),tankGlass,0,2.3,0,g,false);
  mesh(G('tktop',()=>new THREE.CylinderGeometry(2.75,2.75,.3,44)),'#2A3442',0,4.12,0,g);
  mesh(G('tklight',()=>{const r=new THREE.RingGeometry(1.6,2.45,44);r.rotateX(Math.PI/2);return r;}),M('#BFE9FF',{emissive:'#7FD8FF',emissiveIntensity:.9,side:DS}),0,3.96,0,g,false);
  const r=mulberry(21),cor=['#F27C9B','#F2A541','#B57BE0','#E8504A','#5FD1B5'];
  for(let k=0;k<26;k++){const a=r()*6.283,rr=.4+r()*1.9,x=Math.sin(a)*rr,z=Math.cos(a)*rr;const m=mesh(G('tweed',()=>new THREE.ConeGeometry(.07,.9,4)),M('#2E8B57',{flatShading:true}),x,1.1,z,g,false);m.scale.y=.6+r()*1.4;}
  for(let k=0;k<10;k++){const a=r()*6.283,rr=.5+r()*1.7;const m=mesh(G('tcor',()=>new THREE.IcosahedronGeometry(.16,0)),M(cor[k%5],{flatShading:true}),Math.sin(a)*rr,.78,Math.cos(a)*rr,g,false);m.scale.set(1.3+r(),1.5+r()*2,1.3+r());}
  for(let k=0;k<6;k++){const a=r()*6.283,rr=r()*2;const m=mesh(G('trk',()=>new THREE.DodecahedronGeometry(.2,0)),M('#7D8288',{flatShading:true}),Math.sin(a)*rr,.75,Math.cos(a)*rr,g,false);m.scale.setScalar(1+r()*1.5);}
  box(g,'#8B5A2B',.5,.32,.34,.9,.84,-.6,false);box(g,'#F2C230',.52,.06,.36,.9,1.02,-.6,false);
  /* Bänke, Schilder, Lampen am Rundgang */
  for(const an of[Math.PI/2,Math.PI*.85,Math.PI*1.15,Math.PI*1.5]){const x=Math.sin(an)*(R-.75),z=Math.cos(an)*(R-.75);
    const b1=box(g,'#8B6A45',1.6,.08,.42,x,.48,z);b1.rotation.y=an;const b2=box(g,'#5E4632',1.4,.44,.3,x,.22,z);b2.rotation.y=an;cols.push(['c',x,z,.45]);}
  const sg=box(g,signMat('MEINE FISCHE','#2A3442'),2.4,.42,.06,0,2.2,-(R-.3));
  for(let k=0;k<8;k++){const an=k/8*Math.PI*2+.2;mesh(BX(.5,.06,.18),bulbMat,Math.sin(an)*(R-.4),H-.1,Math.cos(an)*(R-.4),g,false);}
  cols.push(['c',0,0,2.85]);
  for(let an=gap/2+.06;an<Math.PI*2-gap/2-.04;an+=.1)cols.push(['c',Math.sin(an)*(R-.1),Math.cos(an)*(R-.1),.32]);
  return {g,cols,lights:[[0,4.5,0,0x7fd8ff,1.8,10],[0,3.8,4.3,0xffe2b0,1.2,7],[3.7,3.8,-2.2,0xffe2b0,1.2,7],[-3.7,3.8,-2.2,0xffe2b0,1.2,7]],tank:true};
};
MODELS.teil=()=>({g:new THREE.Group(),cols:[],lights:[]});"""+s[b:]

rep("""aquarium:{kind:'obj',label:'Aquarium',house:true},""","""aquarium:{kind:'obj',label:'Aquarium',house:true,big:true}, teil:{kind:'part',label:'',house:true},""")

# ----- Fische im runden Becken -----
a=s.index("const TANK={z:-1.27")
b=s.index("function insideAquarium(){")
s=s[:a]+r"""function clearAquarium(aq){for(const f of aq.fish){scene.remove(f.m);disposeGroup(f.m);}aq.fish=[];}
function fillAquarium(aq){
  clearAquarium(aq);
  const list=[];for(const k of Object.keys(FISH))for(let q=0;q<Math.min(catchBook[k]||0,6);q++)list.push(k);
  list.slice(0,34).forEach(type=>{
    const m=fishModel(type);m.scale.setScalar(FISH[type].aq*1.45);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});scene.add(m);
    const ly=1.1+Math.random()*2.5;
    aq.fish.push({m,type,th:Math.random()*6.283,rr:.7+Math.random()*1.5,tr:0,ly,ty:ly,dir:Math.random()<.5?-1:1,sp:FISH[type].speed*.45+.25,ph:Math.random()*6,t:0});
  });
  aq.fish.forEach(f=>f.tr=f.rr);
}
function refreshAquariums(){for(const aq of aquariums.values())fillAquarium(aq);}
function updateAquariums(dt){
  for(const aq of aquariums.values()){
    if(!nearFocus(aq.x,aq.z,50))continue;
    for(const f of aq.fish){
      f.t-=dt;if(f.t<=0){f.t=3+Math.random()*6;f.tr=.6+Math.random()*1.6;f.ty=1.1+Math.random()*2.5;if(Math.random()<.15)f.dir*=-1;}
      f.rr+=(f.tr-f.rr)*Math.min(1,dt*.5);f.ly+=(f.ty-f.ly)*Math.min(1,dt*.6);f.ph+=dt*6;
      f.th+=f.dir*f.sp/f.rr*dt;
      const h=Math.atan2(f.dir*Math.cos(f.th),-f.dir*Math.sin(f.th));
      f.m.position.set(aq.x+Math.sin(f.th)*f.rr,f.ly+Math.sin(f.ph*.4)*.05,aq.z+Math.cos(f.th)*f.rr);f.m.rotation.set(0,h+Math.sin(f.ph)*.15,0);
    }
  }
}
"""+s[b:]
rep("""  for(const aq of aquariums.values()){if(Math.abs(pl.x-aq.x)<1.75&&Math.abs(pl.z-aq.z)<1.75)return aq;}""",
"""  for(const aq of aquariums.values()){if(Math.hypot(pl.x-aq.x,pl.z-aq.z)<AQ_R-.3)return aq;}""")

# ----- Platzieren auf 3x3 Feldern -----
rep("""  if(it.kind==='ground'){if(t.g===sel)return;setGround(i,j,sel);plop();dirty=true;return;}
  if(it.kind==='obj'){""","""  if(it.kind==='ground'){if(t.o&&(t.o.t==='teil'||t.o.t==='aquarium')){if(!painting){nope();hint('Hier steht das Aquarium. Reiß es erst ab.',2500);}return;}if(t.g===sel)return;setGround(i,j,sel);plop();dirty=true;return;}
  if(t.o&&t.o.t==='teil'&&it.kind!=='fish'){if(!painting){nope();hint('Hier steht das Aquarium.',2000);}return;}
  if(sel==='aquarium'&&!(t.o&&t.o.t==='aquarium')){
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;
      if(!inb(a,b)){nope();hint('Zu nah am Rand. Das Aquarium braucht 3 × 3 Felder Platz.',3000);return;}
      const o=tiles[I(a,b)].o;if(o&&(o.t==='aquarium'||o.t==='teil')){nope();hint('Hier ist kein Platz. Das Aquarium braucht 3 × 3 Felder.',3000);return;}
      if(rideTrain&&rideTrain.cars.some(c=>inTile(c.g.position,a,b))){nope();return;}}
    claimArea(i,j);
    t.o={t:'aquarium',r:orientBig(i,j),s:1};rebuildObj(i,j,true);plop();dirty=true;
    hint('Ein riesiges Aquarium! Lauf hinein und einmal um das Becken herum.',3500);return;
  }
  if(it.kind==='obj'){""")
rep("""    if(!did){if(t.o){t.o=null;rebuildObj(i,j);did=true;}""","""    if(!did&&t.o&&(t.o.t==='teil'||t.o.t==='aquarium')){const s0=t.o.t==='teil'?t.o.s|0:4,pi=i-(Math.floor(s0/3)-1),pj=j-(s0%3-1);removeBig(pi,pj);plop();dirty=true;return;}
    if(!did){if(t.o){t.o=null;rebuildObj(i,j);did=true;}""")
rep("""function freeAt(i,j){""","""function orientBig(i,j){for(let d=0;d<4;d++)if(isRoad(i+DIRS[d][0]*2,j+DIRS[d][1]*2))return d;for(let d=0;d<4;d++)if(inb(i+DIRS[d][0]*2,j+DIRS[d][1]*2)&&!(tiles[I(i+DIRS[d][0]*2,j+DIRS[d][1]*2)].o))return d;return 0;}
function claimArea(i,j,soft){
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(!inb(a,b))continue;const k=I(a,b);
    if(soft&&tiles[k].o)continue;
    if(!soft){clearTile(a,b);for(const tr of trains.slice())if(tr!==rideTrain&&tr.cars.some(c=>inTile(c.g.position,a,b)))removeTrain(tr);if(tiles[k].g!=='gras'&&tiles[k].g!=='sand')setGround(a,b,'gras');}
    tiles[k].o={t:'teil',r:0,s:(di+1)*3+(dj+1)};if(!soft)rebuildObj(a,b);}
  const t=tiles[I(i,j)];if(!soft&&t.g!=='gras'&&t.g!=='sand')setGround(i,j,'gras');
  if(!soft)clearTile(i,j);
}
function removeBig(i,j){
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(!inb(a,b))continue;const o=tiles[I(a,b)].o;
    if(o&&((di||dj)?o.t==='teil':o.t==='aquarium')){tiles[I(a,b)].o=null;rebuildObj(a,b);}}
}
function freeAt(i,j){""")
# Spaziergang startet vor der Tür des großen Baus
rep("""  const st=tileAt(bc.x,bc.z),to=st&&tiles[I(st.i,st.j)].o;
  if(to&&(ITEMS[to.t].house||to.t==='berg')){
    const c=center(st.i,st.j); let d=to.r;""","""  let st=tileAt(bc.x,bc.z),to=st&&tiles[I(st.i,st.j)].o;
  if(to&&to.t==='teil'){const s0=to.s|0;st={i:st.i-(Math.floor(s0/3)-1),j:st.j-(s0%3-1)};to=inb(st.i,st.j)?tiles[I(st.i,st.j)].o:null;}
  if(to&&to.t==='aquarium'){const c=center(st.i,st.j),f=DIRS[to.r];pl.x=c.x+f[0]*(AQ_R+1.2);pl.z=c.z+f[1]*(AQ_R+1.2);pl.yaw=Math.atan2(f[0],f[1]);}
  else if(to&&(ITEMS[to.t].house||to.t==='berg')){
    const c=center(st.i,st.j); let d=to.r;""")
# alte gespeicherte Aquarien: freie Nachbarfelder übernehmen
rep("""  d.tiles.forEach((t,k)=>{const g=ITEMS[t[0]]&&ITEMS[t[0]].kind==='ground'?t[0]:'gras';tiles[k].g=g;if(t[1]&&MODELS[t[1]]){tiles[k].o={t:t[1],r:t[2]|0,s:t[3]|0};if(typeof t[4]==='string'&&t[4].length===VX*VX*VY)tiles[k].o.b=t[4];}});""",
"""  d.tiles.forEach((t,k)=>{const g=ITEMS[t[0]]&&ITEMS[t[0]].kind==='ground'?t[0]:'gras';tiles[k].g=g;if(t[1]&&MODELS[t[1]]){tiles[k].o={t:t[1],r:t[2]|0,s:t[3]|0};if(typeof t[4]==='string'&&t[4].length===VX*VX*VY)tiles[k].o.b=t[4];}});
  for(let k=0;k<N*N;k++)if(tiles[k].o&&tiles[k].o.t==='aquarium')claimArea(k%N,(k/N)|0,true);""")
open(p,'w').write(s)
print('ok9')
