// Barrakuda. Werte siehe content/fish/README.md.
export default {
  id: 'barrakuda',
  label: 'Barrakuda', plural: 'Barrakudas',
  length: [.6, 1.8], // Meter, zufällig beim Fang
  habitat: ['meer'],
  taler: 5, // so viele Taler gibt der Markt für einen Fisch
  spawn: { meer: .08 }, // Häufigkeit je Gewässer
  speed: 1.4, jumps: false,
  scale: { shadow: 1.2, underwater: 1.2, aquarium: .32, rod: 1, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#8D9AA4',.18,.22,1.7,0,0); body('#E6EAEE',.16,.12,1.5,-.06,0);
    for(let k=0;k<7;k++)box(g,'#4A5560',.19,.1,.06,0,.06,-.55+k*.17,false);
    box(g,'#8D9AA4',.1,.07,.4,0,-.01,.92); box(g,'#7A858E',.08,.05,.3,0,-.06,.9);
    box(g,'#4A5560',.04,.16,.14,0,.14,.2); box(g,'#4A5560',.04,.14,.14,0,.12,-.4);
    const t1=box(g,'#4A5560',.04,.3,.1,0,.12,-.9);t1.rotation.x=-.6;const t2=box(g,'#4A5560',.04,.3,.1,0,-.12,-.9);t2.rotation.x=.6;
    box(g,'#151515',.2,.05,.05,0,.05,.68,false);
  },
};
