// Fischerboot
export default {
  id: 'boot',
  label: 'Fischerboot',
  category: 'see', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 3, max: 9, // Beschleunigung und Höchstgeschwindigkeit
  boat: true, // fährt nur auf Wasser, man kann damit angeln
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, G, BX, bake, box, mesh, glassMat, headMat }) {
    const hull=M('#F4F4F2',{roughness:.5});
    box(g,hull,1.4,.5,2.4,0,.05,-.15);
    const bow=box(g,hull,1.0,.5,1.0,0,.05,1.0);bow.rotation.y=Math.PI/4;bow.scale.set(1,1,1);
    box(g,'#2F5E9E',1.42,.12,2.42,0,.22,-.15,false);
    const bs=box(g,'#2F5E9E',1.02,.12,1.02,0,.22,1.0,false);bs.rotation.y=Math.PI/4;
    box(g,'#9B7650',1.2,.05,2.2,0,.3,-.15,false);
    box(g,'#F4F4F2',.9,.75,.8,0,.7,-.55);
    box(g,glassMat,.92,.28,.82,0,.86,-.55,false);
    box(g,'#D7261E',1.05,.1,.95,0,1.12,-.55);
    mesh(G('mast',()=>new THREE.CylinderGeometry(.04,.04,1.3,6)),'#5A4630',0,1.5,-.55,g);
    const rod=mesh(G('rod',()=>new THREE.CylinderGeometry(.025,.035,1.7,6)),'#3A2A1A',.45,1.0,.55,g);rod.rotation.x=.9;
    for(const z of[-1.1,-.85])box(g,'#F28C28',.3,.18,.18,-.45,.42,z,false);
    box(g,'#6E737A',.35,.25,.35,.4,.45,-1.05);
    mesh(BX(.12,.08,.12),headMat,0,1.22,-.2,g,false);
    return bake(g);
  },
};
