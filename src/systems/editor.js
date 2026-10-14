// Bauwerkstatt: Häuser Stein für Stein bauen.
import '../content/sample-world.js'; // Ladereihenfolge: läuft nach content/sample-world.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { $ } from '../core/util.js';
import { DIRS, I, center } from '../core/grid.js';
import { canvas } from '../render/renderer.js';
import { M, box } from '../render/materials.js';
import { BLOCKS, TEMPLATE, VB, VI, VO, VX, VY, meshVoxels, vin } from '../content/models/blocks.js';
import { rebuildObj, setGround } from '../core/world.js';
import { ac, nopeSnd, plop, tone } from './audio.js';
import { bc } from '../render/build-camera.js';
import { inTile, ray } from './build.js';
import { setMode } from '../ui/modes.js';
import { select, thumbs } from '../ui/inventory.js';
import { save } from '../core/save.js';
import { hint } from '../ui/hint.js';
import { animals, orient, tiles } from '../core/world-data.js';

// ---------- Bauwerkstatt ----------
const editScene=new THREE.Scene();
const editCam=new THREE.PerspectiveCamera(45,1,.1,200);
editScene.add(new THREE.HemisphereLight(0xffffff,0x88aa77,.72));
const eSun=new THREE.DirectionalLight(0xfff4e0,.8); eSun.position.set(6,11,8); eSun.castShadow=true;
Object.assign(eSun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:40}); eSun.shadow.mapSize.set(1024,1024); eSun.shadow.bias=-.0008;
editScene.add(eSun);
const plate=(()=>{
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='#6CBA48';x.fillRect(0,0,128,128);x.fillStyle='#5CA43C';
  for(let k=0;k<=8;k++){x.fillRect(k*16-1,0,2,128);x.fillRect(0,k*16-1,128,2);}
  const t=new THREE.CanvasTexture(c);
  const m=new THREE.Mesh(new THREE.BoxGeometry(4,.3,4),[M('#5C9A40'),M('#5C9A40'),new THREE.MeshStandardMaterial({map:t,roughness:.95}),M('#5C9A40'),M('#5C9A40'),M('#5C9A40')]);
  m.position.y=-.15;m.receiveShadow=true;editScene.add(m);return m;
})();
(()=>{
  const ground=new THREE.Mesh(new THREE.CircleGeometry(30,40),M('#A6D98A'));ground.rotation.x=-Math.PI/2;ground.position.y=-.31;ground.receiveShadow=true;editScene.add(ground);
  const road=new THREE.Group();box(road,'#3D434B',9,.3,2.4,0,-.15,3.4,false);
  for(let k=-4;k<=4;k+=1.5)box(road,'#F4F4F2',.7,.02,.12,k,.01,3.4,false);
  box(road,'#C9CCD1',9,.32,.5,0,-.14,2.25,false);
  editScene.add(road);
  const kid=new THREE.Group();
  box(kid,'#3F6FB5',.14,.75,.16,-.09,.375,0);box(kid,'#3F6FB5',.14,.75,.16,.09,.375,0);
  box(kid,'#E4572E',.42,.6,.24,0,1.05,0);box(kid,'#F2C9A0',.26,.28,.26,0,1.5,0);box(kid,'#6B4428',.28,.1,.28,0,1.66,0);
  kid.position.set(-2.9,0,2.3);kid.rotation.y=.4;editScene.add(kid);
})();
const voxGroup=new THREE.Group(); editScene.add(voxGroup);
const ec={yaw:.6,pitch:.5,d:11};
let edit=null,editSel='z';
function placeEditCam(){const cp=Math.cos(ec.pitch);editCam.position.set(Math.sin(ec.yaw)*cp*ec.d,1.5+Math.sin(ec.pitch)*ec.d,Math.cos(ec.yaw)*cp*ec.d);editCam.lookAt(0,1.5,0);}
function refreshVox(){
  while(voxGroup.children.length){const m=voxGroup.children.pop();m.geometry.dispose();}
  const g=meshVoxels(edit.v); [...g.children].forEach(m=>voxGroup.add(m));
}
function openEditor(i,j){
  const t=tiles[I(i,j)],src=(t.o&&t.o.t==='eigen'&&typeof t.o.b==='string')?t.o.b:TEMPLATE;
  edit={i,j,v:src.split(''),undo:[]}; ec.yaw=.6;ec.pitch=.5;ec.d=11;
  refreshVox(); setMode('edit'); selectEdit(editSel); plop();
  hint('Tippe auf den Boden oder an einen Stein, dann wächst dort ein neuer. Ein Finger dreht. Vorne ist die Straße.',6000);
}
function closeEditor(){
  if(!edit)return;
  const {i,j}=edit,t=tiles[I(i,j)],s=edit.v.join('');
  if(/^\.+$/.test(s)){if(t.o&&t.o.t==='eigen'){t.o=null;rebuildObj(i,j);}}
  else{
    if(t.g!=='gras'&&t.g!=='sand')setGround(i,j,'gras');
    const r=(t.o&&t.o.t==='eigen')?t.o.r:orient(i,j);
    for(let k=animals.length-1;k>=0;k--)if(inTile(animals[k],i,j)){const a=animals[k];a.tx=a.x;a.tz=a.z;}
    t.o={t:'eigen',r,s:0,b:s}; rebuildObj(i,j,true);
  }
  const c=center(i,j); bc.x=c.x; bc.z=c.z; bc.d=Math.min(bc.d,30);
  edit=null; setMode('build'); select('hand'); save(); game.worldDirty=true; plop();
}
function pushUndo(){edit.undo.push(edit.v.join(''));if(edit.undo.length>80)edit.undo.shift();}
function towardCamDir(){const fx=Math.sin(ec.yaw),fz=Math.cos(ec.yaw);let best=0,bv=-9;for(let d=0;d<4;d++){const v=DIRS[d][0]*fx+DIRS[d][1]*fz;if(v>bv){bv=v;best=d;}}return best;}
function removeDoor(x,y,z){
  const st=[[x,y,z]];
  while(st.length){const [a,b,c]=st.pop();if(!vin(a,b,c)||edit.v[VI(a,b,c)]!=='d')continue;edit.v[VI(a,b,c)]='.';st.push([a+1,b,c],[a-1,b,c],[a,b+1,c],[a,b-1,c],[a,b,c+1],[a,b,c-1]);}
}
function placeDoor(t,carve){
  let [x,y,z]=t; if(!vin(x,y,z)){nopeEdit();return;}
  if(carve)while(y>0&&edit.v[VI(x,y-1,z)]!=='.'&&edit.v[VI(x,y-1,z)]!=='d')y--;
  const alongX=Math.abs(Math.cos(ec.yaw))>=Math.abs(Math.sin(ec.yaw));
  let x2=x+(alongX?1:0),z2=z+(alongX?0:1);
  if(!vin(x2,y,z2)){x2=x-(alongX?1:0);z2=z-(alongX?0:1);}
  pushUndo();
  for(let k=0;k<4&&y+k<VY;k++){edit.v[VI(x,y+k,z)]='d';if(vin(x2,y+k,z2))edit.v[VI(x2,y+k,z2)]='d';}
  refreshVox(); tone(300,.12,'triangle',.1,0,1.4);
}
function nopeEdit(){nopeSnd();const b=document.querySelector('#editTray .it.on');if(b){b.classList.remove('nope');void b.offsetWidth;b.classList.add('nope');}}
function editTap(cx,cy){
  if(!edit||editSel==='E_hand')return;
  const r=canvas.getBoundingClientRect(),nv=new THREE.Vector2(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  placeEditCam(); editCam.updateMatrixWorld(); voxGroup.updateMatrixWorld(true); plate.updateMatrixWorld();
  ray.setFromCamera(nv,editCam);
  const hits=ray.intersectObjects([...voxGroup.children,plate],false); if(!hits.length)return;
  const h=hits[0],onPlate=h.object===plate,n=h.face?h.face.normal.clone():new THREE.Vector3(0,1,0);
  const cellOf=p=>[Math.floor((p.x-VO)/VB),Math.floor(p.y/VB+1e-4),Math.floor((p.z-VO)/VB)];
  const inside=cellOf(h.point.clone().addScaledVector(n,-.02)),outside=cellOf(h.point.clone().addScaledVector(n,.02));
  if(editSel==='E_radierer'){
    if(onPlate)return; const [x,y,z]=inside; if(!vin(x,y,z)||edit.v[VI(x,y,z)]==='.')return;
    pushUndo(); if(edit.v[VI(x,y,z)]==='d')removeDoor(x,y,z); else edit.v[VI(x,y,z)]='.';
    refreshVox(); tone(240,.08,'square',.06,0,.6); return;
  }
  const code=editSel.slice(2);
  let target=onPlate?[outside[0],0,outside[2]]:outside;
  if(onPlate&&n.y<.5){nopeEdit();return;}
  if(code==='d'){const carve=!onPlate&&Math.abs(n.y)<.5;placeDoor(carve?inside:target,carve);return;}
  const [x,y,z]=target;
  if(!vin(x,y,z)||edit.v[VI(x,y,z)]!=='.'){nopeEdit();return;}
  pushUndo(); edit.v[VI(x,y,z)]=code==='0'?String(towardCamDir()):code; refreshVox(); plop();
}
function selectEdit(id){editSel=id;document.querySelectorAll('#editTray .it').forEach(b=>b.classList.toggle('on',b.dataset.id===id));}
function renderEditTray(){
  const el=$('#editItems'); el.innerHTML='';
  for(const bl of BLOCKS){
    const id='B_'+bl.c,b=document.createElement('button'); b.className='it'+(editSel===id?' on':''); b.dataset.id=id;
    b.innerHTML=`<span class="ball">${thumbs[id]?`<img alt="" src="${thumbs[id]}">`:''}</span><span>${bl.label}</span>`;
    b.addEventListener('click',()=>{ac();plop();selectEdit(id);if(bl.c==='0')hint('Die Schräge fällt immer zu dir hin ab. Dreh dich um das Haus für die andere Seite.',4500);if(bl.c==='d')hint('Tippe auf eine Wand. Die Tür wird dort hineingebaut.',3500);});
    el.appendChild(b);
  }
}
editSel='B_z';
document.querySelectorAll('#editTools .it').forEach(b=>b.addEventListener('click',()=>{ac();plop();selectEdit(b.dataset.id);}));
$('#eDone').addEventListener('click',()=>{ac();closeEditor();});
$('#eUndo').addEventListener('click',()=>{ac();if(edit&&edit.undo.length){edit.v=edit.undo.pop().split('');refreshVox();tone(500,.08,'sine',.1,0,.7);}else nopeSnd();});
$('#eTemplate').addEventListener('click',()=>{ac();if(!edit)return;pushUndo();edit.v=TEMPLATE.split('');refreshVox();plop();});
$('#eClear').addEventListener('click',()=>{ac();if(!edit)return;pushUndo();edit.v=new Array(VX*VX*VY).fill('.');refreshVox();tone(200,.25,'sawtooth',.06,0,.5);hint('Alles weg. Mit dem Pfeil oben holst du es zurück.',3000);});

export { closeEditor, ec, editCam, editScene, editTap, openEditor, placeEditCam, renderEditTray };
