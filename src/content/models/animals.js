// Gemeinsame Teile für Tiermodelle (Beine) und animalModel(). Die Tiere selbst: content/animals/.
import { G, M, bake, box, mesh } from '../../render/materials.js';
import { ANIMAL_BY_ID } from '../animals/index.js';

// ---------- Tiere ----------
function leg(g,legs,w,h,x,y,z,col,phase){const geo=G('leg'+w+'_'+h,()=>{const b=new THREE.BoxGeometry(w,h,w);b.translate(0,-h/2,0);return b;});const m=mesh(geo,col,x,y,z,g);m.userData.keep=true;m.userData.p=phase;legs.push(m);}
/** Baut das 3D-Modell eines Tiers aus seiner Datei in content/animals/. */
function animalModel(type){
  const g=new THREE.Group(),legs=[];
  ANIMAL_BY_ID[type].model({g,box,mesh,M,G,leg,legs});
  const out=bake(g);
  out.userData.legs=out.children.filter(o=>o.userData.keep);
  return out;
}

export { animalModel };
