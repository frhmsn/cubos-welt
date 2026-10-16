// Markt: hier verkauft man Fische aus dem Eimer für Taler (ui/places.js).
export default {
  id: 'markt',
  label: 'Markt',
  category: 'haus', // Inventar-Kategorie
  rot: true, // drehbar: nochmal antippen
  station: 'markt', // in der Nähe erscheint der Knopf "Verkaufen" (ui/places.js)
  holz: 6, // kostet so viel Holz
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Vorderseite nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, G, M, box, mesh, fishModel }) {
    const r = mulberry(seed), g = new THREE.Group(), cols = [];
    // Stand mit gestreiftem Dach
    for (const x of [-1.5, 1.5]) for (const z of [-.9, .9]) { mesh(G('mpost', () => new THREE.CylinderGeometry(.07, .07, 2.6, 8)), '#8B6A45', x, 1.3, z, g); }
    for (let k = 0; k < 6; k++) { const s = box(g, k % 2 ? '#FFFFFF' : '#E8473C', .55, .08, 2.3, -1.375 + k * .55, 2.7, 0); s.rotation.x = -.12; }
    box(g, '#E8473C', 3.3, .3, .06, 0, 2.5, 1.2, false);
    // Tresen mit Eis und Fischen
    box(g, '#9B6A3C', 3, .9, .9, 0, .45, .4); cols.push(['b', -1.5, 1.5, -.05, .85]);
    box(g, '#DDF2FF', 2.8, .06, .75, 0, .93, .4, false);
    const kinds = ['makrele', 'thunfisch', 'barsch', 'hecht', 'bonito', 'karpfen'];
    for (let k = 0; k < 4; k++) {
      const f = fishModel(kinds[Math.floor(r() * kinds.length)]); f.scale.setScalar(.55);
      f.position.set(-1.05 + k * .7, 1.02, .4); f.rotation.set(0, Math.PI / 2 + (r() - .5) * .4, Math.PI / 2); g.add(f);
    }
    // Kisten und Waage
    for (const [x, z] of [[-1.2, -.6], [-.5, -.7], [1.1, -.6]]) box(g, '#B98552', .6, .45, .5, x, .23, z);
    box(g, '#6E737A', .35, .3, .3, .9, 1.1, .2);
    mesh(G('scaleP', () => new THREE.CylinderGeometry(.22, .22, .03, 14)), '#C0C6CC', .9, 1.27, .2, g, false);
    // Schild mit Taler
    const coin = mesh(G('coinM', () => new THREE.CylinderGeometry(.3, .3, .08, 18)), M('#FFC21A', { roughness: .35, metalness: .3, emissive: '#8A5A00', emissiveIntensity: .25 }), 0, 3.05, 1.18, g); coin.rotation.x = Math.PI / 2;
    return { g, cols, lights: [[0, 2.3, .4, 0xfff0d0, .9, 6]] };
  },
};
