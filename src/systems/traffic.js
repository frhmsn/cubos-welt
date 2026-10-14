// Autos: Fahrzeuge anlegen und auf Straßen selbst fahren lassen.
import '../core/collision.js'; // Ladereihenfolge: dieses Modul läuft nach core/collision.js
import { game } from '../core/state.js';
import { DIRS, TILE, center, rightOf, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { carModel } from '../content/models/vehicles.js';
import { cars, crossings, isRoad, trains } from '../core/world.js';
import { pl } from './player.js';

// ---------- Autos fahren ----------
function addCar(type,x,z,h,ai){
  const g=carModel(type); g.position.set(x,ITEMS[type].sub?-.22:0,z); g.rotation.y=h; scene.add(g);
  const car={type,g,x,z,h,mode:'park',v:0,wait:0,t:0}; cars.push(car);
  if(ai)initAI(car); return car;
}
function headingToDir(h){const fx=Math.sin(h),fz=Math.cos(h);let best=0,bv=-9;for(let d=0;d<4;d++){const v=DIRS[d][0]*fx+DIRS[d][1]*fz;if(v>bv){bv=v;best=d;}}return best;}
function chooseOut(i,j,dIn){
  const back=(dIn+2)%4,opts=[];
  for(let d=0;d<4;d++){if(d===back)continue;if(isRoad(i+DIRS[d][0],j+DIRS[d][1])){opts.push(d);if(d===dIn)opts.push(d);}}
  if(opts.length)return opts[Math.floor(Math.random()*opts.length)];
  return back;
}
function makeSeg(car,i,j,dIn,dOut,start){
  const c=center(i,j),L=.9,h=TILE/2,fi=DIRS[dIn],fo=DIRS[dOut],ri=rightOf(dIn),ro=rightOf(dOut);
  const p0=start||[c.x-fi[0]*h+ri[0]*L,c.z-fi[1]*h+ri[1]*L];
  const p2=[c.x+fo[0]*h+ro[0]*L,c.z+fo[1]*h+ro[1]*L];
  let p1;
  if(dIn===dOut)p1=[(p0[0]+p2[0])/2,(p0[1]+p2[1])/2];
  else if((dIn+2)%4===dOut)p1=[c.x+fi[0]*1.3,c.z+fi[1]*1.3];
  else p1=[c.x+(ri[0]+ro[0])*L,c.z+(ri[1]+ro[1])*L];
  let len=0,px=p0[0],pz=p0[1];
  for(let s=1;s<=10;s++){const t=s/10,a=(1-t)*(1-t),b=2*(1-t)*t,cc=t*t;const x=a*p0[0]+b*p1[0]+cc*p2[0],z=a*p0[1]+b*p1[1]+cc*p2[1];len+=Math.hypot(x-px,z-pz);px=x;pz=z;}
  car.seg={p0,p1,p2,len:Math.max(len,.3)}; car.i=i; car.j=j; car.dIn=dIn; car.dOut=dOut;
}
function initAI(car){
  const tl=tileAt(car.x,car.z); if(!tl||!isRoad(tl.i,tl.j)){car.mode='park';return;}
  const dIn=headingToDir(car.h); makeSeg(car,tl.i,tl.j,dIn,chooseOut(tl.i,tl.j,dIn),[car.x,car.z]); car.t=0; car.mode='ai';
}
function updateCarAI(car,dt){
  if(!isRoad(car.i,car.j)){car.mode='park';return;}
  const fx=Math.sin(car.h),fz=Math.cos(car.h); let block=false;
  const check=(x,z,lat)=>{const dx=x-car.x,dz=z-car.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);return f>0&&f<2.8&&l<lat;};
  for(const o of cars){if(o!==car&&check(o.x,o.z,.95)){block=true;break;}}
  if(game.mode==='walk'&&check(pl.x,pl.z,1.1))block=true;
  let hard=false;
  for(const cr of crossings.values()){if(!cr.closed)continue;const dx=cr.x-car.x,dz=cr.z-car.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);if(f>1.9&&f<3.1&&l<1.6){hard=true;break;}}
  if(!hard)for(const tr of trains){for(const c of tr.cars){const q=c.g.position;if(check(q.x,q.z,1.6)){hard=true;break;}}if(hard)break;}
  if(hard){car.wait=0;return;}
  if(block){car.wait+=dt;if(car.wait<2.5||game.mode==='walk')return;}else car.wait=0;
  car.t+=ITEMS[car.type].speed*dt/car.seg.len;
  let guard=0;
  while(car.t>=1&&guard++<4){
    const oldLen=car.seg.len,rest=(car.t-1)*oldLen,ni=car.i+DIRS[car.dOut][0],nj=car.j+DIRS[car.dOut][1];
    let ci,cj,dIn;
    if(isRoad(ni,nj)){ci=ni;cj=nj;dIn=car.dOut;}else{ci=car.i;cj=car.j;dIn=(car.dOut+2)%4;}
    makeSeg(car,ci,cj,dIn,chooseOut(ci,cj,dIn),car.seg.p2.slice());
    car.t=rest/car.seg.len;
  }
  const {p0,p1,p2}=car.seg,t=Math.min(car.t,1),a=(1-t)*(1-t),b=2*(1-t)*t,cc=t*t;
  car.x=a*p0[0]+b*p1[0]+cc*p2[0]; car.z=a*p0[1]+b*p1[1]+cc*p2[1];
  const dx=2*(1-t)*(p1[0]-p0[0])+2*t*(p2[0]-p1[0]),dz=2*(1-t)*(p1[1]-p0[1])+2*t*(p2[1]-p1[1]);
  if(Math.abs(dx)+Math.abs(dz)>1e-4){const target=Math.atan2(dx,dz);let d=target-car.h;d=Math.atan2(Math.sin(d),Math.cos(d));car.h+=d*Math.min(1,dt*10);}
  car.g.position.set(car.x,0,car.z); car.g.rotation.y=car.h;
}
function placeCarOn(i,j,type,d){const c=center(i,j),r=rightOf(d);return addCar(type,c.x+r[0]*.9,c.z+r[1]*.9,Math.atan2(DIRS[d][0],DIRS[d][1]),true);}

export { addCar, headingToDir, initAI, placeCarOn, updateCarAI };
