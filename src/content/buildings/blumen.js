// Blumen
export default {
  id: 'blumen',
  label: 'Blumen',
  category: 'natur', // Inventar-Kategorie
  paint: true, // mit dem Finger malen
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, G, M, mesh }) {
    const r=mulberry(seed),g=new THREE.Group(),cols=[];
    for(let k=0;k<14;k++){
      const x=(r()-.5)*3.4,z=(r()-.5)*3.4;
      if(k<6){mesh(G('tuft',()=>new THREE.ConeGeometry(.12,.35,5)),'#4FA63C',x,.17,z,g,false);continue;}
      mesh(G('stem',()=>new THREE.CylinderGeometry(.02,.02,.4,4)),'#3F8A2E',x,.2,z,g,false);
      mesh(G('bloom',()=>new THREE.IcosahedronGeometry(.11,0)),M(['#E8434F','#FFD23F','#FFFFFF','#F78FB3','#9B6BD3'][k%5],{flatShading:true}),x,.43,z,g,false);
    }
    return {g,cols};
  },
};
