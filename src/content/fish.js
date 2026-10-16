// Fischarten (FISH), wo sie leben und wie sie aussehen (fishModel).
import { G, M, bake, box, mesh } from '../render/materials.js';
import { FISH, FISH_BY_ID, LAKE_CATCH, LAKE_FISH, SEA_CATCH, SEA_FISH } from './fish/index.js';

// ---------- Fische und Angeln ----------
// Die Arten selbst stehen in content/fish/<art>.js, hier nur gemeinsame Teile.
/** Zufällige Art für ein Gewässer (sea=true: Meer). forHook=true: nur Arten, die anbeißen dürfen (keine geschützten). Arten mit maxCount weichen auf die häufigste Art aus. */
function pickFish(sea,forHook){const L=forHook?(sea?SEA_CATCH:LAKE_CATCH):(sea?SEA_FISH:LAKE_FISH);let r=Math.random();for(const [t,w] of L){if((r-=w)<=0){const max=FISH_BY_ID[t].maxCount;if(max&&fishes.filter(f=>f.type===t).length>=max)return L.reduce((a,b)=>b[1]>a[1]?b:a)[0];return t;}}return L[0][0];}
const fishes=[], splashes=[];
const silGeo=(()=>{const s=new THREE.Shape();s.moveTo(0,.5);s.quadraticCurveTo(.22,.2,.17,-.2);s.lineTo(.04,-.32);s.lineTo(.2,-.5);s.lineTo(-.2,-.5);s.lineTo(-.04,-.32);s.lineTo(-.17,-.2);s.quadraticCurveTo(-.22,.2,0,.5);const g=new THREE.ShapeGeometry(s);g.rotateX(Math.PI/2);return g;})();
const silMat=new THREE.MeshBasicMaterial({color:0x08243f,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});
const finGeo=(()=>{const s=new THREE.Shape();s.moveTo(-.18,0);s.lineTo(.1,0);s.quadraticCurveTo(.02,.2,-.12,.42);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false});g.translate(0,0,-.02);g.rotateY(-Math.PI/2);return g;})();
const splashGeo=new THREE.RingGeometry(.15,.32,20);splashGeo.rotateX(-Math.PI/2);
/** Baut das 3D-Modell einer Fischart aus ihrer Datei in content/fish/. */
function fishModel(type){
  const g=new THREE.Group(),fl=M('#F28C28');
  const body=(c,sx,sy,sz,y,z)=>{const m=mesh(G('fb',()=>new THREE.IcosahedronGeometry(.5,1)),M(c,{flatShading:true}),0,y,z,g);m.scale.set(sx,sy,sz);return m;};
  FISH_BY_ID[type].model({g,body,box,mesh,M,finGeo,fl});
  return bake(g);
}

export { FISH, finGeo, fishModel, fishes, pickFish, silGeo, silMat, splashGeo, splashes };
