// Unterwasserwelt beim Tauchen mit dem U-Boot.
import './fishing.js'; // Ladereihenfolge: dieses Modul läuft nach systems/fishing.js
import { game } from '../core/state.js';
import { $, mulberry } from '../core/util.js';
import { DIRS, TILE, center } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { scene } from '../render/renderer.js';
import { G, M, bake, box, disposeGroup, glowTex, mesh, seaTex } from '../render/materials.js';
import { gAt, isWater } from '../core/world.js';
import { ac, tone } from './audio.js';
import { lightTime } from '../render/lights.js';
import { hint } from '../ui/modes.js';
import { FISH, fishModel, fishes } from '../content/fish.js';
import { okF } from './fish.js';
import { WHALE, whaleModel } from '../content/whales.js';
import { whaleBook, whales } from './whales.js';

// ---------- Unterwasserwelt ----------
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
  for(let j=0;j<game.N;j++)for(let i=0;i<game.N;i++){
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
  const st=seaTex.clone();st.needsUpdate=true;st.repeat.set(game.N,game.N);
  const surf=new THREE.Mesh(new THREE.PlaneGeometry(game.N*TILE,game.N*TILE),new THREE.MeshBasicMaterial({map:st,color:0x9fe0ff,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false,fog:false}));
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
    if(!m){m=fishModel(f.type);m.scale.setScalar(FISH[f.type].uw);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});f.depth=f.depth||(-1+-(Math.random()*2.3));underScene.add(m);under.models.set(f,m);}
    const dx=f.x-car.x,dz=f.z-car.z,d2=dx*dx+dz*dz;
    if(d2<9&&f.flee<=0){f.flee=2;const a=Math.atan2(dx,dz),nx=f.x+Math.sin(a)*4,nz=f.z+Math.cos(a)*4;if(okF(f,nx,nz)){f.tx=nx;f.tz=nz;}}
    m.position.set(f.x,f.depth+Math.sin(lightTime*1.5+f.x)*.12,f.z);m.rotation.set(0,f.h+Math.sin(lightTime*(f.flee>0?16:7)+f.z)*.18,0);}
  for(const w of whales){let m=under.models.get(w);
    if(!m){m=whaleModel(w.type);m.scale.setScalar(WHALE[w.type].uw);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});underScene.add(m);under.models.set(w,m);}
    seen.add(w);m.position.set(w.x,Math.max(-2.4,Math.min(-1.3,w.y*.5-1.3)),w.z);m.rotation.set(w.pitch*.5,w.h,0,'YXZ');
    if(!w.seen&&(w.x-car.x)**2+(w.z-car.z)**2<100){w.seen=true;whaleBook[w.type]++;try{localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}hint('Ein '+WHALE[w.type].label+' direkt neben dir!',3500);tone(160,1.2,'sine',.06,0,.6);}}
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
game.wasUnder = false;
function subUnder(){return game.mode==='drive'&&game.driveCar&&ITEMS[game.driveCar.type].sub&&(game.driveCar.dive||0)>.45;}
function forceSurface(car){if(!car||!ITEMS[car.type].sub)return;car.diving=false;car.dive=0;if(car.g.parent!==scene){underScene.remove(car.g);scene.add(car.g);}car.g.position.y=-.22;destroyUnderwater();}
$('#btnDive').addEventListener('click',()=>{ac();if(game.driveCar)setDive(game.driveCar,!game.driveCar.diving);});

export { SUB_Y, destroyUnderwater, forceSurface, subUnder, uHemi, uSun, underScene, updDiveBtn, updateUnderwater };
