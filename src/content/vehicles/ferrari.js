// Ferrari
export default {
  id: 'ferrari',
  label: 'Ferrari',
  category: 'auto', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 6, max: 16, // Beschleunigung und Höchstgeschwindigkeit
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, box, mesh, prof, wheels, lights, glassMat }) {
    const b=M('#D10F1A',{roughness:.3,metalness:.35});
    mesh(prof('fr',[[-1.12,.2],[1.12,.2],[1.15,.33],[.75,.43],[-1.05,.5],[-1.13,.42]],.96),b,0,0,0,g);
    mesh(prof('frc',[[.42,.44],[.02,.75],[-.48,.75],[-.82,.48]],.82),glassMat,0,0,0,g);
    box(g,'#FFD23F',.12,.04,.12,0,.43,.95);
    box(g,'#1E1E1E',.02,.14,.4,.485,.33,-.25); box(g,'#1E1E1E',.02,.14,.4,-.485,.33,-.25);
    wheels(g,[-.46,.46],[-.7,.72],.22); lights(g,.35,1.14,-1.13,[-.3,.3]);
  },
};
