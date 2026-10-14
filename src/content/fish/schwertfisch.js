// Schwertfisch. Werte siehe content/fish/README.md.
export default {
  id: 'schwertfisch',
  label: 'Schwertfisch', plural: 'Schwertfische',
  length: [1.2, 3], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .05 }, // Häufigkeit je Gewässer
  speed: 1.5, jumps: true,
  scale: { shadow: 2, underwater: 1, aquarium: .25, rod: .85, jump: 1.1 },
  wow: true, // besonderer Fang: "Wow, ein ...!"
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#545A6A',.32,.36,1.5,0,0); body('#C8CCD4',.28,.2,1.3,-.1,0);
    box(g,'#3E4350',.1,.04,1.0,0,.0,1.2);
    const d=box(g,'#3E4350',.04,.5,.24,0,.32,.3);d.rotation.x=-.4;
    for(const x of[-.18,.18]){const pf=box(g,'#3E4350',.3,.04,.18,x,-.12,.35);pf.rotation.z=x>0?-.5:.5;}
    const t1=box(g,'#3E4350',.04,.6,.12,0,.24,-.86);t1.rotation.x=-.7;const t2=box(g,'#3E4350',.04,.6,.12,0,-.24,-.86);t2.rotation.x=.7;
    box(g,'#151515',.34,.07,.07,0,.06,.6,false);
  },
};
