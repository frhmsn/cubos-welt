// Hochhaus
export default {
  id: 'hochhaus',
  label: 'Hochhaus',
  category: 'haus', // Inventar-Kategorie
  house: true, // begehbar
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { BX, M, box, facadeMat, shell, plant }) {
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
};
