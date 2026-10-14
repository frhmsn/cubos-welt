// Laterne
export default {
  id: 'laterne',
  label: 'Laterne',
  category: 'licht', // Inventar-Kategorie
  rot: true, walkable: true, // drehbar, man läuft hindurch
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { BX, G, box, bulbMat, glowWarm, mesh, glow }) {
    const g=new THREE.Group(),cols=[['c',0,0,.15]];
    mesh(G('lpole',()=>new THREE.CylinderGeometry(.06,.08,3.1,8)),'#3D434B',0,1.55,0,g);
    box(g,'#3D434B',.7,.07,.07,.32,3.08,0); box(g,'#3D434B',.36,.14,.24,.62,3.0,0);
    mesh(BX(.28,.04,.18),bulbMat,.62,2.92,0,g,false);
    glow(g,glowWarm,.62,0,2.8);
    return {g,cols,lights:[[.62,2.8,0,0xffd49a,1.7,12]]};
  },
};
