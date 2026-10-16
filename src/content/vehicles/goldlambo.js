// Goldener Lamborghini: das große Sparziel. Kostet Taler.
export default {
  id: 'goldlambo',
  label: 'Gold-Lambo',
  category: 'auto', // Inventar-Kategorie: 'auto' oder 'see'
  price: 60, // kostet so viele Taler (Rucksack); vorher ist er im Inventar mit Schloss
  speed: 7, max: 18, // Beschleunigung und Höchstgeschwindigkeit
  model({ g, M, mesh, box, prof, wheels, lights, glassMat }) {
    const b = M('#FFCF33', { roughness: .2, metalness: .45, emissive: '#8A5A00', emissiveIntensity: .4 });
    mesh(prof('glb', [[-1.1, .18], [1.12, .18], [1.12, .32], [.55, .46], [-1.1, .52]], .96), b, 0, 0, 0, g);
    mesh(prof('glbc', [[.55, .45], [.1, .72], [-.55, .7], [-.88, .5]], .84), glassMat, 0, 0, 0, g);
    box(g, '#7A5A10', .92, .04, .24, 0, .78, -.96); box(g, '#7A5A10', .05, .26, .05, -.33, .64, -.96); box(g, '#7A5A10', .05, .26, .05, .33, .64, -.96);
    for (const x of [-.12, .12]) box(g, '#FFFFFF', .08, .02, 2.2, x, .53, 0, false); // weiße Rennstreifen
    for (const z of [.55, -.2, -.75]) { const st = box(g, '#FFFFFF', .2, .03, .2, 0, .56, z, false); st.rotation.y = Math.PI / 4; } // Glitzer
    wheels(g, [-.46, .46], [-.7, .72], .22); lights(g, .34, 1.12, -1.12, [-.3, .3]);
  },
};
