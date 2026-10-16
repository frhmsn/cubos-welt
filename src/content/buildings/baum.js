// Baum
export default {
  id: 'baum',
  label: 'Baum',
  category: 'natur', // Inventar-Kategorie
  chop: 2, // mit dem Männchen fällen gibt so viel Holz
  paint: true, // mit dem Finger malen
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, G, M, mesh }) {
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
};
