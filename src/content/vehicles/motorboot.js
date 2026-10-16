// Motorboot: richtig schnell, man kann damit angeln. Kostet Taler (einmal kaufen, dann beliebig oft aufstellen).
export default {
  id: 'motorboot',
  label: 'Motorboot',
  category: 'see', // Inventar-Kategorie: 'auto' oder 'see'
  price: 30, // kostet so viele Taler (Rucksack); vorher ist es im Inventar mit Schloss
  speed: 7, max: 20, // Beschleunigung und Höchstgeschwindigkeit (Fischerboot: 3 und 9)
  boat: true, // fährt nur auf Wasser, man kann damit angeln
  // Fahrzeug schaut nach +z.
  model({ g, M, G, BX, box, mesh, prof, glassMat, headMat, bake }) {
    const hull = M('#FAFAF7', { roughness: .35 }), red = M('#E8343C', { roughness: .4 });
    // Rumpf: flach und lang, vorne spitz
    mesh(prof('mboat', [[-1.35, -.05], [.7, -.05], [1.5, .3], [1.5, .42], [-1.35, .42]], 1.25), hull, 0, 0, 0, g);
    mesh(prof('mboatS', [[-1.36, .2], [1.2, .2], [1.48, .3], [-1.36, .3]], 1.27), red, 0, 0, 0, g);
    box(g, '#C9A27A', 1.05, .04, 1.6, 0, .44, -.45, false);
    // Windschutzscheibe und Sitze
    const ws = box(g, glassMat, 1.05, .32, .06, 0, .62, .5, false); ws.rotation.x = -.5;
    for (const x of [-.27, .27]) { box(g, '#2B3A4A', .4, .14, .42, x, .52, -.05); box(g, '#2B3A4A', .4, .4, .1, x, .72, -.27); }
    box(g, '#2B3A4A', .9, .16, .4, 0, .52, -.9);
    // Lenkrad
    const wh = mesh(G('mwheel', () => new THREE.TorusGeometry(.11, .025, 6, 14)), '#1F1F1F', -.27, .78, .28, g, false); wh.rotation.x = -.9;
    // Außenborder hinten
    box(g, '#2B2F36', .34, .55, .3, 0, .5, -1.45); box(g, '#E8343C', .36, .12, .32, 0, .78, -1.45);
    box(g, '#2B2F36', .1, .45, .1, 0, .05, -1.5);
    // Angelhalter mit Rute
    const rod = mesh(G('rod', () => new THREE.CylinderGeometry(.025, .035, 1.7, 6)), '#3A2A1A', .5, 1.0, -.7, g); rod.rotation.x = .9;
    mesh(BX(.18, .18, .18), headMat, -.27, .9, .02, g, false);
    return bake(g);
  },
};
