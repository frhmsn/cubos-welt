// Stör. Werte siehe content/fish/README.md.
export default {
  id: 'stoer',
  label: 'Stör', plural: 'Störe',
  length: [.8, 2.5], // Meter, zufällig beim Fang
  habitat: ['see'], // lebt im Fluss und laicht dort
  taler: 8, // so viele Taler gibt der Markt für einen Fisch
  spawn: { see: .1 }, // Häufigkeit je Gewässer
  speed: .6, jumps: false,
  scale: { shadow: 1.7, underwater: 1.2, aquarium: .28, rod: .9, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#6E6A60',.3,.3,1.7,0,0); body('#D8D2C4',.26,.16,1.5,-.08,0);
    box(g,'#6E6A60',.14,.1,.4,0,-.04,.95);
    for(let k=0;k<6;k++){const z=-.55+k*.22;box(g,'#EDE6D6',.06,.06,.08,0,.16,z,false);for(const x of[-.15,.15])box(g,'#EDE6D6',.05,.05,.07,x,.04,z,false);}
    const t1=box(g,'#6E6A60',.04,.5,.14,0,.18,-.95);t1.rotation.x=-.7;const t2=box(g,'#6E6A60',.04,.22,.12,0,-.08,-.9);t2.rotation.x=.5;
    for(const x of[-.04,.04]){const b=box(g,'#EDE6D6',.02,.02,.1,x,-.1,.95,false);b.rotation.x=.9;}
    box(g,'#151515',.32,.05,.05,0,.05,.66,false);
  },
};
