// 3D-Modelle für Autos, Züge, Fähre, Boote und U-Boot.
import './buildings.js'; // Ladereihenfolge: dieses Modul läuft nach content/models/buildings.js
import { BX, G, M, bake, box, glassMat, headMat, mesh, polBlue, polRed, tailMat, winMat } from '../../render/materials.js';

// ---------- Autos ----------
const wheelGeo=(r,w)=>G('wh'+r+'_'+w,()=>{const g=new THREE.CylinderGeometry(r,r,w,14);g.rotateZ(Math.PI/2);return g;});
function prof(key,pts,width){return G('pf'+key,()=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)s.lineTo(pts[k][0],pts[k][1]);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:false});e.translate(0,0,-width/2);e.rotateY(-Math.PI/2);return e;});}
function wheels(g,xs,zs,r){const tire=M('#1A1A1A',{roughness:.9}),hub=M('#C8CCD0',{metalness:.5,roughness:.4});for(const x of xs)for(const z of zs){mesh(wheelGeo(r,.2),tire,x,r,z,g);mesh(wheelGeo(+(r*.5).toFixed(3),.22),hub,x,r,z,g);}}
function lights(g,y,zf,zb,xs){for(const x of xs){box(g,headMat,.22,.07,.04,x,y,zf);box(g,tailMat,.24,.06,.04,x,y+.08,zb);}}
function carModel(type){
  const g=new THREE.Group();
  if(type==='uboot'){
    const y=M('#F5C211',{roughness:.4,metalness:.25}),dk=M('#2A2D31');
    mesh(G('subbody',()=>{const c=new THREE.CylinderGeometry(.55,.55,2.3,16);c.rotateX(Math.PI/2);return c;}),y,0,.2,0,g);
    for(const z of[-1.15,1.15]){const e=mesh(G('subend',()=>new THREE.SphereGeometry(.55,16,10)),y,0,.2,z,g);e.scale.set(1,1,z>0?1.25:.9);}
    box(g,y,.5,.6,.95,0,.85,-.1);
    box(g,dk,.52,.14,.97,0,1.08,-.1,false);
    mesh(G('peri',()=>new THREE.CylinderGeometry(.04,.04,.6,6)),'#5A6168',.12,1.4,.15,g);box(g,'#5A6168',.08,.08,.22,.12,1.68,.24);
    for(const z of[-.6,0,.6])for(const x of[-1,1]){const w=mesh(G('port',()=>{const c=new THREE.CylinderGeometry(.13,.13,.06,12);c.rotateZ(Math.PI/2);return c;}),winMat,x*.54,.32,z,g,false);}
    box(g,y,1.5,.06,.35,0,.2,-1.3); box(g,y,.06,.7,.35,0,.25,-1.3);
    mesh(BX(.22,.14,.06),headMat,0,.25,1.83,g,false);
    const pr=new THREE.Group();pr.position.set(0,.2,-1.68);g.add(pr);
    for(const a of[0,Math.PI/2]){const bl=box(pr,'#C9A227',.08,.6,.05,0,0,0);bl.rotation.z=a;}
    pr.children.forEach(m=>{m.userData.keep=true;m.userData.prop=1;});
    const out=bake(g);out.userData.props=out.children.filter(m=>m.userData.prop);return out;
  }
  if(type==='boot'){
    const hull=M('#F4F4F2',{roughness:.5});
    box(g,hull,1.4,.5,2.4,0,.05,-.15);
    const bow=box(g,hull,1.0,.5,1.0,0,.05,1.0);bow.rotation.y=Math.PI/4;bow.scale.set(1,1,1);
    box(g,'#2F5E9E',1.42,.12,2.42,0,.22,-.15,false);
    const bs=box(g,'#2F5E9E',1.02,.12,1.02,0,.22,1.0,false);bs.rotation.y=Math.PI/4;
    box(g,'#9B7650',1.2,.05,2.2,0,.3,-.15,false);
    box(g,'#F4F4F2',.9,.75,.8,0,.7,-.55);
    box(g,glassMat,.92,.28,.82,0,.86,-.55,false);
    box(g,'#D7261E',1.05,.1,.95,0,1.12,-.55);
    mesh(G('mast',()=>new THREE.CylinderGeometry(.04,.04,1.3,6)),'#5A4630',0,1.5,-.55,g);
    const rod=mesh(G('rod',()=>new THREE.CylinderGeometry(.025,.035,1.7,6)),'#3A2A1A',.45,1.0,.55,g);rod.rotation.x=.9;
    for(const z of[-1.1,-.85])box(g,'#F28C28',.3,.18,.18,-.45,.42,z,false);
    box(g,'#6E737A',.35,.25,.35,.4,.45,-1.05);
    mesh(BX(.12,.08,.12),headMat,0,1.22,-.2,g,false);
    return bake(g);
  }
  if(type==='lambo'){
    const b=M('#F5C211',{roughness:.35,metalness:.35});
    mesh(prof('lb',[[-1.1,.18],[1.12,.18],[1.12,.32],[.55,.46],[-1.1,.52]],.96),b,0,0,0,g);
    mesh(prof('lbc',[[.55,.45],[.1,.72],[-.55,.7],[-.88,.5]],.84),glassMat,0,0,0,g);
    box(g,'#1E1E1E',.92,.04,.24,0,.78,-.96); box(g,'#1E1E1E',.05,.26,.05,-.33,.64,-.96); box(g,'#1E1E1E',.05,.26,.05,.33,.64,-.96);
    box(g,'#1E1E1E',.02,.12,.35,.485,.32,-.2); box(g,'#1E1E1E',.02,.12,.35,-.485,.32,-.2);
    wheels(g,[-.46,.46],[-.7,.72],.22); lights(g,.34,1.12,-1.12,[-.3,.3]);
  } else if(type==='ferrari'){
    const b=M('#D10F1A',{roughness:.3,metalness:.35});
    mesh(prof('fr',[[-1.12,.2],[1.12,.2],[1.15,.33],[.75,.43],[-1.05,.5],[-1.13,.42]],.96),b,0,0,0,g);
    mesh(prof('frc',[[.42,.44],[.02,.75],[-.48,.75],[-.82,.48]],.82),glassMat,0,0,0,g);
    box(g,'#FFD23F',.12,.04,.12,0,.43,.95);
    box(g,'#1E1E1E',.02,.14,.4,.485,.33,-.25); box(g,'#1E1E1E',.02,.14,.4,-.485,.33,-.25);
    wheels(g,[-.46,.46],[-.7,.72],.22); lights(g,.35,1.14,-1.13,[-.3,.3]);
  } else if(type==='polizei'){
    const b=M('#F4F6F8',{roughness:.4,metalness:.2});
    mesh(prof('po',[[-1.1,.22],[1.1,.22],[1.1,.56],[-1.1,.6]],.98),b,0,0,0,g);
    mesh(prof('poc',[[.56,.56],[.28,.92],[-.55,.92],[-.82,.6]],.88),glassMat,0,0,0,g);
    box(g,'#F4F6F8',.86,.05,.82,0,.94,-.13);
    box(g,'#1E5AA8',1,.11,1.95,0,.42,0);
    mesh(BX(.32,.11,.2),polBlue,-.17,1.02,-.12,g,false); mesh(BX(.32,.11,.2),polRed,.17,1.02,-.12,g,false);
    wheels(g,[-.47,.47],[-.68,.7],.23); lights(g,.44,1.11,-1.11,[-.32,.32]);
  } else if(type==='feuerwehrauto'){
    const b=M('#D7261E',{roughness:.45,metalness:.2});
    box(g,b,1.12,1.0,.95,0,.82,1.02); box(g,glassMat,1.0,.42,.04,0,1.05,1.5);
    box(g,b,1.12,1.15,2.05,0,.88,-.5); box(g,'#F2F2F2',1.14,.12,2.06,0,.62,-.5);
    box(g,'#C9CDD2',.08,.08,2.4,-.3,1.55,-.3); box(g,'#C9CDD2',.08,.08,2.4,.3,1.55,-.3);
    for(let k=0;k<7;k++) box(g,'#C9CDD2',.6,.05,.05,0,1.55,-1.4+k*.36);
    mesh(BX(.5,.12,.2),polBlue,0,1.38,1.1,g,false);
    wheels(g,[-.5,.5],[-1.0,1.0],.3); lights(g,.5,1.5,-1.53,[-.35,.35]);
  } else {
    const b=M('#E4572E',{roughness:.5});
    box(g,b,1.22,1.3,3.3,0,.95,0); box(g,glassMat,1.24,.46,3.05,0,1.2,-.05); box(g,glassMat,1.05,.6,.04,0,1.15,1.66);
    box(g,'#F7F3EA',1.22,.08,3.3,0,1.64,0); box(g,'#3A3F46',.05,.9,.7,.62,.75,.6);
    wheels(g,[-.55,.55],[-1.1,1.1],.3); lights(g,.5,1.66,-1.66,[-.4,.4]);
  }
  return bake(g);
}

export { carModel, wheelGeo };
