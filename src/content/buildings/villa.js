// Villa
export default {
  id: 'villa',
  label: 'Villa',
  category: 'haus', // Inventar-Kategorie
  holz: 8, // kostet so viel Holz (Rucksack); beim Abreißen kommt es zurück
  house: true, // begehbar
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { box, shell, plant }) {
    const g=new THREE.Group(),cols=[];
    shell(g,cols,{w:3.4,d:3.4,wall:'#F7F6F0',winW:1,winH:1.1,doorW:1,floor:'#D7B98A'});
    box(g,'#3A3F46',3.75,.24,3.75,0,2.92,0);
    box(g,'#B07A4A',.9,2.5,.04,-1.15,1.25,1.74);
    box(g,'#5B7DB1',1.6,.4,.6,0,.25,-1.15); box(g,'#5B7DB1',1.6,.5,.18,0,.55,-1.43);
    box(g,'#5B7DB1',.6,.4,.9,-.9,.25,-.6);
    box(g,'#151515',.06,.62,1.05,1.52,1.35,-.2); box(g,'#7B5A3A',.4,.45,1.2,1.35,.23,-.2);
    plant(g,1.25,1.25,1); plant(g,-.85,1.95,.8); plant(g,.85,1.95,.8);
    return {g,cols};
  },
};
