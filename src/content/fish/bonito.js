// Bonito. Werte siehe content/fish/README.md.
export default {
  id: 'bonito',
  label: 'Bonito', plural: 'Bonitos',
  length: [.4, .8], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .1 }, // Häufigkeit je Gewässer
  speed: 1.5, jumps: true,
  scale: { shadow: .9, underwater: 1.6, aquarium: .45, rod: 1.3, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#2D4A7A',.28,.34,1.1,.02,0); body('#D5DCE4',.26,.2,.95,-.1,0);
    for(let k=0;k<5;k++){const b=box(g,'#18294A',.29,.04,.4,0,.13,-.15+k*.1,false);b.rotation.x=.9;}
    const t1=box(g,'#2D4A7A',.04,.4,.1,0,.16,-.64);t1.rotation.x=-.6;const t2=box(g,'#2D4A7A',.04,.4,.1,0,-.16,-.64);t2.rotation.x=.6;
    box(g,'#2D4A7A',.04,.18,.22,0,.22,.05);
    box(g,'#151515',.3,.06,.06,0,.06,.4,false);
  },
};
