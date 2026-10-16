// Bau-Helfer für Gebäude (shell, gable, glow ...) und MODELS: Modell-Funktion je Gebäude-ID.
// Die Gebäude selbst: content/buildings/. Sonderfälle: MODELS.eigen (Bauwerkstatt, blocks.js), MODELS.teil (Platzhalter bei 3x3-Bauten).
import { mulberry } from '../../core/util.js';
import { BX, G, M, box, bulbMat, doorMat, facadeMat, fairyMats, flameCore, flameMat, floodMat, glowFire, glowWarm, mesh, polBlue, winMat } from '../../render/materials.js';
import { signMat } from './rail.js';
import { BUILDING_LIST } from '../buildings/index.js';
import { fishModel } from '../fish.js';

// ---------- Häuser ----------
function shell(g,cols,o){
  const w=o.w||3.2,d=o.d||3.2,h=o.h||2.8,doorW=o.doorW||1.1,doorH=o.doorH||2.1,winW=o.winW||.7,winH=o.winH||.7,winY=o.winY||1.5;
  const t=.16,hw=w/2,hd=d/2,wm=M(o.wall);
  box(g,wm,w,h,t,0,h/2,-hd+t/2); cols.push(['b',-hw,hw,-hd,-hd+t]);
  box(g,wm,t,h,d,-hw+t/2,h/2,0); cols.push(['b',-hw,-hw+t,-hd,hd]);
  box(g,wm,t,h,d,hw-t/2,h/2,0); cols.push(['b',hw-t,hw,-hd,hd]);
  const sw=(w-doorW)/2;
  box(g,wm,sw,h,t,-hw+sw/2,h/2,hd-t/2); cols.push(['b',-hw,-hw+sw,hd-t,hd]);
  box(g,wm,sw,h,t,hw-sw/2,h/2,hd-t/2); cols.push(['b',hw-sw,hw,hd-t,hd]);
  box(g,wm,doorW,h-doorH,t,0,doorH+(h-doorH)/2,hd-t/2);
  box(g,o.floor||'#C8955B',w-2*t,.04,d-2*t,0,.02,0,false);
  box(g,'#FBF7EE',w-2*t,.04,d-2*t,0,h-.03,0,false);
  const pane=(x,z,r)=>{const m=mesh(BX(winW,winH,t+.05),winMat,x,winY,z,g,false);m.rotation.y=r;const s=mesh(BX(winW+.14,.06,t+.16),'#FFFFFF',x,winY-winH/2-.03,z,g,false);s.rotation.y=r;};
  pane(-w/4,-hd+t/2,0); pane(w/4,-hd+t/2,0);
  pane(-hw+t/2,0,Math.PI/2); pane(hw-t/2,0,Math.PI/2);
  if(sw>winW+.25){pane(-hw+sw/2,hd-t/2,0);pane(hw-sw/2,hd-t/2,0);}
  mesh(BX(.3,.07,.3),bulbMat,0,h-.08,0,g,false);
  box(g,'#7A5A3A',doorW-.1,.02,.45,0,.015,hd+.28,false);
  // Tür zum Auf- und Zumachen: Drehpunkt an der linken Kante (world.js meldet sie an, ui/places.js zeigt den Knopf)
  const lw=doorW-.06,lh=doorH-.03;
  const leaf=mesh(G('leaf'+lw+'_'+lh,()=>new THREE.BoxGeometry(lw,lh,.07).translate(lw/2,lh/2,0)),M('#A8743E'),-lw/2,0,hd-t/2,g);
  leaf.userData.keep=true;leaf.userData.leaf={w:lw,col:['b',-doorW/2,doorW/2,hd-t-.04,hd+.04]};
}
function gable(g,w,d,h,wall,roof){
  const geo=G('gab'+w+'_'+d,()=>{const s=new THREE.Shape();s.moveTo(-w/2-.3,0);s.lineTo(w/2+.3,0);s.lineTo(0,1.35);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:d+.4,bevelEnabled:false});e.translate(0,0,-(d+.4)/2);return e;});
  const m=new THREE.Mesh(geo,[M(wall),M(roof,{flatShading:true})]);m.position.y=h;m.castShadow=true;m.receiveShadow=true;g.add(m);
}
function chair(g,x,z,r,col){const c=new THREE.Group();box(c,col,.38,.05,.38,0,.45,0);box(c,col,.38,.45,.05,0,.7,-.17);box(c,col,.06,.45,.06,0,.22,0);c.position.set(x,0,z);c.rotation.y=r;g.add(c);}
function plant(g,x,z,s){box(g,'#C2703D',.3*s,.35*s,.3*s,x,.175*s,z);mesh(G('ico.35',()=>new THREE.IcosahedronGeometry(.35,0)),M('#3E9B4F',{flatShading:true}),x,.6*s,z,g).scale.setScalar(s);}

const MODELS={};

const tankWater=new THREE.MeshStandardMaterial({color:0x48B4E0,transparent:true,opacity:.3,roughness:.1,depthWrite:false});
const tankGlass=new THREE.MeshStandardMaterial({color:0xdff4ff,transparent:true,opacity:.12,roughness:.05,depthWrite:false});
const AQ_R=5.6,AQ_H=4.4,AQ_GAP=.48;

MODELS.teil=()=>({g:new THREE.Group(),cols:[],lights:[]});
function glow(g,mat,x,z,r){const m=mesh(G('glowp',()=>{const p=new THREE.PlaneGeometry(1,1);p.rotateX(-Math.PI/2);return p;}),mat,x,.03,z,g,false);m.scale.set(r*2,1,r*2);m.receiveShadow=false;return m;}

/** Alles, was Gebäude-Dateien zum Bauen bekommen. */
const H={mulberry,BX,G,M,box,bulbMat,doorMat,facadeMat,fairyMats,flameCore,flameMat,floodMat,glowFire,glowWarm,mesh,polBlue,winMat,signMat,fishModel,shell,gable,chair,plant,glow,tankWater,tankGlass,AQ_R,AQ_H,AQ_GAP};
for(const b of BUILDING_LIST)MODELS[b.id]=(seed,o)=>b.model(seed,o,H);

export { AQ_R, MODELS };
