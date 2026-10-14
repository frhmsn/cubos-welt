// Löschauto
export default {
  id: 'feuerwehrauto',
  label: 'Löschauto',
  category: 'auto', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 4.2, max: 11, // Beschleunigung und Höchstgeschwindigkeit
  siren: true, // Blaulicht und Martinshorn
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, BX, box, mesh, wheels, lights, glassMat, polBlue }) {
    const b=M('#D7261E',{roughness:.45,metalness:.2});
    box(g,b,1.12,1.0,.95,0,.82,1.02); box(g,glassMat,1.0,.42,.04,0,1.05,1.5);
    box(g,b,1.12,1.15,2.05,0,.88,-.5); box(g,'#F2F2F2',1.14,.12,2.06,0,.62,-.5);
    box(g,'#C9CDD2',.08,.08,2.4,-.3,1.55,-.3); box(g,'#C9CDD2',.08,.08,2.4,.3,1.55,-.3);
    for(let k=0;k<7;k++) box(g,'#C9CDD2',.6,.05,.05,0,1.55,-1.4+k*.36);
    mesh(BX(.5,.12,.2),polBlue,0,1.38,1.1,g,false);
    wheels(g,[-.5,.5],[-1.0,1.0],.3); lights(g,.5,1.5,-1.53,[-.35,.35]);
  },
};
