// Bus
export default {
  id: 'bus',
  label: 'Bus',
  category: 'auto', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 3.4, max: 9, // Beschleunigung und Höchstgeschwindigkeit
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, box, wheels, lights, glassMat }) {
    const b=M('#E4572E',{roughness:.5});
    box(g,b,1.22,1.3,3.3,0,.95,0); box(g,glassMat,1.24,.46,3.05,0,1.2,-.05); box(g,glassMat,1.05,.6,.04,0,1.15,1.66);
    box(g,'#F7F3EA',1.22,.08,3.3,0,1.64,0); box(g,'#3A3F46',.05,.9,.7,.62,.75,.6);
    wheels(g,[-.55,.55],[-1.1,1.1],.3); lights(g,.5,1.66,-1.66,[-.4,.4]);
  },
};
