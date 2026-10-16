// Schwarzer Marlin: fast schwarzer Rücken, steife Brustflossen, die seitlich abstehen.
export default {
  id: 'schwarzermarlin',
  label: 'Schwarzer Marlin', plural: 'Schwarze Marline',
  length: [1.6, 4.5], // Meter, zufällig beim Fang
  habitat: ['meer'],
  taler: 12, // so viele Taler gibt der Markt für einen Fisch
  spawn: { meer: .01 }, // Häufigkeit je Gewässer, sehr selten
  speed: 1.6, jumps: true,
  scale: { shadow: 2.5, underwater: .95, aquarium: .23, rod: .78, jump: 1.1 },
  wow: true,
  model({ g, body, box }) {
    body('#2B2F36',.36,.42,1.6,0,0); body('#C9CED6',.3,.2,1.4,-.14,0);
    box(g,'#1C1F24',.06,.06,.9,0,.02,1.2);
    box(g,'#1C1F24',.04,.34,.7,0,.36,.1);
    for(const x of[-1,1]){const f=box(g,'#1C1F24',.5,.04,.2,x*.36,-.1,.3);f.rotation.z=x*-.15;}
    const t1=box(g,'#1C1F24',.04,.72,.12,0,.29,-.92);t1.rotation.x=-.7;const t2=box(g,'#1C1F24',.04,.72,.12,0,-.29,-.92);t2.rotation.x=.7;
    box(g,'#151515',.38,.07,.07,0,.06,.64,false);
  },
};
