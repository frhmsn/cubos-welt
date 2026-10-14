// Mahi-Mahi. Werte siehe content/fish/README.md.
export default {
  id: 'mahimahi',
  label: 'Mahi-Mahi', plural: 'Mahi-Mahis',
  length: [.6, 1.6], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .08 }, // Häufigkeit je Gewässer
  speed: 1.3, jumps: true,
  scale: { shadow: 1.2, underwater: 1.3, aquarium: .36, rod: 1.1, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#3FA34D',.28,.5,1.3,.04,0); body('#F2C230',.26,.3,1.15,-.14,-.02);
    box(g,'#3FA34D',.26,.56,.2,0,.02,.52);
    box(g,'#2E6FD0',.04,.22,1.05,0,.32,-.05);
    for(const [x,y,z] of[[.14,.05,.2],[-.14,.08,0],[.14,-.02,-.2],[-.14,0,.3],[.14,.12,-.05]])box(g,'#4FA8F0',.02,.05,.05,x,y,z,false);
    const t1=box(g,'#C9A020',.04,.4,.12,0,.16,-.72);t1.rotation.x=-.6;const t2=box(g,'#C9A020',.04,.4,.12,0,-.16,-.72);t2.rotation.x=.6;
    box(g,'#151515',.3,.06,.06,0,.12,.5,false);
  },
};
