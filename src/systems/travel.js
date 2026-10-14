// Weltreise: durch Tunnel und Seetor in andere Welten.
import './aquarium.js'; // Ladereihenfolge: läuft nach systems/aquarium.js (siehe docs/ARCHITEKTUR.md)
import { game, pl } from '../core/state.js';
import { $ } from '../core/util.js';
import { DIRS, I, inb } from '../core/grid.js';
import { scene } from '../render/renderer.js';
import { disposeGroup } from '../render/materials.js';
import { rebuildGround, rebuildObj } from '../core/world.js';
import { addCar, removeCar } from './traffic.js';
import { placeTrainCars, removeTrain, reverseTrain, spawnTrain } from './trains.js';
import { dockPose, spawnFerry } from './ferries.js';
import { tone } from './audio.js';
import { bc } from '../render/build-camera.js';
import { inTile } from './build.js';
import { enterCar, setMode, startRide } from '../ui/modes.js';
import { CKEY, store } from '../core/storage.js';
import { applyData, emptyWorld, save } from '../core/save.js';
import { islandWorld, sampleWorld } from '../content/sample-world.js';
import { hint } from '../ui/hint.js';
import { animals, cars, groundM, isRail, isWater, tiles } from '../core/world-data.js';
import { saveWorld } from '../core/worlds.js';

// ---------- Weltreise ----------
function startTravel(info){
  if(game.traveling)return; game.traveling=info;
  tone(392,.2,'sine',.08);tone(523,.2,'sine',.08,.2);tone(659,.35,'sine',.08,.4);
  $('#tvTitle').textContent=info.kind==='train'?'Der Zug fährt in den Tunnel!':'Die Fähre fährt durch das Seetor!';
  $('#tvSub').textContent='In welche Welt soll die Reise gehen?';
  $('#travel').hidden=false; renderTravel();
}
async function renderTravel(){
  let list=[];try{list=await store.list();}catch(e){list=[];}
  list=list.filter(w=>w.id!==game.curWorld).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const el=$('#tvWorlds');el.innerHTML='';
  if(!list.length){const p=document.createElement('p');p.className='empty';p.style.cssText='grid-column:1/-1;margin:0;padding:14px;border:2px dashed rgba(255,255,255,.4);border-radius:16px;text-align:center;';p.textContent='Es gibt noch keine andere gespeicherte Welt. Fahr in eine neue!';el.appendChild(p);return;}
  for(const w of list){
    const card=document.createElement('div');card.className='wc';
    const shot=document.createElement('button');shot.className='shot';shot.setAttribute('aria-label','Nach '+(w.name||'Welt')+' reisen');
    if(w.thumb){const im=document.createElement('img');im.alt='';im.src=w.thumb;shot.appendChild(im);}
    shot.addEventListener('click',()=>doTravel(w));
    const foot=document.createElement('div');foot.className='foot';const nm=document.createElement('div');nm.className='nm';
    const b=document.createElement('b');b.textContent=w.name||'Welt';nm.appendChild(b);foot.appendChild(nm);
    card.append(shot,foot);el.appendChild(card);
  }
}
function clearTile(i,j){
  const t=tiles[I(i,j)];if(t.o){t.o=null;rebuildObj(i,j);}
  for(const c of cars.slice())if(inTile(c,i,j))removeCar(c);
  for(let k=animals.length-1;k>=0;k--)if(inTile(animals[k],i,j)){scene.remove(animals[k].g);disposeGroup(animals[k].g);animals.splice(k,1);}
}
function ensurePortal(type){
  let found=-1;for(let k=0;k<game.N*game.N;k++)if(tiles[k].g===type){found=k;break;}
  const touched=[],set=(i,j,g)=>{if(!inb(i,j))return;clearTile(i,j);tiles[I(i,j)].g=g;touched.push([i,j]);};
  if(found>=0){
    if(type==='tunnel'){const i=found%game.N,j=(found/game.N)|0;
      if(![0,1,2,3].some(q=>isRail(i+DIRS[q][0],j+DIRS[q][1]))){
        let best=0,bv=-1e9;for(let q=0;q<4;q++){const v=-(Math.abs(i+DIRS[q][0]*3-game.N/2)+Math.abs(j+DIRS[q][1]*3-game.N/2));if(inb(i+DIRS[q][0],j+DIRS[q][1])&&v>bv){bv=v;best=q;}}
        for(let st=1;st<=4;st++)set(i+DIRS[best][0]*st,j+DIRS[best][1]*st,st===3?'bahnhof':'schiene');}}
  } else {
    const m=type==='tunnel'?Math.floor(game.N/2):game.N-4;
    if(type==='tunnel'){set(0,m,'tunnel');for(let i=1;i<=5;i++)set(i,m,i===3?'bahnhof':'schiene');}
    else{for(let i=0;i<=3;i++)for(let j=m-1;j<=m+1;j++)set(i,j,'wasser');set(0,m,'seetor');set(3,m,'anleger');if(isWater(4,m)||!inb(4,m))set(4,m,'sand');else touched.push([4,m]);}
    found=I(0,m);
    hint(type==='tunnel'?'Hier gab es noch keinen Tunnel. Ich habe einen gebaut.':'Hier gab es noch kein Seetor. Ich habe einen Hafen gebaut.',4000);
  }
  const done=new Set();
  for(const [i,j] of touched)for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(!inb(a,b)||done.has(a+','+b))continue;done.add(a+','+b);rebuildGround(a,b);}
  return found;
}
async function doTravel(dest){
  const info=game.traveling;if(!info||info.busy)return;info.busy=true;
  $('#tvSub').textContent='Gute Reise …';$('#tvWorlds').innerHTML='';
  let carType=null;
  if(info.kind==='train'){removeTrain(info.train);game.rideTrain=null;}
  else if(game.mode==='drive'&&game.driveCar){carType=game.driveCar.type;const c=game.driveCar;game.driveCar=null;removeCar(c);}
  setMode('build');
  game.worldDirty=true;await saveWorld(false,true);
  let name='';
  if(dest==='empty'){emptyWorld();game.curWorld=null;name='deine neue Welt';}
  else if(dest==='sample'){sampleWorld();game.curWorld=null;name='die neue Stadt';}
  else if(dest==='insel'){islandWorld();game.curWorld=null;name='die Inselwelt';}
  else{let d=null;try{d=JSON.parse(dest.data);}catch(e){}if(d&&applyData(d)){game.curWorld=dest.id;name=dest.name;}else{sampleWorld();game.curWorld=null;name='die neue Stadt';}}
  try{if(game.curWorld)localStorage.setItem(CKEY,game.curWorld);else localStorage.removeItem(CKEY);}catch(e){}
  if(info.kind==='train'){
    const k=ensurePortal('tunnel'),i=k%game.N,j=(k/game.N)|0;let d=1;for(let q=0;q<4;q++)if(isRail(i+DIRS[q][0],j+DIRS[q][1])){d=q;break;}
    const tr=spawnTrain(info.type,i,j,d,{emerge:true});placeTrainCars(tr);startRide(tr);
  } else {
    const k=ensurePortal('seetor'),gm=groundM[k],w=gm&&gm.userData.water!=null?gm.userData.water:1,dp=dockPose(k);
    const f=spawnFerry(dp.x,dp.z,Math.atan2(DIRS[w][0],DIRS[w][1]));f.wait=4;f.last=k;f.tgt=k;
    if(carType){const c=addCar(carType,f.x,f.z,f.h,false);c.g.position.y=.31;enterCar(c);}
    else{pl.x=f.x;pl.z=f.z;pl.yaw=f.h+Math.PI;pl.pitch=-.05;setMode('walk');}
  }
  bc.x=0;bc.z=3;
  game.worldDirty=true;save();await saveWorld(false,true);
  $('#travel').hidden=true;game.traveling=null;
  setTimeout(()=>hint('Willkommen in '+(name||'der neuen Welt')+'!',3500),300);
  tone(523,.15,'sine',.08);tone(659,.15,'sine',.08,.15);tone(784,.3,'sine',.08,.3);
}
function stayHere(){
  const info=game.traveling;if(!info||info.busy)return;game.traveling=null;$('#travel').hidden=true;
  if(info.kind==='train')reverseTrain(info.train);else{info.ferry.state='dock';info.ferry.wait=6;}
}
$('#tvNewEmpty').addEventListener('click',()=>doTravel('empty'));
$('#tvNewSample').addEventListener('click',()=>doTravel('sample'));
$('#tvNewIsland').addEventListener('click',()=>doTravel('insel'));
$('#tvStay').addEventListener('click',stayHere);

export { clearTile, startTravel };
