// Hecht. Werte siehe content/fish/README.md.
export default {
  id: 'hecht',
  label: 'Hecht', plural: 'Hechte',
  length: [.45, 1.3], // Meter, zufällig beim Fang
  habitat: ['see'],
  taler: 4, // so viele Taler gibt der Markt für einen Fisch
  spawn: { see: .2 }, // Häufigkeit je Gewässer
  speed: 1.3, jumps: true,
  scale: { shadow: 1.2, underwater: 1.4, aquarium: .4, rod: 1.2, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#5E7A3A',.24,.28,1.5,0,0); body('#D9D8B0',.2,.14,1.3,-.08,.05);
    for(const [x,z] of[[.12,.3],[-.12,.1],[.12,-.1],[-.12,-.3],[.12,-.45],[-.12,.45]])box(g,'#C9C78A',.03,.07,.1,x,.04,z,false);
    box(g,'#5E7A3A',.16,.1,.36,0,-.02,.8);
    box(g,'#7A6A2E',.04,.24,.26,0,.18,-.5); const t=box(g,'#7A6A2E',.04,.34,.24,0,0,-.86);
    box(g,'#151515',.26,.05,.05,0,.06,.6,false);
  },
};
