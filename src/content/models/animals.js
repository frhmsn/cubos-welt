// 3D-Modelle für Tiere.
import './vehicles.js'; // Ladereihenfolge: dieses Modul läuft nach content/models/vehicles.js
import { G, bake, box, mesh } from '../../render/materials.js';

// ---------- Tiere ----------
function leg(g,legs,w,h,x,y,z,col,phase){const geo=G('leg'+w+'_'+h,()=>{const b=new THREE.BoxGeometry(w,h,w);b.translate(0,-h/2,0);return b;});const m=mesh(geo,col,x,y,z,g);m.userData.keep=true;m.userData.p=phase;legs.push(m);}
function animalModel(type){
  const g=new THREE.Group(),legs=[];
  if(type==='hund'){
    const c='#A0673A';
    box(g,c,.32,.3,.72,0,.47,0); box(g,c,.3,.28,.32,0,.66,.46); box(g,'#7A4A28',.16,.13,.16,0,.6,.66); box(g,'#151515',.07,.06,.04,0,.63,.75);
    box(g,'#6B3F20',.08,.16,.1,-.13,.78,.42); box(g,'#6B3F20',.08,.16,.1,.13,.78,.42);
    const t=box(g,c,.07,.07,.32,0,.62,-.46); t.rotation.x=-.6;
    leg(g,legs,.09,.33,-.1,.34,.26,c,0); leg(g,legs,.09,.33,.1,.34,.26,c,Math.PI); leg(g,legs,.09,.33,-.1,.34,-.26,c,Math.PI); leg(g,legs,.09,.33,.1,.34,-.26,c,0);
  } else if(type==='kuh'){
    const c='#F7F7F2',p='#1D1D1D';
    box(g,c,.72,.66,1.32,0,1.02,0); box(g,p,.74,.32,.36,0,1.1,.15); box(g,p,.4,.04,.4,.1,1.36,-.35); box(g,p,.74,.25,.25,0,.92,-.4);
    box(g,c,.42,.42,.46,0,1.18,.84); box(g,'#F2A7A7',.36,.2,.12,0,1.06,1.1); box(g,'#EDE3C8',.08,.14,.08,-.18,1.45,.8); box(g,'#EDE3C8',.08,.14,.08,.18,1.45,.8);
    box(g,'#F2A7A7',.3,.14,.3,0,.66,-.3);
    leg(g,legs,.15,.7,-.23,.72,.45,c,0); leg(g,legs,.15,.7,.23,.72,.45,c,Math.PI); leg(g,legs,.15,.7,-.23,.72,-.45,c,Math.PI); leg(g,legs,.15,.7,.23,.72,-.45,c,0);
  } else if(type==='pferd'){
    const c='#8B5A2B',m='#3A2414';
    box(g,c,.52,.56,1.34,0,1.3,0);
    const nk=box(g,c,.3,.75,.32,0,1.68,.62); nk.rotation.x=.55;
    const hd=box(g,c,.28,.28,.58,0,2.0,.92); hd.rotation.x=.35;
    const mn=box(g,m,.08,.7,.14,0,1.75,.5); mn.rotation.x=.55;
    const tl=box(g,m,.1,.6,.12,0,1.15,-.72); tl.rotation.x=-.35;
    leg(g,legs,.13,1.02,-.17,1.05,.5,c,0); leg(g,legs,.13,1.02,.17,1.05,.5,c,Math.PI); leg(g,legs,.13,1.02,-.17,1.05,-.5,c,Math.PI); leg(g,legs,.13,1.02,.17,1.05,-.5,c,0);
  } else {
    box(g,'#FBFBF7',.28,.28,.36,0,.33,0); box(g,'#FBFBF7',.17,.2,.17,0,.55,.17); box(g,'#E23B2E',.05,.1,.14,0,.7,.17);
    box(g,'#F5A623',.07,.05,.1,0,.55,.29); box(g,'#E23B2E',.05,.08,.04,0,.47,.27); box(g,'#EDEDE6',.05,.2,.16,0,.45,-.2);
    leg(g,legs,.04,.2,-.07,.2,0,'#F5A623',0); leg(g,legs,.04,.2,.07,.2,0,'#F5A623',Math.PI);
  }
  const out=bake(g);
  out.userData.legs=out.children.filter(o=>o.userData.keep);
  return out;
}

export { animalModel };
