// Barsch. Werte siehe content/fish/README.md.
export default {
  id: 'barsch',
  label: 'Barsch', plural: 'Barsche',
  length: [.18, .45], // Meter, zufällig beim Fang
  habitat: ['see'],
  taler: 2, // so viele Taler gibt der Markt für einen Fisch
  spawn: { see: .3 }, // Häufigkeit je Gewässer
  speed: .8, jumps: true,
  scale: { shadow: .75, underwater: 1.8, aquarium: .55, rod: 1.6, jump: 1.4 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#7E9A3C',.28,.42,1.0,0,0); body('#E8E2B8',.24,.2,.8,-.12,.02);
    for(const z of[-.2,0,.2])box(g,'#3E4E1E',.3,.36,.06,0,.02,z,false);
    const t=box(g,fl,.04,.34,.26,0,0,-.58);t.rotation.x=.0; box(g,fl,.04,.18,.34,0,.24,-.05);
    box(g,'#151515',.3,.06,.06,0,.06,.36,false);
  },
};
