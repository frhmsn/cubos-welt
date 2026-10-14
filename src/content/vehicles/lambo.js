// Lamborghini
export default {
  id: 'lambo',
  label: 'Lamborghini',
  category: 'auto', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 6.5, max: 17, // Beschleunigung und Höchstgeschwindigkeit
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, box, mesh, prof, wheels, lights, glassMat }) {
    const b=M('#F5C211',{roughness:.35,metalness:.35});
    mesh(prof('lb',[[-1.1,.18],[1.12,.18],[1.12,.32],[.55,.46],[-1.1,.52]],.96),b,0,0,0,g);
    mesh(prof('lbc',[[.55,.45],[.1,.72],[-.55,.7],[-.88,.5]],.84),glassMat,0,0,0,g);
    box(g,'#1E1E1E',.92,.04,.24,0,.78,-.96); box(g,'#1E1E1E',.05,.26,.05,-.33,.64,-.96); box(g,'#1E1E1E',.05,.26,.05,.33,.64,-.96);
    box(g,'#1E1E1E',.02,.12,.35,.485,.32,-.2); box(g,'#1E1E1E',.02,.12,.35,-.485,.32,-.2);
    wheels(g,[-.46,.46],[-.7,.72],.22); lights(g,.34,1.12,-1.12,[-.3,.3]);
  },
};
