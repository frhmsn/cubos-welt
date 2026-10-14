// Berg
export default {
  id: 'berg',
  label: 'Berg',
  category: 'natur', // Inventar-Kategorie
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { G, M, mesh }) {
    const g=new THREE.Group(),cols=[['c',0,0,1.75]];
    mesh(G('hill',()=>new THREE.ConeGeometry(1.95,2.6,7)),M('#5E9F42',{flatShading:true}),0,1.3,0,g);
    mesh(G('rock',()=>new THREE.ConeGeometry(.66,.86,7)),M('#F4F6F8',{flatShading:true}),0,2.17,0,g);
    mesh(G('stone',()=>new THREE.DodecahedronGeometry(.35,0)),M('#9AA0A6',{flatShading:true}),1.4,.2,1.2,g);
    return {g,cols};
  },
};
