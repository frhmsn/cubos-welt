// Gestreifter Marlin: kräftige helle Streifen und eine hohe, spitze Rückenflosse.
export default {
  id: 'gestreiftermarlin',
  label: 'Gestreifter Marlin', plural: 'Gestreifte Marline',
  length: [1.4, 3.5], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .01 }, // Häufigkeit je Gewässer, sehr selten
  speed: 1.8, jumps: true,
  scale: { shadow: 2.2, underwater: 1, aquarium: .25, rod: .82, jump: 1.1 },
  wow: true,
  model({ g, body, box }) {
    body('#3F7FB8',.3,.36,1.55,0,0); body('#F2F5F8',.26,.18,1.35,-.12,0);
    for(let k=0;k<6;k++)box(g,'#D2C2FF',.31,.3,.08,0,.03,-.55+k*.2,false);
    box(g,'#21456E',.06,.06,.9,0,.02,1.18);
    const d=box(g,'#6A4FC8',.04,.95,.45,0,.6,.32);d.rotation.x=.3;
    box(g,'#2A63B8',.04,.2,.8,0,.3,-.25);
    const t1=box(g,'#21456E',.04,.7,.12,0,.28,-.9);t1.rotation.x=-.7;const t2=box(g,'#21456E',.04,.7,.12,0,-.28,-.9);t2.rotation.x=.7;
    box(g,'#151515',.32,.07,.07,0,.06,.62,false);
  },
};
