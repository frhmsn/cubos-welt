// Flutlicht
export default {
  id: 'flutlicht',
  label: 'Flutlicht',
  category: 'licht', // Inventar-Kategorie
  rot: true, // drehbar
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { BX, G, box, floodMat, glowWarm, mesh, glow }) {
    const g=new THREE.Group(),cols=[['c',0,-.6,.2]];
    mesh(G('fpole',()=>new THREE.CylinderGeometry(.1,.16,6.6,8)),'#8D969E',0,3.3,-.6,g);
    const head=new THREE.Group(); head.position.set(0,6.6,-.45); head.rotation.x=.55; g.add(head);
    box(head,'#5A6168',1.6,1.0,.18,0,0,0);
    for(const [x,y] of [[-.4,.24],[.4,.24],[-.4,-.24],[.4,-.24]]) mesh(BX(.62,.36,.06),floodMat,x,y,.11,head,false);
    box(g,'#8D969E',.8,.12,.5,0,.06,-.6);
    glow(g,glowWarm,0,1.6,5);
    return {g,cols,lights:[[0,6,.4,0xf2f6ff,2.6,24]]};
  },
};
