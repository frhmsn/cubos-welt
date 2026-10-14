import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

VEH=r"""
/* ---------- Eisenbahn ---------- */
const TCL=3.45,TLEN=3.2,TCARS=3;
let rideTrain=null, traveling=null;
function trainCarModel(type,role){
  const g=new THREE.Group(),ice=type==='ice',L=TLEN,W=1.3,y0=.42;
  const body=M(ice?'#F2F3F5':'#D7261E',{roughness:.35,metalness:.15}),band=M(ice?'#D7261E':'#F4F4F2'),dark=M('#2A2D31');
  for(const z of[-1.05,1.05]){box(g,dark,1.0,.26,.95,0,.3,z);for(const x of[-.5,.5])mesh(wheelGeo(.17,.12),dark,x,.24,z,g);}
  const cab=role==='mid'?0:(ice?1.05:.7),s=role==='back'?-1:1,bl=L-cab,bz=-s*cab/2;
  box(g,body,W,1.45,bl,0,y0+.72,bz);
  box(g,winMat,W+.02,.42,bl-.5,0,y0+1.0,bz,false);
  box(g,band,W+.03,.14,bl,0,y0+.42,bz,false);
  box(g,M('#A7ADB4',{metalness:.3}),W-.12,.12,bl-.1,0,y0+1.5,bz);
  for(const x of[-1,1])box(g,M(ice?'#9AA0A6':'#8E1B14'),.04,1.1,.55,x*(W/2+.01),y0+.6,bz+(role==='mid'?0:-s*.3),false);
  if(cab){
    const cz=s*(L/2-cab/2);
    if(ice){
      box(g,body,W,.95,cab,0,y0+.48,cz);
      const top=box(g,body,W*.96,.55,cab*.9,0,y0+1.05,cz-s*.12);top.rotation.x=s*.42;
      const gl=box(g,glassMat,W*.82,.05,cab*.55,0,y0+1.33,cz-s*.02,false);gl.rotation.x=s*.42;
    } else {
      box(g,body,W,1.45,cab,0,y0+.72,cz);
      box(g,glassMat,W*.86,.55,.06,0,y0+1.1,s*(L/2+.005),false);
      box(g,M('#2A2D31'),W*.7,.18,.08,0,y0+.12,s*(L/2+.01),false);
    }
    for(const x of[-.42,.42])box(g,headMat,.2,.11,.05,x,y0+.3,s*(L/2+.02),false);
    box(g,band,W+.03,.14,cab,0,y0+.42,cz,false);
  }
  if(role==='front'&&!ice){box(g,dark,.06,.45,.06,0,y0+1.78,0);box(g,dark,.8,.05,.05,0,y0+2.0,0);}
  return bake(g);
}
function railOut(i,j,dIn){const back=(dIn+2)%4,o=[];for(let d=0;d<4;d++){if(d===back)continue;if(isRail(i+DIRS[d][0],j+DIRS[d][1])){o.push(d);if(d===dIn){o.push(d);o.push(d);}}}return o.length?o[Math.floor(Math.random()*o.length)]:back;}
function bez(sg,t){const a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;return[a*sg.p0[0]+b*sg.p1[0]+c*sg.p2[0],a*sg.p0[1]+b*sg.p1[1]+c*sg.p2[1]];}
function railSeg(tr,i,j,dIn,dOut,start){
  const c=center(i,j),h=TILE/2,fi=DIRS[dIn],fo=DIRS[dOut],end=dOut===(dIn+2)%4;
  const p0=start||[c.x-fi[0]*h,c.z-fi[1]*h],p2=end?[c.x,c.z]:[c.x+fo[0]*h,c.z+fo[1]*h];
  const p1=(end||dIn===dOut)?[(p0[0]+p2[0])/2,(p0[1]+p2[1])/2]:[c.x,c.z];
  const sg={p0,p1,p2,end,len:0};let px=p0[0],pz=p0[1];
  for(let k=1;k<=10;k++){const q=bez(sg,k/10);sg.len+=Math.hypot(q[0]-px,q[1]-pz);px=q[0];pz=q[1];}
  sg.len=Math.max(sg.len,.05);tr.seg=sg;tr.i=i;tr.j=j;tr.dIn=dIn;tr.dOut=dOut;tr.t=0;
}
function histPoint(tr,dist){
  const H=tr.hist;let acc=0,px=tr.x,pz=tr.z;
  for(let k=H.length-1;k>=0;k--){const q=H[k],d=Math.hypot(px-q.x,pz-q.z);if(acc+d>=dist){const f=d>1e-6?(dist-acc)/d:0;return{x:px+(q.x-px)*f,z:pz+(q.z-pz)*f};}acc+=d;px=q.x;pz=q.z;}
  return{x:px,z:pz};
}
function histLen(tr){let L=0,px=tr.x,pz=tr.z;for(let k=tr.hist.length-1;k>=0;k--){const q=tr.hist[k];L+=Math.hypot(px-q.x,pz-q.z);px=q.x;pz=q.z;}return L;}
function trimHist(tr){const max=TCARS*TCL+3;let acc=0,px=tr.x,pz=tr.z;for(let k=tr.hist.length-1;k>=0;k--){const q=tr.hist[k];acc+=Math.hypot(px-q.x,pz-q.z);px=q.x;pz=q.z;if(acc>max){tr.hist.splice(0,k);return;}}}
function setTrainPos(tr){
  const t=Math.min(tr.t,1),p=bez(tr.seg,t),sg=tr.seg;tr.x=p[0];tr.z=p[1];
  const dx=2*(1-t)*(sg.p1[0]-sg.p0[0])+2*t*(sg.p2[0]-sg.p1[0]),dz=2*(1-t)*(sg.p1[1]-sg.p0[1])+2*t*(sg.p2[1]-sg.p1[1]);
  if(Math.abs(dx)+Math.abs(dz)>1e-5)tr.h=Math.atan2(dx,dz);
  const H=tr.hist,l=H[H.length-1];if(!l||Math.hypot(l.x-tr.x,l.z-tr.z)>.12){H.push({x:tr.x,z:tr.z});trimHist(tr);}
}
function placeTrainCars(tr){
  tr.cars.forEach((c,k)=>{const a=histPoint(tr,k*TCL+.35),b=histPoint(tr,k*TCL+TLEN-.35);
    let h=Math.atan2(a.x-b.x,a.z-b.z);if(Math.hypot(a.x-b.x,a.z-b.z)<.05)h=c.th!=null?c.th:(tr.h||0);c.th=h;
    c.g.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);c.g.rotation.y=h+(c.flip?Math.PI:0);});
}
function spawnTrain(type,i,j,d,opts){
  const tr={type,cars:[],hist:[],t:0,v:0,h:Math.atan2(DIRS[d][0],DIRS[d][1]),state:'run',wait:0,lastStop:-1,stopK:null,stopAt:null,odo:0,atStation:false,blockT:0};
  for(let k=0;k<TCARS;k++){const role=k===0?'front':k===TCARS-1?'back':'mid';const g=trainCarModel(type,role);scene.add(g);tr.cars.push({g,flip:false,th:tr.h});}
  const c=center(i,j);tr.x=c.x;tr.z=c.z;
  railSeg(tr,i,j,d,railOut(i,j,d),[c.x,c.z]);
  if(opts&&opts.emerge){
    const fx=Math.sin(tr.h),fz=Math.cos(tr.h);
    for(let q=TCARS*TCL+2;q>=.2;q-=.4)tr.hist.push({x:c.x-fx*q,z:c.z-fz*q});
    tr.v=2.5;
  } else {
    tr.hist.push({x:tr.x,z:tr.z});
    for(let k=0;k<400&&histLen(tr)<TCARS*TCL+.6;k++)trainStep(tr,.05,true);
  }
  placeTrainCars(tr);trains.push(tr);return tr;
}
function removeTrain(tr){const k=trains.indexOf(tr);if(k<0)return;for(const c of tr.cars){scene.remove(c.g);disposeGroup(c.g);}trains.splice(k,1);if(rideTrain===tr)rideTrain=null;}
function reverseTrain(tr,pre){
  const L=TCARS*TCL,pts=[{x:tr.x,z:tr.z}];let acc=0,px=tr.x,pz=tr.z;
  for(let k=tr.hist.length-1;k>=0;k--){const q=tr.hist[k],d=Math.hypot(px-q.x,pz-q.z);if(d<1e-6)continue;
    if(acc+d>=L){const f=(L-acc)/d;pts.push({x:px+(q.x-px)*f,z:pz+(q.z-pz)*f});acc=L;break;}acc+=d;pts.push({x:q.x,z:q.z});px=q.x;pz=q.z;}
  const tail=pts[pts.length-1],tl=tileAt(tail.x,tail.z);
  if(pts.length<2||!tl||!isRail(tl.i,tl.j)){tr.v=0;tr.state='halt';tr.wait=3;return;}
  const prev=pts[pts.length-2],h=Math.atan2(tail.x-prev.x,tail.z-prev.z);
  tr.hist=pts.slice(0,-1);tr.x=tail.x;tr.z=tail.z;tr.h=h;
  tr.cars.reverse();for(const c of tr.cars)c.flip=!c.flip;
  const dIn=headingToDir(h);railSeg(tr,tl.i,tl.j,dIn,railOut(tl.i,tl.j,dIn),[tail.x,tail.z]);
  tr.v=0;tr.lastStop=-1;tr.stopAt=null;tr.atStation=false;
  if(!pre){tr.state='halt';tr.wait=1.6;}
}
function trainBlocked(tr){
  const fx=Math.sin(tr.h),fz=Math.cos(tr.h);
  const chk=(x,z,lat,dist)=>{const dx=x-tr.x,dz=z-tr.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);return f>-.3&&f<dist&&l<lat;};
  for(const c of cars)if(chk(c.x,c.z,1.3,3.2))return true;
  if(mode==='walk'&&chk(pl.x,pl.z,1.0,3.2))return true;
  for(const o of trains){if(o===tr)continue;for(const c of o.cars){const q=c.g.position;if(chk(q.x,q.z,1.4,4.6))return true;}}
  return false;
}
function nearFocus(x,z,r){return (x-focus.x)**2+(z-focus.z)**2<r*r;}
function trainStep(tr,dt,pre){
  if(!isRail(tr.i,tr.j)){tr.v=0;return;}
  const spec=ITEMS[tr.type];let target=spec.speed;
  if(!pre){
    if(tr.stopAt!=null){const rem=tr.stopAt-tr.odo;
      if(rem<=0){tr.state='halt';tr.wait=6;tr.v=0;tr.atStation=true;tr.stopAt=null;if(rideTrain===tr||nearFocus(tr.x,tr.z,28))chime();return;}
      target=Math.min(target,Math.max(.6,rem*1.3));}
    if(tr.seg.end)target=Math.min(target,Math.max(.8,(1-tr.t)*tr.seg.len*1.3));
    if(trainBlocked(tr)){target=0;tr.blockT+=dt;if(tr.blockT>5){tr.blockT=0;reverseTrain(tr);return;}}else tr.blockT=0;
    tr.v+=clamp(target-tr.v,-7*dt,2.2*dt);
  } else tr.v=spec.speed;
  const ds=tr.v*dt;tr.odo+=ds;tr.t+=ds/tr.seg.len;
  let guard=0;
  while(tr.t>=1&&guard++<5){
    if(tr.seg.end){tr.t=1;setTrainPos(tr);
      if(!pre&&gAt(tr.i,tr.j)==='tunnel'&&rideTrain===tr&&!traveling){tr.v=0;startTravel({kind:'train',train:tr,type:tr.type});return;}
      reverseTrain(tr,pre);return;}
    const rest=(tr.t-1)*tr.seg.len,ni=tr.i+DIRS[tr.dOut][0],nj=tr.j+DIRS[tr.dOut][1];
    if(!isRail(ni,nj)){tr.t=1;setTrainPos(tr);reverseTrain(tr,pre);return;}
    const dIn=tr.dOut;railSeg(tr,ni,nj,dIn,railOut(ni,nj,dIn),tr.seg.p2.slice());tr.t=rest/tr.seg.len;
    const nk=I(ni,nj);
    if(gAt(ni,nj)==='bahnhof'){if(!pre&&tr.lastStop!==nk){tr.lastStop=nk;tr.stopK=nk;tr.stopAt=tr.odo+2+TCL+TLEN/2-rest;}}
    else if(tr.stopAt==null)tr.lastStop=-1;
  }
  setTrainPos(tr);
}
function updateTrains(dt){
  for(const tr of trains.slice()){
    if(tr.state==='halt'){tr.wait-=dt;if(tr.wait<=0){tr.state='run';if(tr.atStation&&(rideTrain===tr||nearFocus(tr.x,tr.z,28)))whistle(tr.type,.6);tr.atStation=false;}}
    else trainStep(tr,dt,false);
    if(trains.includes(tr))placeTrainCars(tr);
  }
}
function pushTrains(p,rad){
  for(const tr of trains)for(const c of tr.cars){const q=c.g.position,fx=Math.sin(c.th),fz=Math.cos(c.th);
    for(const s of[-1.05,0,1.05]){const cx=q.x+fx*s,cz=q.z+fz*s,dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz),m=.68+rad;if(d<m&&d>1e-6){p.x=cx+dx/d*m;p.z=cz+dz/d*m;}}}
}
function updateCrossings(dt){
  let any=false;
  for(const cr of crossings.values()){
    let near=false;
    for(const tr of trains){for(const c of tr.cars){const q=c.g.position;if((q.x-cr.x)**2+(q.z-cr.z)**2<100){near=true;break;}}if(near)break;}
    const tgt=near?0:1;
    if(Math.abs(cr.up-tgt)>.001)setArms(cr,cr.up+clamp(tgt-cr.up,-dt*1.4,dt*1.4));
    cr.closed=cr.up<.85; if(cr.up<.98)any=true;
  }
  blinkMat.emissiveIntensity=any&&Math.floor(lightTime*3)%2?2.4:.08;
}

/* ---------- Fähre ---------- */
function ferryModel(){
  const g=new THREE.Group();
  box(g,'#2F5E9E',3.0,.5,4.2,0,0,0);
  box(g,'#F4F4F2',3.02,.1,4.22,0,.2,0,false);
  box(g,'#7D858D',2.4,.06,4.2,0,.28,0,false);
  for(const z of[-1.4,0,1.4])box(g,'#F2C230',.08,.012,.7,0,.315,z,false);
  for(const x of[-1.38,1.38])box(g,'#F4F4F2',.24,.42,3.7,x,.5,0);
  box(g,'#F4F4F2',.55,1.3,1.3,1.38,1.2,0);
  box(g,glassMat,.57,.32,1.32,1.38,1.62,0,false);
  box(g,'#D7261E',.78,.12,1.5,1.38,1.92,0);
  box(g,'#F2C230',.2,.5,.2,1.38,2.2,.3);
  for(const sz of[-1,1]){const r=box(g,'#5A6168',2.2,.06,.55,0,.24,sz*2.32);r.rotation.x=sz*.16;}
  mesh(BX(.2,.1,.2),bulbMat,1.38,2.04,-.4,g,false);
  for(const z of[-1,1])box(g,'#F28C28',.05,.24,.24,-1.51,.55,z,false);
  return bake(g);
}
const angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const nearAxis=(h,a)=>Math.abs(angDiff(a,h))<=Math.PI/2?a:a+Math.PI;
function spawnFerry(x,z,h){const g=ferryModel();g.position.set(x,0,z);g.rotation.y=h;scene.add(g);const f={g,x,z,h,state:'dock',wait:6,path:null,wp:0,v:0,bob:Math.random()*6,last:-1,tgt:null};ferries.push(f);return f;}
function removeFerry(f){const k=ferries.indexOf(f);if(k<0)return;scene.remove(f.g);disposeGroup(f.g);ferries.splice(k,1);}
function deckLocal(f,x,z){const dx=x-f.x,dz=z-f.z,c=Math.cos(f.h),sn=Math.sin(f.h);return[dx*c-dz*sn,dx*sn+dz*c];}
function deckWorld(f,lx,lz){const c=Math.cos(f.h),sn=Math.sin(f.h);return[f.x+lx*c+lz*sn,f.z-lx*sn+lz*c];}
function onDeckF(f,x,z){const l=deckLocal(f,x,z);return Math.abs(l[0])<1.2&&Math.abs(l[1])<2.45;}
function onDeck(x,z){for(const f of ferries)if(onDeckF(f,x,z))return f;return null;}
function pierTiles(){const a=[];for(let k=0;k<N*N;k++){const g=tiles[k].g;if(g==='anleger'||g==='seetor')a.push(k);}return a;}
function dockPose(k){
  const i=k%N,j=Math.floor(k/N),c=center(i,j),gm=groundM[k],g=tiles[k].g;
  let d=g==='anleger'?(gm&&gm.userData.land):(gm&&gm.userData.water);if(d==null)d=0;
  const f=DIRS[d],off=g==='anleger'?-.25:0;return{x:c.x+f[0]*off,z:c.z+f[1]*off,axis:Math.atan2(f[0],f[1])};
}
function waterPath(si,sj,tk){
  const s0=I(si,sj),prev=new Int32Array(N*N).fill(-2);prev[s0]=-1;const q=[s0];let h=0;
  while(h<q.length){const k=q[h++];if(k===tk)break;const i=k%N,j=(k/N)|0;
    for(const d of DIRS){const a=i+d[0],b=j+d[1];if(!inb(a,b))continue;const n=I(a,b);if(prev[n]!==-2||!isWater(a,b))continue;prev[n]=k;q.push(n);}}
  if(prev[tk]===-2)return null;const p=[];for(let k=tk;k!==-1;k=prev[k])p.push(k);return p.reverse();
}
function planFerry(f){
  const here=tileAt(f.x,f.z);if(!here){f.state='dock';f.wait=5;return;}
  const hk=I(here.i,here.j),ps=pierTiles().filter(k=>k!==hk).sort((a,b)=>a-b);
  if(!ps.length){f.state='dock';f.wait=5;return;}
  const st=ps.findIndex(k=>k>f.last),ord=st<0?ps:ps.slice(st).concat(ps.slice(0,st));
  for(const k of ord){const pth=waterPath(here.i,here.j,k);if(!pth)continue;
    f.last=k;f.tgt=k;const dp=dockPose(k);
    f.path=pth.slice(1).map(q=>{const c=center(q%N,Math.floor(q/N));return{x:c.x,z:c.z};});
    if(!f.path.length)f.path=[{x:dp.x,z:dp.z}];else f.path[f.path.length-1]={x:dp.x,z:dp.z};
    f.wp=0;f.state='move';if(playerAboard(f)||nearFocus(f.x,f.z,25))tone(130,.7,'sawtooth',.05);return;}
  f.state='dock';f.wait=5;
}
function playerAboard(f){return (mode==='walk'&&onDeckF(f,pl.x,pl.z))||(mode==='drive'&&driveCar&&onDeckF(f,driveCar.x,driveCar.z));}
function updateFerry(f,dt){
  f.bob+=dt;
  const carried=[];
  if(mode==='walk'&&onDeckF(f,pl.x,pl.z))carried.push({o:pl,p:1,l:deckLocal(f,pl.x,pl.z)});
  for(const c of cars)if(c.mode!=='ai'&&onDeckF(f,c.x,c.z))carried.push({o:c,p:0,l:deckLocal(f,c.x,c.z)});
  const oh=f.h;
  if(f.state==='dock'){f.wait-=dt;if(f.wait<=0)planFerry(f);}
  else if(f.state==='move'){
    const w=f.path[f.wp],dx=w.x-f.x,dz=w.z-f.z,d=Math.hypot(dx,dz),last=f.wp===f.path.length-1;
    if(d<(last?.06:.7)){if(last){f.x=w.x;f.z=w.z;f.v=0;f.state='align';f.alignH=nearAxis(f.h,dockPose(f.tgt).axis);}else f.wp++;}
    else{const a=Math.atan2(dx,dz),want=nearAxis(f.h,a);f.h+=clamp(angDiff(want,f.h),-1.1*dt,1.1*dt);
      const al=Math.cos(angDiff(want,f.h));let tg=3.2*Math.max(.15,al*al);if(last)tg=Math.min(tg,d*1.2+.2);
      f.v+=clamp(tg-f.v,-3*dt,1.5*dt);const st=Math.min(Math.max(f.v,0)*dt,d);f.x+=dx/d*st;f.z+=dz/d*st;}
  }
  else if(f.state==='align'){const dh=angDiff(f.alignH,f.h);f.h+=clamp(dh,-1.1*dt,1.1*dt);if(Math.abs(dh)<.01){f.h=f.alignH;f.state='dock';f.wait=7;ferryArrived(f);}}
  const dH=f.h-oh;
  for(const e of carried){const w=deckWorld(f,e.l[0],e.l[1]);e.o.x=w[0];e.o.z=w[1];
    if(e.p)e.o.yaw+=dH;else{e.o.h+=dH;e.o.g.position.set(e.o.x,.31,e.o.z);e.o.g.rotation.y=e.o.h;}}
  f.g.position.set(f.x,Math.sin(f.bob*1.6)*.025,f.z);f.g.rotation.set(0,f.h,0);f.g.rotateZ(Math.sin(f.bob*1.1)*.012);
}
function ferryArrived(f){
  const k=f.tgt;if(k==null||!tiles[k])return;
  if(tiles[k].g==='seetor'&&playerAboard(f)&&!traveling){startTravel({kind:'ferry',ferry:f});return;}
  if(playerAboard(f)||nearFocus(f.x,f.z,25)){tone(130,.5,'sawtooth',.05);tone(165,.5,'sawtooth',.04,.55);}
}
function canStand(x,z){
  const t=tileAt(x,z);if(!t)return false;const k=I(t.i,t.j),g=tiles[k].g;
  if(!WATT.has(g))return true;if(onDeck(x,z))return true;
  if(g==='anleger'){const gm=groundM[k],L=gm&&gm.userData.land;if(L!=null){const c=center(t.i,t.j),d=DIRS[L];if((x-c.x)*d[0]+(z-c.z)*d[1]>TILE/2-.45)return true;}}
  return false;
}
function removeCar(c){const k=cars.indexOf(c);if(k<0)return;scene.remove(c.g);disposeGroup(c.g);cars.splice(k,1);}
function whistle(type,v){v=v||1;if(type==='ice'){tone(880,.25,'sine',.08*v);tone(660,.4,'sine',.08*v,.28);}else{tone(523,.6,'triangle',.08*v);tone(659,.6,'triangle',.06*v);}}
function chime(){tone(784,.5,'sine',.07);tone(622,.8,'sine',.07,.45);}
"""
rep("""function placeCarOn(i,j,type,d){const c=center(i,j),r=rightOf(d);return addCar(type,c.x+r[0]*.9,c.z+r[1]*.9,Math.atan2(DIRS[d][0],DIRS[d][1]),true);}""",
"""function placeCarOn(i,j,type,d){const c=center(i,j),r=rightOf(d);return addCar(type,c.x+r[0]*.9,c.z+r[1]*.9,Math.atan2(DIRS[d][0],DIRS[d][1]),true);}
"""+VEH)

# Car AI: trains and closed crossings block
rep("""  for(const o of cars){if(o!==car&&check(o.x,o.z,.95)){block=true;break;}}
  if(mode==='walk'&&check(pl.x,pl.z,1.1))block=true;
  if(block){car.wait+=dt;if(car.wait<2.5||mode==='walk')return;}else car.wait=0;""",
"""  for(const o of cars){if(o!==car&&check(o.x,o.z,.95)){block=true;break;}}
  if(mode==='walk'&&check(pl.x,pl.z,1.1))block=true;
  let hard=false;
  for(const cr of crossings.values()){if(!cr.closed)continue;const dx=cr.x-car.x,dz=cr.z-car.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);if(f>1.9&&f<3.1&&l<1.6){hard=true;break;}}
  if(!hard)for(const tr of trains){for(const c of tr.cars){const q=c.g.position;if(check(q.x,q.z,1.6)){hard=true;break;}}if(hard)break;}
  if(hard){car.wait=0;return;}
  if(block){car.wait+=dt;if(car.wait<2.5||mode==='walk')return;}else car.wait=0;""")

# eraser + placement
rep("""  if(sel==='radierer'){
    let did=false;""",
"""  if(sel==='radierer'){
    let did=false;
    for(const tr of trains.slice())if(tr!==rideTrain&&tr.cars.some(c=>inTile(c.g.position,i,j))){removeTrain(tr);did=true;}
    for(const f of ferries.slice())if(inTile(f,i,j)&&!playerAboard(f)){for(const c of cars.slice())if(c!==driveCar&&onDeckF(f,c.x,c.z))removeCar(c);removeFerry(f);did=true;}""")
rep("""  if(it.kind==='car'){
    if(t.g==='wasser'||cars.length>=24){nope();return;}
    let car;
    if(t.g==='strasse')""",
"""  if(it.kind==='train'){
    if(!isRail(i,j)){nope();hint('Der Zug braucht ein Gleis. Bau zuerst Gleise!',3000);return;}
    if(trains.length>=4){nope();hint('Mehr als 4 Züge passen nicht in die Welt.',2500);return;}
    let d=-1;for(let q=0;q<4;q++)if(isRail(i+DIRS[q][0],j+DIRS[q][1])){d=q;break;}
    if(d<0){nope();hint('Das Gleis ist zu kurz. Bau mehr Gleise daneben.',3000);return;}
    const tr=spawnTrain(sel,i,j,d);for(const c of tr.cars)pops.push({g:c.g,t:0});whistle(sel);dirty=true;
    if(![...tiles].some(x=>x.g==='bahnhof'))hint('Tipp: Bau einen Bahnhof aufs Gleis. Dort hält der Zug und du kannst einsteigen.',4500);
    return;
  }
  if(it.kind==='ferry'){
    if(!isWater(i,j)){nope();hint('Die Fähre braucht Wasser.',2500);return;}
    if(ferries.length>=3||ferries.some(f=>inTile(f,i,j))){nope();return;}
    const k=I(i,j);let f;
    if(t.g==='anleger'||t.g==='seetor'){const dp=dockPose(k);f=spawnFerry(dp.x,dp.z,dp.axis);f.last=k;f.tgt=k;}
    else{const c=center(i,j);f=spawnFerry(c.x,c.z,0);}
    pops.push({g:f.g,t:0});tone(130,.6,'sawtooth',.05);dirty=true;
    if(pierTiles().length<2)hint('Bau zwei Anleger am Ufer. Dann fährt die Fähre hin und her.',4000);
    return;
  }
  if(it.kind==='car'){
    if(cars.length>=24){nope();return;}
    let car;
    if(isWater(i,j)){
      const f=ferries.find(f=>inTile(f,i,j));
      if(!f||cars.some(c=>onDeckF(f,c.x,c.z))){nope();hint('Autos können nicht schwimmen. Setz sie auf die Fähre!',3000);return;}
      car=addCar(sel,f.x,f.z,f.h,false);car.g.position.y=.31;
    }
    else if(t.g==='strasse')""")
open(p,'w').write(s)
print('ok2')
