// Touch- und Maus-Eingabe im Baumodus (tippen, malen, zoomen, drehen).
import '../systems/build.js'; // Ladereihenfolge: dieses Modul läuft nach systems/build.js
import { game } from '../core/state.js';
import { clamp } from '../core/util.js';
import { ZMAX } from '../core/grid.js';
import { ITEMS } from '../content/catalog.js';
import { canvas } from '../render/renderer.js';
import { ac } from '../systems/audio.js';
import { bc, panBy } from '../render/build-camera.js';
import { apply, pickTile } from '../systems/build.js';
import { saveSoon } from '../core/save.js';
import { ec, editTap } from '../systems/editor.js';

// ---------- Eingabe Bauen ----------
const ptrs=new Map(); game.gest = null; let lastPaint=null;
function two(){const [a,b]=[...ptrs.values()];return{d:Math.hypot(a.x-b.x,a.y-b.y),a:Math.atan2(b.y-a.y,b.x-a.x),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};}
function paintAt(x,y){const t=pickTile(x,y);if(!t)return;const key=t.i+','+t.j;if(key===lastPaint)return;lastPaint=key;apply(t.i,t.j,true);}
canvas.addEventListener('pointerdown',e=>{
  if(game.mode!=='build'&&game.mode!=='edit')return; ac();
  try{canvas.setPointerCapture(e.pointerId);}catch(_){}
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});
  if(ptrs.size===1)game.gest={type:'pending'};
  else if(ptrs.size===2)game.gest=Object.assign({type:'two'},two());
});
canvas.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId); if(!p||!game.gest)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  if(game.mode==='edit'){
    if(game.gest.type==='pending'&&Math.hypot(p.x-p.sx,p.y-p.sy)>9)game.gest.type='orbit';
    if(game.gest.type==='orbit'){ec.yaw-=dx*.009;ec.pitch=clamp(ec.pitch+dy*.007,.08,1.45);}
    else if(game.gest.type==='two'&&ptrs.size===2){const n=two();ec.d=clamp(ec.d*game.gest.d/Math.max(n.d,1),4,22);let da=n.a-game.gest.a;da=Math.atan2(Math.sin(da),Math.cos(da));ec.yaw-=da;Object.assign(game.gest,n);}
    return;
  }
  if(game.gest.type==='pending'&&Math.hypot(p.x-p.sx,p.y-p.sy)>9){
    if(game.sel!=='hand'&&ITEMS[game.sel].paint){game.gest.type='paint';lastPaint=null;paintAt(p.sx,p.sy);}else game.gest.type='pan';
  }
  if(game.gest.type==='pan')panBy(dx,dy);
  else if(game.gest.type==='paint')paintAt(p.x,p.y);
  else if(game.gest.type==='two'&&ptrs.size===2){
    const n=two(); bc.d=clamp(bc.d*game.gest.d/Math.max(n.d,1),12,ZMAX());
    let da=n.a-game.gest.a; da=Math.atan2(Math.sin(da),Math.cos(da)); bc.yaw-=da; bc.yawT-=da;
    panBy(n.mx-game.gest.mx,n.my-game.gest.my); Object.assign(game.gest,n);
  }
});
function endPtr(e){
  const p=ptrs.get(e.pointerId); if(!p)return;
  if(game.gest&&game.gest.type==='pending'&&ptrs.size===1){if(game.mode==='edit')editTap(p.x,p.y);else{const t=pickTile(p.x,p.y);if(t)apply(t.i,t.j,false);}}
  ptrs.delete(e.pointerId);
  if(ptrs.size===0){game.gest=null;if(game.dirty)saveSoon();}else if(game.gest&&game.gest.type==='two')game.gest={type:'done'};
}
canvas.addEventListener('pointerup',endPtr); canvas.addEventListener('pointercancel',endPtr);
canvas.addEventListener('wheel',e=>{e.preventDefault();if(game.mode==='edit'){ec.d=clamp(ec.d*(1+e.deltaY*.0012),4,22);return;}bc.d=clamp(bc.d*(1+e.deltaY*.0012),12,ZMAX());},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());

export { ptrs };
