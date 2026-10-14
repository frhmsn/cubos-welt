// Marlin. Werte siehe content/fish/README.md.
export default {
  id: 'marlin',
  label: 'Marlin', plural: 'Marline',
  length: [1.5, 4], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .04 }, // Häufigkeit je Gewässer
  speed: 1.7, jumps: true,
  scale: { shadow: 2.4, underwater: .95, aquarium: .23, rod: .8, jump: 1.1 },
  wow: true, // besonderer Fang: "Wow, ein ...!"
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#24477A',.32,.38,1.6,0,0); body('#EEF2F6',.28,.2,1.4,-.12,0);
    for(let k=0;k<7;k++)box(g,'#7FB8E8',.33,.22,.05,0,.0,-.5+k*.15,false);
    box(g,'#1B3560',.06,.06,.9,0,.02,1.2);
    box(g,'#1E3A8A',.04,.5,.85,0,.4,.05); box(g,'#3A64C8',.045,.12,.85,0,.6,.05,false);
    const t1=box(g,'#1B3560',.04,.7,.12,0,.28,-.92);t1.rotation.x=-.7;const t2=box(g,'#1B3560',.04,.7,.12,0,-.28,-.92);t2.rotation.x=.7;
    box(g,'#151515',.34,.07,.07,0,.06,.64,false);
  },
};
