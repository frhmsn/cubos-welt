// Walarten (WHALE) und ihr Aussehen (whaleModel).
import '../systems/fish.js'; // Ladereihenfolge: dieses Modul läuft nach systems/fish.js
import { G, M, bake, box, mesh } from '../render/materials.js';

// ---------- Wale ----------
const WHALE={
  buckelwal:{label:'Buckelwal',plural:'Buckelwale',sc:1,uw:.55},
  pottwal:{label:'Pottwal',plural:'Pottwale',sc:1,uw:.55},
  orca:{label:'Orca',plural:'Orcas',sc:.75,uw:.7}
};
function whaleModel(type){
  const g=new THREE.Group();
  const ell=(c,sx,sy,sz,x,y,z)=>{const m=mesh(G('wb',()=>new THREE.IcosahedronGeometry(.5,2)),M(c,{flatShading:true}),x||0,y,z,g);m.scale.set(sx,sy,sz);return m;};
  const fluke=(c,w,z)=>{for(const x of[-1,1]){const f=box(g,c,w,.08,.7,x*w*.42,0,z);f.rotation.y=x*.35;}box(g,c,.3,.1,.5,0,0,z+.2);};
  if(type==='buckelwal'){
    ell('#3A4250',2.2,1.9,7,0,0,0); ell('#D9DDE2',1.9,1.1,6.2,0,-.45,.2);
    for(let k=0;k<6;k++)box(g,'#C2C7CD',.06,.05,2.4,(k-2.5)*.2,-.92,1.4,false);
    for(const x of[-1,1]){const f=box(g,'#E4E7EA',2.8,.12,.55,x*2.1,-.4,1.2);f.rotation.set(0,x*.5,x*-.35);}
    box(g,'#3A4250',.18,.35,.5,0,.95,-1.6);
    ell('#3A4250',1,1,3,0,.05,-3.6); fluke('#3A4250',1.6,-5);
    for(const x of[-.75,.75])box(g,'#151515',.1,.12,.12,x,-.1,2.3,false);
  } else if(type==='pottwal'){
    ell('#4A4440',2.1,2.1,4.4,0,.1,1.5); box(g,'#4A4440',1.5,1.5,.8,0,.15,3.4); ell('#4A4440',2,1.9,5.4,0,0,-.8);
    box(g,'#3A3430',.6,.3,2.8,0,-.95,2.1);
    for(let k=0;k<5;k++)box(g,'#EDE6D6',.05,.12,.05,.15,-.8,1.2+k*.5,false);
    box(g,'#4A4440',.3,.3,.8,0,.95,-1.8);
    for(const x of[-1,1]){const f=box(g,'#3A3430',.9,.1,.4,x*1.1,-.5,1);f.rotation.y=x*.6;}
    ell('#4A4440',1,1,2.8,0,0,-3.9); fluke('#3A3430',1.5,-5.2);
    for(const x of[-1.01,1.01])box(g,'#151515',.05,.12,.12,x,-.2,1.2,false);
  } else {
    ell('#15171A',1.7,1.8,6,0,0,0); ell('#F4F4F2',1.4,.9,4.6,0,-.5,.6);
    for(const x of[-.7,.7])box(g,'#F4F4F2',.08,.4,.9,x*1.0,.25,1.9,false);
    box(g,'#C9CCD0',1.2,.4,.9,0,.75,-.6,false);
    const d=box(g,'#15171A',.15,1.9,.7,0,1.6,-.2);d.rotation.x=-.15;
    for(const x of[-1,1]){const f=box(g,'#15171A',1.2,.1,.7,x*1.1,-.5,1.1);f.rotation.y=x*.4;}
    ell('#15171A',.8,.8,2.6,0,0,-3.1); fluke('#15171A',1.3,-4.4);
  }
  return bake(g);
}

export { WHALE, whaleModel };
