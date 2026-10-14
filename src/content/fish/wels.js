// Wels. Werte siehe content/fish/README.md.
export default {
  id: 'wels',
  label: 'Wels', plural: 'Welse',
  length: [.8, 2.6], // Meter, zufällig beim Fang
  habitat: ['see'],
  spawn: { see: .15 }, // Häufigkeit je Gewässer
  speed: .45, jumps: false,
  scale: { shadow: 1.8, underwater: 1.2, aquarium: .28, rod: .9, jump: 1.1 },
  bigCatch: { from: 2, title: 'Wow, ein Riesen-Wels!' },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#3E3A34',.46,.34,1.6,0,0); body('#8C8578',.4,.18,1.4,-.1,0);
    box(g,'#3E3A34',.5,.22,.42,0,0,.72);
    for(const x of[-1,1]){const b=box(g,'#2A2622',.03,.03,.7,x*.28,0,.95,false);b.rotation.y=x*.6;}
    for(const x of[-.06,.06]){const b=box(g,'#2A2622',.02,.02,.24,x,-.12,.86,false);b.rotation.x=.6;}
    box(g,'#3E3A34',.04,.12,.9,0,-.16,-.3); const t=box(g,'#3E3A34',.04,.34,.24,0,0,-.86);
    box(g,'#151515',.44,.05,.05,0,.08,.62,false);
  },
};
