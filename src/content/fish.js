// Fischarten (FISH), wo sie leben und wie sie aussehen (fishModel).
import '../core/storage.js'; // Ladereihenfolge: dieses Modul läuft nach core/storage.js
import { G, M, bake, box, mesh } from '../render/materials.js';

// ---------- Fische und Angeln ----------
const FISH={
  barsch:{label:'Barsch',plural:'Barsche',len:[.18,.45],sil:.75,speed:.8,jump:1,uw:1.8,aq:.55,where:'in Seen und im Meer'},
  hecht:{label:'Hecht',plural:'Hechte',len:[.45,1.3],sil:1.2,speed:1.3,jump:1,uw:1.4,aq:.4,where:'in Seen'},
  karpfen:{label:'Karpfen',plural:'Karpfen',len:[.3,.9],sil:.95,speed:.5,jump:1,uw:1.6,aq:.5,where:'in Seen'},
  wels:{label:'Wels',plural:'Welse',len:[.8,2.6],sil:1.8,speed:.45,jump:0,uw:1.2,aq:.28,where:'in Seen'},
  stoer:{label:'Stör',plural:'Störe',len:[.8,2.5],sil:1.7,speed:.6,jump:0,uw:1.2,aq:.28,where:'in Seen und im Meer'},
  thunfisch:{label:'Thunfisch',plural:'Thunfische',len:[.8,2.2],sil:1.5,speed:1.6,jump:1,uw:1.3,aq:.36,where:'im Meer'},
  hai:{label:'Hai',plural:'Haie',len:[1.5,3.5],sil:2.5,speed:1.2,jump:0,uw:1.15,aq:.3,where:'im Meer',wow:1},
  makrele:{label:'Makrele',plural:'Makrelen',art:'eine',len:[.25,.5],sil:.7,speed:1.4,jump:1,uw:1.8,aq:.5,rs:1.6,where:'im Meer'},
  bonito:{label:'Bonito',plural:'Bonitos',len:[.4,.8],sil:.9,speed:1.5,jump:1,uw:1.6,aq:.45,rs:1.3,where:'im Meer'},
  mahimahi:{label:'Mahi-Mahi',plural:'Mahi-Mahis',len:[.6,1.6],sil:1.2,speed:1.3,jump:1,uw:1.3,aq:.36,rs:1.1,where:'im Meer'},
  barrakuda:{label:'Barrakuda',plural:'Barrakudas',len:[.6,1.8],sil:1.2,speed:1.4,jump:0,uw:1.2,aq:.32,rs:1,where:'im Meer'},
  schwertfisch:{label:'Schwertfisch',plural:'Schwertfische',len:[1.2,3],sil:2,speed:1.5,jump:1,uw:1,aq:.25,rs:.85,where:'im Meer',wow:1},
  marlin:{label:'Marlin',plural:'Marline',len:[1.5,4],sil:2.4,speed:1.7,jump:1,uw:.95,aq:.23,rs:.8,where:'im Meer',wow:1},
  mondfisch:{label:'Mondfisch',plural:'Mondfische',len:[1,3],sil:1.8,speed:.3,jump:0,uw:1,aq:.28,rs:.9,where:'im Meer',wow:1}
};
const LAKE_FISH=[['barsch',.3],['hecht',.2],['karpfen',.25],['wels',.15],['stoer',.1]];
const SEA_FISH=[['thunfisch',.2],['barsch',.1],['hai',.1],['stoer',.06],['makrele',.14],['bonito',.1],['mahimahi',.08],['barrakuda',.07],['schwertfisch',.05],['marlin',.04],['mondfisch',.06]];
function pickFish(sea){const L=sea?SEA_FISH:LAKE_FISH;let r=Math.random();for(const [t,w] of L){if((r-=w)<=0){if(t==='hai'&&fishes.filter(f=>f.type==='hai').length>=4)return 'thunfisch';return t;}}return L[0][0];}
const fishes=[], splashes=[];
const silGeo=(()=>{const s=new THREE.Shape();s.moveTo(0,.5);s.quadraticCurveTo(.22,.2,.17,-.2);s.lineTo(.04,-.32);s.lineTo(.2,-.5);s.lineTo(-.2,-.5);s.lineTo(-.04,-.32);s.lineTo(-.17,-.2);s.quadraticCurveTo(-.22,.2,0,.5);const g=new THREE.ShapeGeometry(s);g.rotateX(Math.PI/2);return g;})();
const silMat=new THREE.MeshBasicMaterial({color:0x08243f,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});
const finGeo=(()=>{const s=new THREE.Shape();s.moveTo(-.18,0);s.lineTo(.1,0);s.quadraticCurveTo(.02,.2,-.12,.42);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false});g.translate(0,0,-.02);g.rotateY(-Math.PI/2);return g;})();
const splashGeo=new THREE.RingGeometry(.15,.32,20);splashGeo.rotateX(-Math.PI/2);
function fishModel(type){
  const g=new THREE.Group(),fl=M('#F28C28');
  const body=(c,sx,sy,sz,y,z)=>{const m=mesh(G('fb',()=>new THREE.IcosahedronGeometry(.5,1)),M(c,{flatShading:true}),0,y,z,g);m.scale.set(sx,sy,sz);return m;};
  if(type==='barsch'){
    body('#7E9A3C',.28,.42,1.0,0,0); body('#E8E2B8',.24,.2,.8,-.12,.02);
    for(const z of[-.2,0,.2])box(g,'#3E4E1E',.3,.36,.06,0,.02,z,false);
    const t=box(g,fl,.04,.34,.26,0,0,-.58);t.rotation.x=.0; box(g,fl,.04,.18,.34,0,.24,-.05);
    box(g,'#151515',.3,.06,.06,0,.06,.36,false);
  } else if(type==='hecht'){
    body('#5E7A3A',.24,.28,1.5,0,0); body('#D9D8B0',.2,.14,1.3,-.08,.05);
    for(const [x,z] of[[.12,.3],[-.12,.1],[.12,-.1],[-.12,-.3],[.12,-.45],[-.12,.45]])box(g,'#C9C78A',.03,.07,.1,x,.04,z,false);
    box(g,'#5E7A3A',.16,.1,.36,0,-.02,.8);
    box(g,'#7A6A2E',.04,.24,.26,0,.18,-.5); const t=box(g,'#7A6A2E',.04,.34,.24,0,0,-.86);
    box(g,'#151515',.26,.05,.05,0,.06,.6,false);
  } else if(type==='karpfen'){
    body('#B8862E',.34,.56,1.0,0,0); body('#E2C27A',.3,.3,.85,-.12,.02);
    for(const z of[-.25,-.05,.15])for(const y of[.1,-.05])box(g,'#9C6E22',.36,.06,.05,0,y,z,false);
    box(g,'#A0522D',.04,.22,.5,0,.3,-.05); const t=box(g,'#A0522D',.04,.4,.26,0,0,-.6);
    for(const x of[-.07,.07]){const b=box(g,'#8C6A3A',.02,.02,.14,x,-.06,.55,false);b.rotation.x=.5;}
    box(g,'#151515',.34,.06,.06,0,.08,.36,false);
  } else if(type==='wels'){
    body('#3E3A34',.46,.34,1.6,0,0); body('#8C8578',.4,.18,1.4,-.1,0);
    box(g,'#3E3A34',.5,.22,.42,0,0,.72);
    for(const x of[-1,1]){const b=box(g,'#2A2622',.03,.03,.7,x*.28,0,.95,false);b.rotation.y=x*.6;}
    for(const x of[-.06,.06]){const b=box(g,'#2A2622',.02,.02,.24,x,-.12,.86,false);b.rotation.x=.6;}
    box(g,'#3E3A34',.04,.12,.9,0,-.16,-.3); const t=box(g,'#3E3A34',.04,.34,.24,0,0,-.86);
    box(g,'#151515',.44,.05,.05,0,.08,.62,false);
  } else if(type==='stoer'){
    body('#6E6A60',.3,.3,1.7,0,0); body('#D8D2C4',.26,.16,1.5,-.08,0);
    box(g,'#6E6A60',.14,.1,.4,0,-.04,.95);
    for(let k=0;k<6;k++){const z=-.55+k*.22;box(g,'#EDE6D6',.06,.06,.08,0,.16,z,false);for(const x of[-.15,.15])box(g,'#EDE6D6',.05,.05,.07,x,.04,z,false);}
    const t1=box(g,'#6E6A60',.04,.5,.14,0,.18,-.95);t1.rotation.x=-.7;const t2=box(g,'#6E6A60',.04,.22,.12,0,-.08,-.9);t2.rotation.x=.5;
    for(const x of[-.04,.04]){const b=box(g,'#EDE6D6',.02,.02,.1,x,-.1,.95,false);b.rotation.x=.9;}
    box(g,'#151515',.32,.05,.05,0,.05,.66,false);
  } else if(type==='thunfisch'){
    body('#1F3D78',.36,.46,1.25,.03,0); body('#C9D2DA',.32,.26,1.1,-.1,0);
    const t1=box(g,'#1F3D78',.04,.5,.12,0,.2,-.74);t1.rotation.x=-.6;const t2=box(g,'#1F3D78',.04,.5,.12,0,-.2,-.74);t2.rotation.x=.6;
    for(const z of[-.3,-.42])box(g,'#F2C230',.06,.08,.06,0,.2,z,false);
    box(g,'#151515',.38,.06,.06,0,.08,.45,false);
  } else if(type==='makrele'){
    body('#2F7F8F',.2,.26,1.0,.02,0); body('#E4ECEE',.18,.14,.85,-.08,0);
    for(let k=0;k<6;k++){const b=box(g,'#16343B',.21,.04,.06,0,.09,-.3+k*.12,false);b.rotation.x=(k%2?.5:-.5);}
    const t1=box(g,'#2A5560',.04,.3,.1,0,.12,-.56);t1.rotation.x=-.6;const t2=box(g,'#2A5560',.04,.3,.1,0,-.12,-.56);t2.rotation.x=.6;
    for(const z of[-.3,-.4])box(g,'#F2D24A',.05,.06,.05,0,.14,z,false);
    box(g,'#151515',.22,.05,.05,0,.05,.36,false);
  } else if(type==='bonito'){
    body('#2D4A7A',.28,.34,1.1,.02,0); body('#D5DCE4',.26,.2,.95,-.1,0);
    for(let k=0;k<5;k++){const b=box(g,'#18294A',.29,.04,.4,0,.13,-.15+k*.1,false);b.rotation.x=.9;}
    const t1=box(g,'#2D4A7A',.04,.4,.1,0,.16,-.64);t1.rotation.x=-.6;const t2=box(g,'#2D4A7A',.04,.4,.1,0,-.16,-.64);t2.rotation.x=.6;
    box(g,'#2D4A7A',.04,.18,.22,0,.22,.05);
    box(g,'#151515',.3,.06,.06,0,.06,.4,false);
  } else if(type==='mahimahi'){
    body('#3FA34D',.28,.5,1.3,.04,0); body('#F2C230',.26,.3,1.15,-.14,-.02);
    box(g,'#3FA34D',.26,.56,.2,0,.02,.52);
    box(g,'#2E6FD0',.04,.22,1.05,0,.32,-.05);
    for(const [x,y,z] of[[.14,.05,.2],[-.14,.08,0],[.14,-.02,-.2],[-.14,0,.3],[.14,.12,-.05]])box(g,'#4FA8F0',.02,.05,.05,x,y,z,false);
    const t1=box(g,'#C9A020',.04,.4,.12,0,.16,-.72);t1.rotation.x=-.6;const t2=box(g,'#C9A020',.04,.4,.12,0,-.16,-.72);t2.rotation.x=.6;
    box(g,'#151515',.3,.06,.06,0,.12,.5,false);
  } else if(type==='barrakuda'){
    body('#8D9AA4',.18,.22,1.7,0,0); body('#E6EAEE',.16,.12,1.5,-.06,0);
    for(let k=0;k<7;k++)box(g,'#4A5560',.19,.1,.06,0,.06,-.55+k*.17,false);
    box(g,'#8D9AA4',.1,.07,.4,0,-.01,.92); box(g,'#7A858E',.08,.05,.3,0,-.06,.9);
    box(g,'#4A5560',.04,.16,.14,0,.14,.2); box(g,'#4A5560',.04,.14,.14,0,.12,-.4);
    const t1=box(g,'#4A5560',.04,.3,.1,0,.12,-.9);t1.rotation.x=-.6;const t2=box(g,'#4A5560',.04,.3,.1,0,-.12,-.9);t2.rotation.x=.6;
    box(g,'#151515',.2,.05,.05,0,.05,.68,false);
  } else if(type==='schwertfisch'){
    body('#545A6A',.32,.36,1.5,0,0); body('#C8CCD4',.28,.2,1.3,-.1,0);
    box(g,'#3E4350',.1,.04,1.0,0,.0,1.2);
    const d=box(g,'#3E4350',.04,.5,.24,0,.32,.3);d.rotation.x=-.4;
    for(const x of[-.18,.18]){const pf=box(g,'#3E4350',.3,.04,.18,x,-.12,.35);pf.rotation.z=x>0?-.5:.5;}
    const t1=box(g,'#3E4350',.04,.6,.12,0,.24,-.86);t1.rotation.x=-.7;const t2=box(g,'#3E4350',.04,.6,.12,0,-.24,-.86);t2.rotation.x=.7;
    box(g,'#151515',.34,.07,.07,0,.06,.6,false);
  } else if(type==='marlin'){
    body('#24477A',.32,.38,1.6,0,0); body('#EEF2F6',.28,.2,1.4,-.12,0);
    for(let k=0;k<7;k++)box(g,'#7FB8E8',.33,.22,.05,0,.0,-.5+k*.15,false);
    box(g,'#1B3560',.06,.06,.9,0,.02,1.2);
    box(g,'#1E3A8A',.04,.5,.85,0,.4,.05); box(g,'#3A64C8',.045,.12,.85,0,.6,.05,false);
    const t1=box(g,'#1B3560',.04,.7,.12,0,.28,-.92);t1.rotation.x=-.7;const t2=box(g,'#1B3560',.04,.7,.12,0,-.28,-.92);t2.rotation.x=.7;
    box(g,'#151515',.34,.07,.07,0,.06,.64,false);
  } else if(type==='mondfisch'){
    body('#A7AFB6',.24,1.15,1.0,0,0); body('#D9DEE2',.2,.7,.75,-.15,.05);
    box(g,'#8D959C',.05,.75,.2,0,.8,-.25); box(g,'#8D959C',.05,.75,.2,0,-.8,-.25);
    box(g,'#9CA4AB',.06,1.0,.12,0,0,-.5);
    box(g,'#8D959C',.12,.08,.06,0,-.02,.5,false);
    box(g,'#151515',.26,.08,.08,0,.18,.34,false);
  } else {
    body('#7D8A96',.42,.42,1.6,0,0); body('#F2F4F6',.36,.24,1.4,-.12,0);
    mesh(finGeo,M('#6B7782'),0,.18,.05,g).scale.set(1.4,1.4,1.4);
    const t1=box(g,'#6B7782',.05,.6,.16,0,.22,-.9);t1.rotation.x=-.55;const t2=box(g,'#6B7782',.05,.36,.14,0,-.14,-.88);t2.rotation.x=.6;
    for(const x of[-.2,.2]){const pf=box(g,'#6B7782',.4,.04,.22,x,-.12,.2);pf.rotation.z=x>0?-.4:.4;}
    box(g,'#151515',.44,.06,.06,0,.06,.6,false);
  }
  return bake(g);
}

export { FISH, finGeo, fishModel, fishes, pickFish, silGeo, silMat, splashGeo, splashes };
