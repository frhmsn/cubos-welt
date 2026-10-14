// Lagerfeuer
export default {
  id: 'lagerfeuer',
  label: 'Lagerfeuer',
  category: 'licht', // Inventar-Kategorie
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, G, M, box, flameCore, flameMat, glowFire, mesh, glow }) {
    const r=mulberry(seed),g=new THREE.Group(),cols=[['c',0,0,.9]];
    for(let k=0;k<9;k++){const a=k/9*Math.PI*2;const s=mesh(G('fstone',()=>new THREE.DodecahedronGeometry(.18,0)),M('#8E949B',{flatShading:true}),Math.cos(a)*.62,.1,Math.sin(a)*.62,g);s.rotation.set(r()*3,r()*3,0);}
    for(let k=0;k<3;k++){const l=mesh(G('flog',()=>new THREE.CylinderGeometry(.07,.08,1,6)),'#6B4428',0,.14,0,g);l.rotation.z=Math.PI/2;l.rotation.y=k*Math.PI/3;}
    const f1=mesh(G('flame1',()=>new THREE.ConeGeometry(.32,.9,7)),flameMat,0,.55,0,g,false); f1.userData.keep=true; f1.userData.flame=1;
    const f2=mesh(G('flame2',()=>new THREE.ConeGeometry(.18,.6,6)),flameCore,.04,.45,.03,g,false); f2.userData.keep=true; f2.userData.flame=2;
    glow(g,glowFire,0,0,2.4);
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4;const b=box(g,'#8B6A45',.9,.12,.3,Math.cos(a)*1.55,.25,Math.sin(a)*1.55);b.rotation.y=-a+Math.PI/2;box(g,'#6B4F32',.1,.25,.1,Math.cos(a)*1.55,.12,Math.sin(a)*1.55);}
    return {g,cols,lights:[[0,.9,0,0xff9a40,2.2,11,1]]};
  },
};
