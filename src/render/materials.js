// Material- und Geometrie-Cache, Bau-Helfer (box, mesh), Nacht-Materialien, Wasser.
import './renderer.js'; // Ladereihenfolge: dieses Modul läuft nach render/renderer.js

// ---------- Material & Geometrie ----------
const geoC={}, matC={};
const G=(k,fn)=>geoC[k]||(geoC[k]=fn());
const BX=(w,h,d)=>G('b'+w+'_'+h+'_'+d,()=>new THREE.BoxGeometry(w,h,d));
function M(c,o){const k=c+'|'+(o?JSON.stringify(o):'');if(!matC[k])matC[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o||{}));return matC[k];}
function mesh(geo,mat,x,y,z,parent,cast){const m=new THREE.Mesh(geo,typeof mat==='string'?M(mat):mat);m.position.set(x,y,z);m.castShadow=cast!==false;m.receiveShadow=true;if(parent)parent.add(m);return m;}
const box=(p,mat,w,h,d,x,y,z,cast)=>mesh(BX(w,h,d),mat,x,y,z,p,cast);
const nightMats=[];
function nightMat(params,base,k){const m=new THREE.MeshStandardMaterial(params);nightMats.push({m,base,k});return m;}
const winMat=nightMat({color:0x9cc2d8,emissive:0xffc45e,roughness:.25,metalness:.1},0,1.15);
const bulbMat=nightMat({color:0xfff6d0,emissive:0xffe08a},.25,1.6);
const headMat=nightMat({color:0xffffee,emissive:0xffffd0},.3,1.4);
const tailMat=nightMat({color:0x991111,emissive:0xff2020},.3,1.1);
const glassMat=M('#1C2633',{roughness:.2,metalness:.3});
const waterMat=new THREE.MeshStandardMaterial({color:0x3da9e6,roughness:.45,metalness:0});
const seaTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#1E6FB8';x.fillRect(0,0,64,64);
  x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=2;
  for(const [cx,cy] of [[10,12],[42,8],[26,30],[56,40],[8,50],[36,54]])for(const ox of[-64,0,64])for(const oy of[-64,0,64]){x.beginPath();x.arc(cx+ox,cy+oy,6,Math.PI*1.15,Math.PI*1.85);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const seaMat=new THREE.MeshStandardMaterial({map:seaTex,roughness:.6,metalness:0});
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const glowWarm=new THREE.MeshBasicMaterial({map:glowTex,color:0xffcf80,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2});
const glowFire=new THREE.MeshBasicMaterial({map:glowTex,color:0xff8a30,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2});
const flameMat=new THREE.MeshBasicMaterial({color:0xff7a1a});
const flameCore=new THREE.MeshBasicMaterial({color:0xffd34a});
const fairyMats=['#FF4D5E','#FFD23F','#4CD964','#3FA7FF','#FF7BD5'].map(c=>nightMat({color:c,emissive:c},.45,1.4));
const doorMat=(()=>{const c=document.createElement('canvas');c.width=16;c.height=64;const x=c.getContext('2d');x.fillStyle='#E4E6E9';x.fillRect(0,0,16,64);x.fillStyle='#B9BEC4';for(let k=0;k<8;k++)x.fillRect(0,k*8+6,16,2);const t=new THREE.CanvasTexture(c);return new THREE.MeshStandardMaterial({map:t,roughness:.5,metalness:.15});})();
const floodMat=nightMat({color:0xf4f8ff,emissive:0xf4f8ff},.2,1.8);
const polBlue=new THREE.MeshStandardMaterial({color:0x2a5bd7,emissive:0x2a6bff,emissiveIntensity:0});
const polRed=new THREE.MeshStandardMaterial({color:0xc42020,emissive:0xff2020,emissiveIntensity:0});
const [facMap,facEm]=(()=>{const W=128,H=256,a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=W;a.height=b.height=H;
  const x=a.getContext('2d'),y=b.getContext('2d');x.fillStyle='#B7C1CA';x.fillRect(0,0,W,H);y.fillStyle='#000';y.fillRect(0,0,W,H);
  for(let r=0;r<8;r++)for(let c=0;c<4;c++){x.fillStyle='#3E5468';x.fillRect(c*32+6,r*32+6,20,22);if(Math.random()<.55){y.fillStyle='#ffd27a';y.fillRect(c*32+6,r*32+6,20,22);}}
  return [new THREE.CanvasTexture(a),new THREE.CanvasTexture(b)];})();
const facadeMat=nightMat({map:facMap,emissiveMap:facEm,emissive:0xffffff,roughness:.6},0,1.0);

/* Mehrere kleine Meshes zu wenigen großen zusammenfassen (wichtig fürs iPhone) */
function bake(group){
  group.updateMatrixWorld(true);
  const buckets=new Map(), keep=[];
  group.traverse(o=>{
    if(!o.isMesh)return;
    if(Array.isArray(o.material)||o.userData.keep){keep.push(o);return;}
    let b=buckets.get(o.material); if(!b){b={geos:[],cast:false};buckets.set(o.material,b);}
    const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
    g.applyMatrix4(o.matrixWorld); b.geos.push(g); if(o.castShadow)b.cast=true;
  });
  const out=new THREE.Group();
  for(const [mat,b] of buckets){
    let n=0; for(const g of b.geos)n+=g.attributes.position.count;
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2); let o=0;
    for(const g of b.geos){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;g.dispose();}
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    geo.computeBoundingSphere();
    const m=new THREE.Mesh(geo,mat);m.castShadow=b.cast;m.receiveShadow=true;m.userData.own=true;out.add(m);
  }
  for(const k of keep){const mw=k.matrixWorld.clone();if(k.parent)k.parent.remove(k);mw.decompose(k.position,k.quaternion,k.scale);out.add(k);}
  return out;
}
function disposeGroup(g){if(!g)return;g.traverse(o=>{if(o.isMesh&&o.userData.own)o.geometry.dispose();});}

export { BX, G, M, bake, box, bulbMat, disposeGroup, doorMat, facadeMat, fairyMats, flameCore, flameMat, floodMat, glassMat, glowFire, glowTex, glowWarm, headMat, mesh, nightMat, nightMats, polBlue, polRed, seaMat, seaTex, tailMat, waterMat, winMat };
