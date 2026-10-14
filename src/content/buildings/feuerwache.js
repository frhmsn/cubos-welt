// Feuerwache
export default {
  id: 'feuerwache',
  label: 'Feuerwache',
  category: 'haus', // Inventar-Kategorie
  house: true, // begehbar
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { BX, G, box, mesh, polBlue, shell }) {
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
};
