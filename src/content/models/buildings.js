// 3D-Modelle für Häuser, Garage, Feuerwache, Aquarium, Natur und Lichter (MODELS).
import './rail.js'; // Ladereihenfolge: läuft nach content/models/rail.js (siehe docs/ARCHITEKTUR.md)
import { mulberry } from '../../core/util.js';
import { BX, G, M, box, bulbMat, doorMat, facadeMat, fairyMats, flameCore, flameMat, floodMat, glowFire, glowWarm, mesh, polBlue, winMat } from '../../render/materials.js';
import { signMat } from './rail.js';
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
}
function gable(g,w,d,h,wall,roof){
  const geo=G('gab'+w+'_'+d,()=>{const s=new THREE.Shape();s.moveTo(-w/2-.3,0);s.lineTo(w/2+.3,0);s.lineTo(0,1.35);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:d+.4,bevelEnabled:false});e.translate(0,0,-(d+.4)/2);return e;});
  const m=new THREE.Mesh(geo,[M(wall),M(roof,{flatShading:true})]);m.position.y=h;m.castShadow=true;m.receiveShadow=true;g.add(m);
}
function chair(g,x,z,r,col){const c=new THREE.Group();box(c,col,.38,.05,.38,0,.45,0);box(c,col,.38,.45,.05,0,.7,-.17);box(c,col,.06,.45,.06,0,.22,0);c.position.set(x,0,z);c.rotation.y=r;g.add(c);}
function plant(g,x,z,s){box(g,'#C2703D',.3*s,.35*s,.3*s,x,.175*s,z);mesh(G('ico.35',()=>new THREE.IcosahedronGeometry(.35,0)),M('#3E9B4F',{flatShading:true}),x,.6*s,z,g).scale.setScalar(s);}

const MODELS={
  haus(seed){
    const r=mulberry(seed),g=new THREE.Group(),cols=[];
    const wall=['#F6E6C8','#CFE3F0','#F4D2C4','#DDEBCB','#FFF1B8'][Math.floor(r()*5)];
    const roof=['#C7472E','#8E4A2F','#3F5A73','#B23A48'][Math.floor(r()*4)];
    shell(g,cols,{wall});
    gable(g,3.2,3.2,2.8,wall,roof);
    box(g,'#9C4A3A',.32,.9,.32,.8,3.55,-.7);
    box(g,'#FFFFFF',1,.35,1.7,-.85,.18,-.6); box(g,'#4A90D9',1.03,.12,1.1,-.85,.4,-.33); box(g,'#FFFFFF',.7,.12,.35,-.85,.42,-1.2);
    box(g,'#9B6A3C',.8,.06,.8,.72,.74,-.55); box(g,'#9B6A3C',.1,.72,.1,.72,.36,-.55);
    chair(g,.72,-.05,Math.PI,'#B98552'); chair(g,.72,-1.05,0,'#B98552');
    box(g,'#E06B5C',1.3,.02,.8,.2,.045,.65,false);
    return {g,cols};
  },
  villa(seed){
    const g=new THREE.Group(),cols=[];
    shell(g,cols,{w:3.4,d:3.4,wall:'#F7F6F0',winW:1,winH:1.1,doorW:1,floor:'#D7B98A'});
    box(g,'#3A3F46',3.75,.24,3.75,0,2.92,0);
    box(g,'#B07A4A',.9,2.5,.04,-1.15,1.25,1.74);
    box(g,'#5B7DB1',1.6,.4,.6,0,.25,-1.15); box(g,'#5B7DB1',1.6,.5,.18,0,.55,-1.43);
    box(g,'#5B7DB1',.6,.4,.9,-.9,.25,-.6);
    box(g,'#151515',.06,.62,1.05,1.52,1.35,-.2); box(g,'#7B5A3A',.4,.45,1.2,1.35,.23,-.2);
    plant(g,1.25,1.25,1); plant(g,-.85,1.95,.8); plant(g,.85,1.95,.8);
    return {g,cols};
  },
  hochhaus(seed){
    const g=new THREE.Group(),cols=[];
    shell(g,cols,{w:3.4,d:3.4,wall:'#7E8B96',winW:1,winH:1.2,doorW:1.2,floor:'#D9D4CC'});
    const roofM=M('#6B747C');
    const tower=new THREE.Mesh(BX(3.5,9,3.5),[facadeMat,facadeMat,roofM,roofM,facadeMat,facadeMat]);tower.position.y=2.8+4.5;tower.castShadow=true;tower.receiveShadow=true;g.add(tower);
    box(g,'#5A6168',.12,1.8,.12,.9,12.6,-.9); box(g,'#8D969E',1.2,.5,1,-.6,12.05,.4);
    box(g,'#E5E7EA',1.7,.08,.7,0,2.3,1.98);
    box(g,'#C9A06A',1.4,.95,.45,.5,.48,-.6); box(g,'#B8BEC4',.9,2,.05,-.8,1,-1.52);
    plant(g,-1.3,1.3,1);
    return {g,cols};
  },
  feuerwache(seed){
    const g=new THREE.Group(),cols=[];
    shell(g,cols,{w:3.4,d:3.4,h:3,wall:'#B5432E',doorW:2,doorH:2.4,winW:.6,floor:'#9AA0A6'});
    box(g,'#5A5F66',3.7,.22,3.7,0,3.11,0);
    box(g,'#F2F2F2',3.46,.18,3.46,0,2.55,0,false);
    box(g,'#B5432E',.9,5.8,.9,-1.25,2.9,-1.25); cols.push(['b',-1.7,-.8,-1.7,-.8]);
    box(g,'#5A5F66',1.05,.2,1.05,-1.25,5.9,-1.25);
    mesh(BX(.3,.25,.3),polBlue,-1.25,6.12,-1.25,g,false);
    mesh(G('pole',()=>new THREE.CylinderGeometry(.05,.05,3,8)),'#D9D9D9',.4,1.5,-.9,g);
    box(g,'#C0C6CC',.4,1.8,1.6,1.42,.9,-.4);
    box(g,'#F2F2F2',1.9,.04,.08,0,2.38,1.71,false);
    return {g,cols};
  },
  baum(seed){
    const r=mulberry(seed),g=new THREE.Group(),cols=[];
    const n=2+Math.floor(r()*2);
    for(let k=0;k<n;k++){
      const x=(r()-.5)*2.6,z=(r()-.5)*2.6,s=.85+r()*.45;
      mesh(G('trunk',()=>new THREE.CylinderGeometry(.12,.17,1.3,7)),'#7A5232',x,.65*s,z,g).scale.setScalar(s);
      const c=mesh(G('crown',()=>new THREE.IcosahedronGeometry(1,0)),M(['#3E9B4F','#4FAE45','#2F8A47'][k%3],{flatShading:true}),x,(1.7+r()*.3)*s,z,g);
      c.scale.set(s,s*1.1,s); c.rotation.y=r()*3;
      cols.push(['c',x,z,.3]);
    }
    return {g,cols};
  },
  tanne(seed){
    const r=mulberry(seed),g=new THREE.Group(),cols=[];
    const n=2+Math.floor(r()*2);
    for(let k=0;k<n;k++){
      const x=(r()-.5)*2.6,z=(r()-.5)*2.6,s=.85+r()*.5,f=M('#24704A',{flatShading:true});
      mesh(G('ftr',()=>new THREE.CylinderGeometry(.1,.14,.7,6)),'#6B4428',x,.35*s,z,g).scale.setScalar(s);
      [[1.05,1.3,1.1],[.82,1.1,1.75],[.55,.9,2.35]].forEach(([rad,h,y],q)=>{const c=mesh(G('cone'+q,()=>new THREE.ConeGeometry(rad,h,7)),f,x,y*s,z,g);c.scale.setScalar(s);});
      cols.push(['c',x,z,.3]);
    }
    return {g,cols};
  },
  blumen(seed){
    const r=mulberry(seed),g=new THREE.Group(),cols=[];
    for(let k=0;k<14;k++){
      const x=(r()-.5)*3.4,z=(r()-.5)*3.4;
      if(k<6){mesh(G('tuft',()=>new THREE.ConeGeometry(.12,.35,5)),'#4FA63C',x,.17,z,g,false);continue;}
      mesh(G('stem',()=>new THREE.CylinderGeometry(.02,.02,.4,4)),'#3F8A2E',x,.2,z,g,false);
      mesh(G('bloom',()=>new THREE.IcosahedronGeometry(.11,0)),M(['#E8434F','#FFD23F','#FFFFFF','#F78FB3','#9B6BD3'][k%5],{flatShading:true}),x,.43,z,g,false);
    }
    return {g,cols};
  },
  berg(seed){
    const g=new THREE.Group(),cols=[['c',0,0,1.75]];
    mesh(G('hill',()=>new THREE.ConeGeometry(1.95,2.6,7)),M('#5E9F42',{flatShading:true}),0,1.3,0,g);
    mesh(G('rock',()=>new THREE.ConeGeometry(.66,.86,7)),M('#F4F6F8',{flatShading:true}),0,2.17,0,g);
    mesh(G('stone',()=>new THREE.DodecahedronGeometry(.35,0)),M('#9AA0A6',{flatShading:true}),1.4,.2,1.2,g);
    return {g,cols};
  },
  laterne(seed){
    const g=new THREE.Group(),cols=[['c',0,0,.15]];
    mesh(G('lpole',()=>new THREE.CylinderGeometry(.06,.08,3.1,8)),'#3D434B',0,1.55,0,g);
    box(g,'#3D434B',.7,.07,.07,.32,3.08,0); box(g,'#3D434B',.36,.14,.24,.62,3.0,0);
    mesh(BX(.28,.04,.18),bulbMat,.62,2.92,0,g,false);
    glow(g,glowWarm,.62,0,2.8);
    return {g,cols,lights:[[.62,2.8,0,0xffd49a,1.7,12]]};
  },
  gartenlampe(seed){
    const g=new THREE.Group(),cols=[];
    for(const [x,z] of [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3],[0,0]]){
      box(g,'#3D434B',.18,.5,.18,x,.25,z); mesh(BX(.2,.14,.2),bulbMat,x,.57,z,g,false); box(g,'#3D434B',.26,.04,.26,x,.66,z);
      glow(g,glowWarm,x,z,1.3); cols.push(['c',x,z,.12]);
    }
    for(let k=0;k<7;k++)box(g,'#C9BFAE',.55,.03,.4,-1.5+k*.5,.015,(k%2)*.12-.06,false);
    return {g,cols,lights:[[0,.8,0,0xffe0b0,1.1,7]]};
  },
  lichterkette(seed){
    const g=new THREE.Group(),cols=[],P=[[-1.65,-1.65],[1.65,-1.65],[1.65,1.65],[-1.65,1.65]];
    for(const [x,z] of P){mesh(G('kpole',()=>new THREE.CylinderGeometry(.05,.07,2.6,6)),'#7A5232',x,1.3,z,g);cols.push(['c',x,z,.12]);}
    let n=0;
    for(let s=0;s<4;s++){
      const a=P[s],b=P[(s+1)%4],steps=8;let prev=null;
      for(let k=0;k<=steps;k++){
        const t=k/steps,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=2.5-.55*Math.sin(Math.PI*t);
        if(prev){const dx=x-prev[0],dy=y-prev[1],dz=z-prev[2],L=Math.hypot(dx,dy,dz),w=box(g,'#2A2A2A',.025,.025,L,(x+prev[0])/2,(y+prev[1])/2,(z+prev[2])/2,false);w.lookAt(x,y,z);w.position.set((x+prev[0])/2,(y+prev[1])/2,(z+prev[2])/2);w.lookAt(x,y,z);}
        if(k>0&&k<steps){mesh(G('fbulb',()=>new THREE.SphereGeometry(.09,8,6)),fairyMats[n++%5],x,y-.1,z,g,false);}
        prev=[x,y,z];
      }
    }
    glow(g,glowWarm,0,0,3.4);
    return {g,cols,lights:[[0,2.1,0,0xffc8e0,1.4,10]]};
  },
  flutlicht(seed){
    const g=new THREE.Group(),cols=[['c',0,-.6,.2]];
    mesh(G('fpole',()=>new THREE.CylinderGeometry(.1,.16,6.6,8)),'#8D969E',0,3.3,-.6,g);
    const head=new THREE.Group(); head.position.set(0,6.6,-.45); head.rotation.x=.55; g.add(head);
    box(head,'#5A6168',1.6,1.0,.18,0,0,0);
    for(const [x,y] of [[-.4,.24],[.4,.24],[-.4,-.24],[.4,-.24]]) mesh(BX(.62,.36,.06),floodMat,x,y,.11,head,false);
    box(g,'#8D969E',.8,.12,.5,0,.06,-.6);
    glow(g,glowWarm,0,1.6,5);
    return {g,cols,lights:[[0,6,.4,0xf2f6ff,2.6,24]]};
  },
  lagerfeuer(seed){
    const r=mulberry(seed),g=new THREE.Group(),cols=[['c',0,0,.9]];
    for(let k=0;k<9;k++){const a=k/9*Math.PI*2;const s=mesh(G('fstone',()=>new THREE.DodecahedronGeometry(.18,0)),M('#8E949B',{flatShading:true}),Math.cos(a)*.62,.1,Math.sin(a)*.62,g);s.rotation.set(r()*3,r()*3,0);}
    for(let k=0;k<3;k++){const l=mesh(G('flog',()=>new THREE.CylinderGeometry(.07,.08,1,6)),'#6B4428',0,.14,0,g);l.rotation.z=Math.PI/2;l.rotation.y=k*Math.PI/3;}
    const f1=mesh(G('flame1',()=>new THREE.ConeGeometry(.32,.9,7)),flameMat,0,.55,0,g,false); f1.userData.keep=true; f1.userData.flame=1;
    const f2=mesh(G('flame2',()=>new THREE.ConeGeometry(.18,.6,6)),flameCore,.04,.45,.03,g,false); f2.userData.keep=true; f2.userData.flame=2;
    glow(g,glowFire,0,0,2.4);
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4;const b=box(g,'#8B6A45',.9,.12,.3,Math.cos(a)*1.55,.25,Math.sin(a)*1.55);b.rotation.y=-a+Math.PI/2;box(g,'#6B4F32',.1,.25,.1,Math.cos(a)*1.55,.12,Math.sin(a)*1.55);}
    return {g,cols,lights:[[0,.9,0,0xff9a40,2.2,11,1]]};
  },
  garage(seed){
    const g=new THREE.Group(),cols=[],w=3.5,d=3.7,h=2.55,t=.16,hw=w/2,hd=d/2,dw=2.8,dh=2.15,wm=M('#D9D4CC');
    box(g,wm,w,h,t,0,h/2,-hd+t/2); cols.push(['b',-hw,hw,-hd,-hd+t]);
    box(g,wm,t,h,d,-hw+t/2,h/2,0); cols.push(['b',-hw,-hw+t,-hd,hd]);
    box(g,wm,t,h,d,hw-t/2,h/2,0); cols.push(['b',hw-t,hw,-hd,hd]);
    const pw=(w-dw)/2;
    box(g,wm,pw,h,t,-hw+pw/2,h/2,hd-t/2); box(g,wm,pw,h,t,hw-pw/2,h/2,hd-t/2);
    cols.push(['b',-hw,-hw+pw,hd-t,hd],['b',hw-pw,hw,hd-t,hd]);
    box(g,wm,dw,h-dh,t,0,dh+(h-dh)/2,hd-t/2);
    box(g,'#5A6168',w+.3,.2,d+.3,0,h+.1,0);
    box(g,'#A9AEB3',w-2*t,.03,d-2*t,0,.015,0,false);
    box(g,'#B8BDC2',dw+.2,.02,.9,0,.01,hd+.45,false);
    box(g,'#F2C230',.08,.02,1.6,0,.035,-.2,false);
    box(g,'#8B6A45',1.8,.08,.42,0,1.25,-hd+.37); box(g,'#8B6A45',1.8,.08,.42,0,1.8,-hd+.37);
    box(g,'#D7261E',.5,.3,.3,-.5,1.44,-hd+.37); box(g,'#3F6FB5',.4,.22,.3,.4,1.4,-hd+.37); box(g,'#F2C230',.3,.25,.3,.1,1.97,-hd+.37);
    for(let k=0;k<3;k++)mesh(G('tyre',()=>new THREE.CylinderGeometry(.32,.32,.2,12)),'#1F1F1F',hw-.5,.1+k*.21,-hd+.55,g);
    mesh(BX(.9,.06,.18),bulbMat,0,h-.07,0,g,false);
    const door=mesh(BX(dw,dh,.07),doorMat,0,dh/2,hd-.09,g); door.userData.keep=true; door.userData.door=dh;
    return {g,cols,lights:[[0,2.25,0,0xfff0d0,1.1,6]]};
  }
};
const tankWater=new THREE.MeshStandardMaterial({color:0x48B4E0,transparent:true,opacity:.3,roughness:.1,depthWrite:false});
const tankGlass=new THREE.MeshStandardMaterial({color:0xdff4ff,transparent:true,opacity:.12,roughness:.05,depthWrite:false});
const AQ_R=5.6,AQ_H=4.4,AQ_GAP=.48;
MODELS.aquarium=function(seed){
  const g=new THREE.Group(),cols=[],R=AQ_R,H=AQ_H,gap=AQ_GAP,DS=THREE.DoubleSide;
  const wallM=M('#BFEAF2',{side:DS}),inM=M('#E8F6FA',{side:DS}),trim=M('#2F7FA0');
  mesh(G('aqw1',()=>new THREE.CylinderGeometry(R,R,H,56,1,true,gap/2,Math.PI*2-gap)),wallM,0,H/2,0,g);
  mesh(G('aqw2',()=>new THREE.CylinderGeometry(R-.25,R-.25,H,56,1,true,gap/2,Math.PI*2-gap)),inM,0,H/2,0,g,false);
  mesh(G('aqwin',()=>new THREE.CylinderGeometry(R+.03,R+.03,.75,56,1,true,gap/2+.2,Math.PI*2-gap-.4)),winMat,0,3.1,0,g,false);
  mesh(G('aqbase',()=>new THREE.CylinderGeometry(R+.05,R+.05,.35,56,1,true,gap/2,Math.PI*2-gap)),trim,0,.17,0,g,false);
  mesh(G('aqcap',()=>{const r=new THREE.RingGeometry(R-.3,R+.2,56);r.rotateX(-Math.PI/2);return r;}),trim,0,H+.01,0,g);
  const dome=mesh(G('aqdome',()=>new THREE.SphereGeometry(R+.1,48,14,0,Math.PI*2,0,Math.PI/2)),M('#5FC3DA',{side:DS,roughness:.35}),0,H,0,g);dome.scale.y=.42;
  mesh(G('aqdome2',()=>new THREE.SphereGeometry(1.4,24,8,0,Math.PI*2,0,Math.PI/2)),M('#F4F4F2'),0,H+R*.42-.35,0,g).scale.y=.5;
  const big=fishModel('thunfisch');big.scale.setScalar(2.6);big.position.set(0,H+R*.42+1.1,0);big.rotation.set(0,Math.PI/2,.3);g.add(big);
  box(g,'#3A3F46',.16,1,.16,0,H+R*.42+.3,0);
  for(const sg of[-1,1]){const an=sg*gap/2,j=box(g,trim,.35,H,.45,Math.sin(an)*(R-.1),H/2,Math.cos(an)*(R-.1));j.rotation.y=an;}
  box(g,trim,2*R*Math.sin(gap/2)+.4,.8,.45,0,H-.4,R-.1);
  box(g,signMat('AQUARIUM','#1E8F9E'),3.4,.62,.1,0,H+.25,R+.08);
  mesh(G('aqfloor',()=>{const c=new THREE.CircleGeometry(R-.25,56);c.rotateX(-Math.PI/2);return c;}),M('#4F7FA0'),0,.02,0,g,false);
  mesh(G('aqpath',()=>{const c=new THREE.RingGeometry(3.2,3.6,56);c.rotateX(-Math.PI/2);return c;}),M('#8CC8DC'),0,.03,0,g,false);
  box(g,'#7A5A3A',2.6,.02,.9,0,.015,R+.5,false);
  /* rundes Becken */
  mesh(G('tkbase',()=>new THREE.CylinderGeometry(2.75,2.9,.55,44)),'#2A3442',0,.27,0,g);
  mesh(G('tksand',()=>new THREE.CylinderGeometry(2.45,2.45,.14,44)),'#E8D9A8',0,.61,0,g,false);
  mesh(G('tkwater',()=>new THREE.CylinderGeometry(2.45,2.45,3.3,44,1,true)),tankWater,0,2.33,0,g,false);
  mesh(G('tkglass',()=>new THREE.CylinderGeometry(2.55,2.55,3.5,44,1,true)),tankGlass,0,2.3,0,g,false);
  mesh(G('tktop',()=>new THREE.CylinderGeometry(2.75,2.75,.3,44)),'#2A3442',0,4.12,0,g);
  mesh(G('tklight',()=>{const r=new THREE.RingGeometry(1.6,2.45,44);r.rotateX(Math.PI/2);return r;}),M('#BFE9FF',{emissive:'#7FD8FF',emissiveIntensity:.9,side:DS}),0,3.96,0,g,false);
  const r=mulberry(21),cor=['#F27C9B','#F2A541','#B57BE0','#E8504A','#5FD1B5'];
  for(let k=0;k<26;k++){const a=r()*6.283,rr=.4+r()*1.9,x=Math.sin(a)*rr,z=Math.cos(a)*rr;const m=mesh(G('tweed',()=>new THREE.ConeGeometry(.07,.9,4)),M('#2E8B57',{flatShading:true}),x,1.1,z,g,false);m.scale.y=.6+r()*1.4;}
  for(let k=0;k<10;k++){const a=r()*6.283,rr=.5+r()*1.7;const m=mesh(G('tcor',()=>new THREE.IcosahedronGeometry(.16,0)),M(cor[k%5],{flatShading:true}),Math.sin(a)*rr,.78,Math.cos(a)*rr,g,false);m.scale.set(1.3+r(),1.5+r()*2,1.3+r());}
  for(let k=0;k<6;k++){const a=r()*6.283,rr=r()*2;const m=mesh(G('trk',()=>new THREE.DodecahedronGeometry(.2,0)),M('#7D8288',{flatShading:true}),Math.sin(a)*rr,.75,Math.cos(a)*rr,g,false);m.scale.setScalar(1+r()*1.5);}
  box(g,'#8B5A2B',.5,.32,.34,.9,.84,-.6,false);box(g,'#F2C230',.52,.06,.36,.9,1.02,-.6,false);
  /* Bänke, Schilder, Lampen am Rundgang */
  for(const an of[Math.PI/2,Math.PI*.85,Math.PI*1.15,Math.PI*1.5]){const x=Math.sin(an)*(R-.75),z=Math.cos(an)*(R-.75);
    const b1=box(g,'#8B6A45',1.6,.08,.42,x,.48,z);b1.rotation.y=an;const b2=box(g,'#5E4632',1.4,.44,.3,x,.22,z);b2.rotation.y=an;cols.push(['c',x,z,.45]);}
  const sg=box(g,signMat('MEINE FISCHE','#2A3442'),2.4,.42,.06,0,2.2,-(R-.3));
  for(let k=0;k<8;k++){const an=k/8*Math.PI*2+.2;mesh(BX(.5,.06,.18),bulbMat,Math.sin(an)*(R-.4),H-.1,Math.cos(an)*(R-.4),g,false);}
  cols.push(['c',0,0,2.85]);
  for(let an=gap/2+.06;an<Math.PI*2-gap/2-.04;an+=.1)cols.push(['c',Math.sin(an)*(R-.1),Math.cos(an)*(R-.1),.32]);
  return {g,cols,lights:[[0,4.5,0,0x7fd8ff,1.8,10],[0,3.8,4.3,0xffe2b0,1.2,7],[3.7,3.8,-2.2,0xffe2b0,1.2,7],[-3.7,3.8,-2.2,0xffe2b0,1.2,7]],tank:true};
};
MODELS.teil=()=>({g:new THREE.Group(),cols:[],lights:[]});
function glow(g,mat,x,z,r){const m=mesh(G('glowp',()=>{const p=new THREE.PlaneGeometry(1,1);p.rotateX(-Math.PI/2);return p;}),mat,x,.03,z,g,false);m.scale.set(r*2,1,r*2);m.receiveShadow=false;return m;}

export { AQ_R, MODELS };
