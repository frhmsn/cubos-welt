// Tanne
export default {
  id: 'tanne',
  label: 'Tanne',
  category: 'natur', // Inventar-Kategorie
  paint: true, // mit dem Finger malen
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, G, M, mesh }) {
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
};
