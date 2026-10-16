// Hai. Werte siehe content/fish/README.md.
export default {
  id: 'hai',
  label: 'Hai', plural: 'Haie',
  length: [1.5, 3.5], // Meter, zufällig beim Fang
  habitat: ['meer'],
  taler: 10, // so viele Taler gibt der Markt für einen Fisch
  spawn: { meer: .09 }, // Häufigkeit je Gewässer
  speed: 1.2, jumps: false,
  scale: { shadow: 2.5, underwater: 1.15, aquarium: .3, rod: .9, jump: 1.1 },
  wow: true, // besonderer Fang: "Wow, ein ...!"
  maxCount: 4, // mehr Haie gleichzeitig gibt es nicht
  dorsalFin: true, // Rückenflosse schaut aus dem Wasser
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#7D8A96',.42,.42,1.6,0,0); body('#F2F4F6',.36,.24,1.4,-.12,0);
    mesh(finGeo,M('#6B7782'),0,.18,.05,g).scale.set(1.4,1.4,1.4);
    const t1=box(g,'#6B7782',.05,.6,.16,0,.22,-.9);t1.rotation.x=-.55;const t2=box(g,'#6B7782',.05,.36,.14,0,-.14,-.88);t2.rotation.x=.6;
    for(const x of[-.2,.2]){const pf=box(g,'#6B7782',.4,.04,.22,x,-.12,.2);pf.rotation.z=x>0?-.4:.4;}
    box(g,'#151515',.44,.06,.06,0,.06,.6,false);
  },
};
