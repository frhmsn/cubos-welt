// Eisenbahn: Züge, Fahrt über Gleise, Halt an Bahnhöfen, Mitfahren.
import './traffic.js'; // Ladereihenfolge: läuft nach systems/traffic.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { clamp } from '../core/util.js';
import { DIRS, I, TILE, center, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { M, bake, box, disposeGroup, glassMat, headMat, mesh, winMat } from '../render/materials.js';
import { blinkMat } from '../content/models/rail.js';
import { wheelGeo } from '../content/models/vehicles.js';
import { cars, crossings, gAt, isRail, setArms, trains } from '../core/world.js';
import { headingToDir } from './traffic.js';
import { chime, whistle } from './ferries.js';
import { lightTime } from '../render/lights.js';
import { pl } from './player.js';
import { stationNear } from '../ui/station-panel.js';
import { startTravel } from './travel.js';
import { focus } from '../core/loop.js';

// ---------- Eisenbahn ----------
const TCL=3.45,TLEN=3.2,TCARS=3;
game.rideTrain = null; game.traveling = null;
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
function removeTrain(tr){const k=trains.indexOf(tr);if(k<0)return;for(const c of tr.cars){scene.remove(c.g);disposeGroup(c.g);}trains.splice(k,1);if(game.rideTrain===tr)game.rideTrain=null;}
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
  if(game.mode==='walk'&&chk(pl.x,pl.z,1.0,3.2))return true;
  for(const o of trains){if(o===tr)continue;for(const c of o.cars){const q=c.g.position;if(chk(q.x,q.z,1.4,4.6))return true;}}
  return false;
}
function nearFocus(x,z,r){return (x-focus.x)**2+(z-focus.z)**2<r*r;}
function trainStep(tr,dt,pre){
  if(!isRail(tr.i,tr.j)){tr.v=0;return;}
  const spec=ITEMS[tr.type];let target=spec.speed;
  if(!pre){
    if(tr.stopAt!=null){const rem=tr.stopAt-tr.odo;
      if(rem<=0){tr.state='halt';tr.wait=6;tr.v=0;tr.atStation=true;tr.stopAt=null;tr.go=false;tr.holdT=0;if(game.rideTrain===tr||nearFocus(tr.x,tr.z,28))chime();return;}
      target=Math.min(target,Math.max(.6,rem*1.3));}
    if(tr.seg.end)target=Math.min(target,Math.max(.8,(1-tr.t)*tr.seg.len*1.3));
    if(trainBlocked(tr)){target=0;tr.blockT+=dt;if(tr.blockT>5){tr.blockT=0;reverseTrain(tr);return;}}else tr.blockT=0;
    tr.v+=clamp(target-tr.v,-7*dt,2.2*dt);
  } else tr.v=spec.speed;
  const ds=tr.v*dt;tr.odo+=ds;tr.t+=ds/tr.seg.len;
  let guard=0;
  while(tr.t>=1&&guard++<5){
    if(tr.seg.end){tr.t=1;setTrainPos(tr);
      if(!pre&&gAt(tr.i,tr.j)==='tunnel'&&game.rideTrain===tr&&!game.traveling){tr.v=0;startTravel({kind:'train',train:tr,type:tr.type});return;}
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
    if(tr.state==='halt'){
      const hold=tr.atStation&&!tr.go&&((game.rideTrain===tr)||(game.mode==='walk'&&!game.traveling&&tr.holdT<30&&stationNear()===tr.stopK));
      if(hold)tr.holdT+=dt;else tr.wait-=dt;
      if(tr.wait<=0){tr.state='run';if(tr.atStation&&(game.rideTrain===tr||nearFocus(tr.x,tr.z,28)))whistle(tr.type,.6);tr.atStation=false;}}
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

export { nearFocus, placeTrainCars, pushTrains, removeTrain, reverseTrain, spawnTrain, trainCarModel, updateCrossings, updateTrains };
