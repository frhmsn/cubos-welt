// Walarten (WHALE) und ihr Aussehen (whaleModel).
import { G, M, bake, box, mesh } from '../render/materials.js';
import { WHALE, WHALE_BY_ID } from './whales/index.js';

// ---------- Wale ----------
// Die Arten stehen in content/whales/<art>.js.
/** Baut das 3D-Modell einer Walart. */
function whaleModel(type){
  const g=new THREE.Group();
  const ell=(c,sx,sy,sz,x,y,z)=>{const m=mesh(G('wb',()=>new THREE.IcosahedronGeometry(.5,2)),M(c,{flatShading:true}),x||0,y,z,g);m.scale.set(sx,sy,sz);return m;};
  const fluke=(c,w,z)=>{for(const x of[-1,1]){const f=box(g,c,w,.08,.7,x*w*.42,0,z);f.rotation.y=x*.35;}box(g,c,.3,.1,.5,0,0,z+.2);};
  WHALE_BY_ID[type].model({g,ell,fluke,box});
  return bake(g);
}

export { WHALE, whaleModel };
