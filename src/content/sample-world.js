// Startwelten: die Beispielstadt und die Inselwelt (die leere Wiese ist emptyWorld in core/save.js).
import '../core/save.js'; // Ladereihenfolge: läuft nach core/save.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { I, START_N, center } from '../core/grid.js';
import { ITEMS } from './catalog.js';
import { resetTiles } from '../core/world.js';
import { addCar, placeCarOn } from '../systems/traffic.js';
import { spawnTrain } from '../systems/trains.js';
import { dockPose, spawnFerry } from '../systems/ferries.js';
import { addAnimal } from '../systems/animals.js';
import { bc } from '../render/build-camera.js';
import { rebuildAll } from '../core/save.js';
import { orient, rot, tiles } from '../core/world-data.js';
import { mulberry } from '../core/util.js';

function sampleWorld(){
  resetTiles(START_N);
  const R=(i,j)=>{tiles[I(i,j)].g='strasse';},W=(i,j,g)=>{tiles[I(i,j)].g=g;};
  for(let i=4;i<=15;i++){R(i,4);R(i,14);}
  for(let j=4;j<=14;j++){R(4,j);R(15,j);R(10,j);}
  for(let i=16;i<game.N;i++)R(i,9);
  for(let i=0;i<=13;i++){W(i,16,'sand');for(let j=17;j<game.N;j++)W(i,j,'meer');}
  for(const i of[8,12]){R(i,15);R(i,16);W(i,17,'anleger');}
  W(0,18,'seetor');
  for(let i=3;i<=16;i++)W(i,1,'schiene');
  W(5,1,'bahnhof');W(13,1,'bahnhof');W(17,1,'tunnel');
  R(10,0);W(10,1,'uebergang');R(10,2);R(10,3);
  const O=(i,j,t)=>{tiles[I(i,j)].o={t,r:ITEMS[t].house?orient(i,j):(i*7+j)%4,s:i*97+j*13+5};};
  [[5,3,'haus'],[7,3,'haus'],[9,3,'villa'],[12,3,'haus'],[14,3,'haus'],[5,5,'haus'],[11,5,'hochhaus'],[13,5,'hochhaus'],
   [14,13,'feuerwache'],[5,13,'villa'],[7,13,'haus'],[8,13,'haus'],[11,13,'haus'],[12,13,'villa'],[16,12,'haus'],[16,6,'villa'],
   [6,7,'baum'],[8,7,'baum'],[6,9,'baum'],[8,9,'baum'],[7,7,'blumen'],[7,8,'blumen'],[6,8,'blumen'],[8,8,'blumen'],[7,9,'blumen'],
   [12,8,'tanne'],[13,10,'tanne'],[11,9,'baum'],[12,10,'blumen'],[13,8,'blumen'],
   [0,0,'tanne'],[1,0,'tanne'],[2,0,'tanne'],[0,1,'tanne'],[0,2,'tanne'],[1,2,'tanne'],[0,3,'tanne'],[1,1,'berg'],[2,1,'tanne'],
   [18,2,'berg'],[19,1,'tanne'],[19,3,'tanne'],[18,0,'tanne'],[17,4,'baum'],[18,6,'baum'],[2,8,'baum'],[1,10,'baum'],[1,6,'blumen'],
   [16,15,'tanne'],[19,19,'tanne'],[16,19,'baum'],[19,15,'baum'],[3,6,'laterne'],[3,11,'laterne'],[9,6,'laterne'],[16,10,'laterne'],[9,12,'laterne'],
   [2,13,'baum'],[7,5,'eigen'],[6,5,'garage'],[2,11,'lagerfeuer'],[12,9,'lichterkette'],[6,13,'gartenlampe']
  ].forEach(([i,j,t])=>O(i,j,t));
  rebuildAll();
  {const gc=center(6,5),f=rot(0,1,tiles[I(6,5)].o.r);addCar('lambo',gc.x-f[0]*.3,gc.z-f[1]*.3,Math.atan2(f[0],f[1]),false);}
  spawnTrain('zug',8,1,1);
  {const c=center(4,17);addCar('boot',c.x,c.z-.6,Math.PI/2,false);}
  {const k=I(8,17),dp=dockPose(k),f=spawnFerry(dp.x,dp.z,dp.axis);f.last=k;f.tgt=k;f.wait=8;}
  placeCarOn(7,4,'lambo',1); placeCarOn(15,8,'ferrari',0); placeCarOn(10,10,'polizei',2); placeCarOn(4,12,'bus',0);
  placeCarOn(12,14,'feuerwehrauto',3); placeCarOn(17,9,'lambo',3);
  addAnimal('kuh',70-game.HALF,66-game.HALF); addAnimal('kuh',74-game.HALF,70-game.HALF); addAnimal('pferd',70-game.HALF,74-game.HALF);
  addAnimal('huhn',9-game.HALF,54-game.HALF); addAnimal('huhn',10-game.HALF,52-game.HALF); addAnimal('huhn',13-game.HALF,53-game.HALF); addAnimal('hund',27-game.HALF,25-game.HALF);
  bc.x=0; bc.z=3; bc.d=48; bc.yaw=bc.yawT=.55; game.dayT=.36;
}

/**
 * Inselwelt: Meer mit einer großen und einer kleinen Insel, Anlegern, Fähre, Boot und Seetor.
 * Die Form ist fest (Startwert), damit jede neue Inselwelt gleich schön aussieht.
 */
function islandWorld(){
  resetTiles(START_N);
  const N=game.N,W=(i,j,g)=>{if(i>=0&&j>=0&&i<N&&j<N)tiles[I(i,j)].g=g;},G=(i,j)=>(i>=0&&j>=0&&i<N&&j<N)?tiles[I(i,j)].g:null;
  for(let k=0;k<N*N;k++)tiles[k].g='meer';
  const r=mulberry(4711);
  const blob=(ci,cj,rad,wob)=>{const ph=[r()*6.3,r()*6.3];for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    const a=Math.atan2(j-cj,i-ci),d=Math.hypot(i-ci,(j-cj)*1.15),rr=rad+Math.sin(a*3+ph[0])*wob+Math.sin(a*5+ph[1])*wob*.5;
    if(d<rr-1.1)W(i,j,'gras');else if(d<rr&&G(i,j)==='meer')W(i,j,'sand');}};
  blob(8.5,8,6.2,.9);   // große Insel
  blob(16,15.5,2.6,.4); // kleine Insel
  // Kleiner Weg über die große Insel bis zum Anleger
  for(let i=5;i<=12;i++)W(i,8,'strasse');
  for(let j=8;j<=13;j++)W(8,j,'strasse');
  let aj=14;while(G(8,aj)!=='meer'&&aj<N-1)aj++;
  for(let j=14;j<aj;j++)W(8,j,'strasse');
  W(8,aj,'anleger');
  // Anleger an der kleinen Insel (Westseite)
  let si=16;while(G(si,15)!=='meer'&&si>0)si--;W(si,15,'anleger');
  W(0,N-3,'seetor');
  const O=(i,j,t)=>{if(G(i,j)!=='gras'&&G(i,j)!=='sand')return;tiles[I(i,j)].o={t,r:ITEMS[t].house?orient(i,j):(i*7+j)%4,s:i*97+j*13+5};};
  [[6,7,'haus'],[10,7,'villa'],[7,9,'haus'],[11,9,'haus'],[9,10,'baum'],[4,6,'baum'],[5,10,'tanne'],[12,5,'baum'],[6,4,'blumen'],
   [10,4,'tanne'],[3,9,'baum'],[13,8,'laterne'],[7,11,'lagerfeuer'],[9,6,'blumen'],[16,15,'baum'],[17,16,'blumen'],[15,16,'tanne']
  ].forEach(([i,j,t])=>O(i,j,t));
  rebuildAll();
  {const k=I(8,aj),dp=dockPose(k),f=spawnFerry(dp.x,dp.z,dp.axis);f.last=k;f.tgt=k;f.wait=8;}
  {const c=center(4,15);addCar('boot',c.x,c.z,Math.PI/2,false);}
  placeCarOn(6,8,'lambo',1);
  addAnimal('hund',center(9,9).x+1,center(9,9).z); addAnimal('huhn',center(5,8).x,center(5,8).z+1.5);
  bc.x=center(9,10).x; bc.z=center(9,10).z; bc.d=52; bc.yaw=bc.yawT=.55; game.dayT=.36;
}

export { islandWorld, sampleWorld };
