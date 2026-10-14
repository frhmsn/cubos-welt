// Karpfen. Werte siehe content/fish/README.md.
export default {
  id: 'karpfen',
  label: 'Karpfen', plural: 'Karpfen',
  length: [.3, .9], // Meter, zufällig beim Fang
  habitat: ['see'],
  spawn: { see: .25 }, // Häufigkeit je Gewässer
  speed: .5, jumps: true,
  scale: { shadow: .95, underwater: 1.6, aquarium: .5, rod: 1.6, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#B8862E',.34,.56,1.0,0,0); body('#E2C27A',.3,.3,.85,-.12,.02);
    for(const z of[-.25,-.05,.15])for(const y of[.1,-.05])box(g,'#9C6E22',.36,.06,.05,0,y,z,false);
    box(g,'#A0522D',.04,.22,.5,0,.3,-.05); const t=box(g,'#A0522D',.04,.4,.26,0,0,-.6);
    for(const x of[-.07,.07]){const b=box(g,'#8C6A3A',.02,.02,.14,x,-.06,.55,false);b.rotation.x=.5;}
    box(g,'#151515',.34,.06,.06,0,.08,.36,false);
  },
};
