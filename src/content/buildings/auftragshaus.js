// Auftragshaus: hier holt man sich Aufträge ab und bekommt Taler dafür (systems/orders.js, ui/places.js).
export default {
  id: 'auftragshaus',
  label: 'Auftragshaus',
  category: 'haus', // Inventar-Kategorie
  house: true, // begehbar, Tür zur Straße
  station: 'auftraege', // in der Nähe erscheint der Knopf "Aufträge" (ui/places.js)
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { G, M, box, mesh, shell, plant }) {
    const g = new THREE.Group(), cols = [], wall = '#FFE7A8', gold = M('#FFC21A', { roughness: .35, metalness: .3, emissive: '#8A5A00', emissiveIntensity: .25 });
    shell(g, cols, { w: 3.4, d: 3.4, h: 3, wall, doorW: 1.4, doorH: 2.3, floor: '#B98552' });
    // Dach mit Uhrtürmchen
    box(g, '#3E7CC4', 3.8, .25, 3.8, 0, 3.12, 0);
    box(g, '#F6F1E4', 1.2, 1, 1.2, 0, 3.75, 0);
    mesh(G('tower', () => new THREE.ConeGeometry(.95, 1, 4)), M('#3E7CC4', { flatShading: true }), 0, 4.75, 0, g).rotation.y = Math.PI / 4;
    const coin = mesh(G('coinBig', () => new THREE.CylinderGeometry(.42, .42, .1, 20)), gold, 0, 3.8, .62, g); coin.rotation.x = Math.PI / 2;
    box(g, '#C98A00', .1, .42, .04, 0, 3.8, .68, false);
    // Schild über der Tür: Schriftrolle
    box(g, '#F6F1E4', 1.5, .5, .08, 0, 2.6, 1.76);
    box(g, '#C9A65A', .12, .6, .12, -.78, 2.6, 1.78); box(g, '#C9A65A', .12, .6, .12, .78, 2.6, 1.78);
    for (let k = 0; k < 3; k++) box(g, '#8B6A45', 1 - k * .2, .05, .02, 0, 2.74 - k * .12, 1.81, false);
    // Innen: Tresen mit Taler-Stapeln und Pinnwand mit Zetteln
    box(g, '#8B5A2B', 2.2, .95, .6, 0, .48, -.7); cols.push(['b', -1.1, 1.1, -1, -.4]);
    box(g, '#A8743E', 2.3, .08, .7, 0, .99, -.7);
    for (const [x, n] of [[-.6, 3], [-.3, 5], [.5, 2]]) for (let k = 0; k < n; k++) mesh(G('coinS', () => new THREE.CylinderGeometry(.13, .13, .05, 12)), gold, x, 1.06 + k * .055, -.65, g, false);
    box(g, '#B98552', 2.2, 1.2, .06, 0, 1.9, -1.58);
    for (const [x, y, c] of [[-.7, 2.1, '#FFFFFF'], [-.2, 1.85, '#FFF4CC'], [.35, 2.15, '#DDF2FF'], [.75, 1.8, '#FFFFFF']]) box(g, c, .38, .46, .02, x, y, -1.54, false);
    plant(g, 1.2, .9, .9); plant(g, -1.2, .9, .9);
    return { g, cols, lights: [[0, 2.5, 0, 0xffe0a0, 1.2, 7]] };
  },
};
