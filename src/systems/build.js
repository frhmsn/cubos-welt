// Bauen: Feld antippen, Dinge setzen, abreißen, Regeln für das Platzieren.
import './ferries.js'; // Ladereihenfolge: läuft nach systems/ferries.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { DIRS, I, center, inb, tileAt } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { buildCam, canvas, scene } from '../render/renderer.js';
import { disposeGroup } from '../render/materials.js';
import { claimArea, orientBig, rebuildObj, removeBig, setGround } from '../core/world.js';
import { addCar, placeCarOn, removeCar } from './traffic.js';
import { removeTrain, spawnTrain } from './trains.js';
import { dockPose, onDeckF, pierTiles, playerAboard, removeFerry, spawnFerry } from './ferries.js';
import { addAnimal, animalOk } from './animals.js';
import { nopeSnd, plop, tone, whistle } from './audio.js';
import { bc } from '../render/build-camera.js';
import { FISH, fishes } from '../content/fish.js';
import { addFish, fishOk, splash } from './fish.js';
import { openEditor } from './editor.js';
import { hint } from '../ui/hint.js';
import { animals, cars, ferries, gAt, isRail, isRoad, isWater, orient, pops, rot, tiles, trains } from '../core/world-data.js';
import { islandStroke } from '../core/islands.js';
import { emit } from '../core/events.js';

// ---------- Bauen ----------
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitV=new THREE.Vector3();
function pickTile(cx,cy){
  const r=canvas.getBoundingClientRect(),v=new THREE.Vector2(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  ray.setFromCamera(v,buildCam); if(!ray.ray.intersectPlane(plane,hitV))return null; return tileAt(hitV.x,hitV.z);
}
function nope(){nopeSnd();const b=document.querySelector('.it.on');if(b){b.classList.remove('nope');void b.offsetWidth;b.classList.add('nope');}}
function inTile(e,i,j){const t=tileAt(e.x,e.z);return t&&t.i===i&&t.j===j;}
/** Tippen mit dem gewählten Ding auf Feld (i, j). Meldet 'gebaut', wenn sich die Welt geändert hat. */
function apply(i,j,painting){
  const was=game.dirty;game.dirty=false;
  applyTool(i,j,painting);
  const did=game.dirty;game.dirty=did||was;
  if(did)emit('gebaut',{id:game.sel,kind:ITEMS[game.sel]&&ITEMS[game.sel].kind,i,j,painting:!!painting});
}
function applyTool(i,j,painting){
  const it=ITEMS[game.sel],t=tiles[I(i,j)];
  if(game.sel==='hand')return;
  if(game.sel==='eigen'){openEditor(i,j);return;}
  if(game.sel==='radierer'){
    let did=false;
    for(const tr of trains.slice())if(tr!==game.rideTrain&&tr.cars.some(c=>inTile(c.g.position,i,j))){removeTrain(tr);did=true;}
    for(const f of ferries.slice())if(inTile(f,i,j)&&!playerAboard(f)){for(const c of cars.slice())if(c!==game.driveCar&&onDeckF(f,c.x,c.z))removeCar(c);removeFerry(f);did=true;}
    for(let k=cars.length-1;k>=0;k--)if(inTile(cars[k],i,j)&&cars[k]!==game.driveCar){scene.remove(cars[k].g);disposeGroup(cars[k].g);cars.splice(k,1);did=true;}
    for(let k=animals.length-1;k>=0;k--)if(inTile(animals[k],i,j)){scene.remove(animals[k].g);disposeGroup(animals[k].g);animals.splice(k,1);did=true;}
    if(!did&&t.o&&(t.o.t==='teil'||t.o.t==='aquarium')){const s0=t.o.t==='teil'?t.o.s|0:4,pi=i-(Math.floor(s0/3)-1),pj=j-(s0%3-1);removeBig(pi,pj);plop();game.dirty=true;return;}
    if(!did){if(t.o){t.o=null;rebuildObj(i,j);did=true;}else if(t.g!=='gras'){setGround(i,j,'gras');did=true;}}
    if(did){plop();game.dirty=true;} return;
  }
  if(game.sel==='insel'){
    // Insel-Pinsel: Land ins Wasser malen, Strand entsteht von selbst
    if(t.o&&(t.o.t==='teil'||t.o.t==='aquarium'))return;
    const ch=islandStroke(i,j);
    if(!ch.length){if(!painting){nope();hint('Hier ist schon Land. Mal ins Wasser!',2500);}return;}
    for(const [a,b,g] of ch)setGround(a,b,g);
    plop();game.dirty=true;emit('insel:gemalt',{i,j});return;
  }
  if(it.kind==='ground'){if(t.o&&(t.o.t==='teil'||t.o.t==='aquarium')){if(!painting){nope();hint('Hier steht das Aquarium. Reiß es erst ab.',2500);}return;}if(t.g===game.sel)return;setGround(i,j,game.sel);plop();game.dirty=true;return;}
  if(t.o&&t.o.t==='teil'&&it.kind!=='fish'){if(!painting){nope();hint('Hier steht das Aquarium.',2000);}return;}
  if(game.sel==='aquarium'&&!(t.o&&t.o.t==='aquarium')){
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;
      if(!inb(a,b)){nope();hint('Zu nah am Rand. Das Aquarium braucht 3 × 3 Felder Platz.',3000);return;}
      const o=tiles[I(a,b)].o;if(o&&(o.t==='aquarium'||o.t==='teil')){nope();hint('Hier ist kein Platz. Das Aquarium braucht 3 × 3 Felder.',3000);return;}
      if(game.rideTrain&&game.rideTrain.cars.some(c=>inTile(c.g.position,a,b))){nope();return;}}
    claimArea(i,j);
    t.o={t:'aquarium',r:orientBig(i,j),s:1};rebuildObj(i,j,true);plop();game.dirty=true;
    hint('Ein riesiges Aquarium! Lauf hinein und einmal um das Becken herum.',3500);return;
  }
  if(it.kind==='obj'){
    if(t.o&&t.o.t===game.sel){if(painting)return;if(it.house||it.rot)t.o.r=(t.o.r+1)%4;else t.o.s=Math.floor(Math.random()*1e9);rebuildObj(i,j,true);plop();game.dirty=true;return;}
    if(t.g!=='gras'&&t.g!=='sand')setGround(i,j,'gras');
    t.o={t:game.sel,r:(it.house||game.sel==='flutlicht')?orient(i,j):Math.floor(Math.random()*4),s:Math.floor(Math.random()*1e9)};
    if(it.house)for(let k=animals.length-1;k>=0;k--)if(inTile(animals[k],i,j)){const a=animals[k];const c=center(i,j);a.x=c.x+2.6;a.z=c.z;a.tx=a.x;a.tz=a.z;}
    rebuildObj(i,j,true); plop(); game.dirty=true; return;
  }
  if(it.kind==='train'){
    if(!isRail(i,j)){nope();hint('Der Zug braucht ein Gleis. Bau zuerst Gleise!',3000);return;}
    if(trains.length>=4){nope();hint('Mehr als 4 Züge passen nicht in die Welt.',2500);return;}
    let d=-1;for(let q=0;q<4;q++)if(isRail(i+DIRS[q][0],j+DIRS[q][1])){d=q;break;}
    if(d<0){nope();hint('Das Gleis ist zu kurz. Bau mehr Gleise daneben.',3000);return;}
    const tr=spawnTrain(game.sel,i,j,d);for(const c of tr.cars)pops.push({g:c.g,t:0});whistle(game.sel);game.dirty=true;
    if(![...tiles].some(x=>x.g==='bahnhof'))hint('Tipp: Bau einen Bahnhof aufs Gleis. Dort hält der Zug und du kannst einsteigen.',4500);
    return;
  }
  if(it.kind==='ferry'){
    if(!isWater(i,j)){nope();hint('Die Fähre braucht Wasser.',2500);return;}
    if(ferries.length>=3||ferries.some(f=>inTile(f,i,j))){nope();return;}
    const k=I(i,j);let f;
    if(t.g==='anleger'||t.g==='seetor'){const dp=dockPose(k);f=spawnFerry(dp.x,dp.z,dp.axis);f.last=k;f.tgt=k;}
    else{const c=center(i,j);f=spawnFerry(c.x,c.z,0);}
    pops.push({g:f.g,t:0});tone(130,.6,'sawtooth',.05);game.dirty=true;
    if(pierTiles().length<2)hint('Bau zwei Anleger am Ufer. Dann fährt die Fähre hin und her.',4000);
    return;
  }
  if(it.kind==='car'){
    if(cars.length>=24){nope();return;}
    let car;
    if(it.boat){
      if(!isWater(i,j)){nope();hint(it.sub?'Das U-Boot braucht Wasser.':'Das Boot braucht Wasser.',2500);return;}
      const c=center(i,j);car=addCar(game.sel,c.x,c.z,bc.yaw+Math.PI,false);
      if(gAt(i,j)!=='meer'&&!fishes.length)hint('Tipp: Im Meer gibt es Thunfische und Haie. Mal ein Meer mit dem Feld „Meer".',4000);
    }
    else if(isWater(i,j)){
      const f=ferries.find(f=>inTile(f,i,j));
      if(!f||cars.some(c=>onDeckF(f,c.x,c.z))){nope();hint('Autos können nicht schwimmen. Setz sie auf die Fähre!',3000);return;}
      car=addCar(game.sel,f.x,f.z,f.h,false);car.g.position.y=.31;
    }
    else if(t.g==='strasse'){const ds=[];for(let d=0;d<4;d++)if(isRoad(i+DIRS[d][0],j+DIRS[d][1]))ds.push(d);car=placeCarOn(i,j,game.sel,ds.length?ds[Math.floor(Math.random()*ds.length)]:0);}
    else if(t.o&&t.o.t==='garage'){
      if(cars.some(c=>inTile(c,i,j))){nope();hint('Die Garage ist schon besetzt.',2000);return;}
      const c=center(i,j),f=rot(0,1,t.o.r);car=addCar(game.sel,c.x-f[0]*.3,c.z-f[1]*.3,Math.atan2(f[0],f[1]),false);
    }
    else{const c=center(i,j);car=addCar(game.sel,c.x,c.z+(t.o?1.5:0),bc.yaw+Math.PI,false);}
    pops.push({g:car.g,t:0}); tone(330,.12,'square',.06,0,1.5); game.dirty=true; return;
  }
  if(it.kind==='fish'){
    if(!(gAt(i,j)==='wasser'||gAt(i,j)==='meer')){nope();hint('Fische brauchen Wasser. Tippe auf einen See oder aufs Meer.',3000);return;}
    if(fishes.length>=70){nope();hint('Das Wasser ist voll. Angle erst ein paar Fische!',2500);return;}
    const c=center(i,j),x=c.x+(Math.random()-.5)*2,z=c.z+(Math.random()-.5)*2,f=addFish(it.fish,x,z);f.free=true;f.flee=1.5;
    splash(x,z,true);tone(520,.1,'sine',.08,0,.5);tone(300,.25,'sine',.06,.1,.6);game.dirty=true;
    if(!fishOk(it.fish,x,z))hint(FISH[it.fish].plural+' leben eigentlich '+FISH[it.fish].where+'. Hier schwimmt er trotzdem.',3000);
    return;
  }
  if(it.kind==='animal'){
    const c=center(i,j),x=c.x+(Math.random()-.5)*1.5,z=c.z+(Math.random()-.5)*1.5;
    if(!animalOk(x,z)||animals.length>=40){nope();return;}
    const a=addAnimal(game.sel,x,z); pops.push({g:a.g,t:0}); tone(700,.08,'sine',.1,0,1.3); game.dirty=true;
  }
}

export { apply, inTile, nope, pickTile, ray };
