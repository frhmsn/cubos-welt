// Polizei
export default {
  id: 'polizei',
  label: 'Polizei',
  category: 'auto', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 5, max: 14, // Beschleunigung und Höchstgeschwindigkeit
  siren: true, // Blaulicht und Martinshorn
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, BX, box, mesh, prof, wheels, lights, glassMat, polBlue, polRed }) {
    const b=M('#F4F6F8',{roughness:.4,metalness:.2});
    mesh(prof('po',[[-1.1,.22],[1.1,.22],[1.1,.56],[-1.1,.6]],.98),b,0,0,0,g);
    mesh(prof('poc',[[.56,.56],[.28,.92],[-.55,.92],[-.82,.6]],.88),glassMat,0,0,0,g);
    box(g,'#F4F6F8',.86,.05,.82,0,.94,-.13);
    box(g,'#1E5AA8',1,.11,1.95,0,.42,0);
    mesh(BX(.32,.11,.2),polBlue,-.17,1.02,-.12,g,false); mesh(BX(.32,.11,.2),polRed,.17,1.02,-.12,g,false);
    wheels(g,[-.47,.47],[-.68,.7],.23); lights(g,.44,1.11,-1.11,[-.32,.32]);
  },
};
