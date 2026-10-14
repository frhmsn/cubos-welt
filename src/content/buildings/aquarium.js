// Aquarium
export default {
  id: 'aquarium',
  label: 'Aquarium',
  category: 'haus', // Inventar-Kategorie
  house: true, big: true, // begehbar, 3x3 Felder
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, BX, G, M, box, bulbMat, mesh, winMat, signMat, fishModel, tankWater, tankGlass, AQ_R, AQ_H, AQ_GAP }) {
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
  },
};
