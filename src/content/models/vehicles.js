// Gemeinsame Teile für Fahrzeugmodelle (Räder, Lichter, Profile) und carModel(). Die Fahrzeuge selbst: content/vehicles/.
import { BX, G, M, bake, box, glassMat, headMat, mesh, polBlue, polRed, tailMat, winMat } from '../../render/materials.js';
import { VEHICLE_BY_ID } from '../vehicles/index.js';

// ---------- Autos ----------
const wheelGeo=(r,w)=>G('wh'+r+'_'+w,()=>{const g=new THREE.CylinderGeometry(r,r,w,14);g.rotateZ(Math.PI/2);return g;});
function prof(key,pts,width){return G('pf'+key,()=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)s.lineTo(pts[k][0],pts[k][1]);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:false});e.translate(0,0,-width/2);e.rotateY(-Math.PI/2);return e;});}
function wheels(g,xs,zs,r){const tire=M('#1A1A1A',{roughness:.9}),hub=M('#C8CCD0',{metalness:.5,roughness:.4});for(const x of xs)for(const z of zs){mesh(wheelGeo(r,.2),tire,x,r,z,g);mesh(wheelGeo(+(r*.5).toFixed(3),.22),hub,x,r,z,g);}}
function lights(g,y,zf,zb,xs){for(const x of xs){box(g,headMat,.22,.07,.04,x,y,zf);box(g,tailMat,.24,.06,.04,x,y+.08,zb);}}
/** Baut das 3D-Modell eines Fahrzeugs aus seiner Datei in content/vehicles/. */
function carModel(type){
  const g=new THREE.Group();
  const out=VEHICLE_BY_ID[type].model({g,M,G,BX,bake,box,mesh,prof,wheels,lights,glassMat,headMat,tailMat,polBlue,polRed,winMat});
  return out||bake(g);
}

export { carModel, wheelGeo };
