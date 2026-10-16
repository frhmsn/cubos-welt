// Kalmar: ein Tintenfisch mit langem Körper, zwei Flossen und vielen Fangarmen.
export default {
  id: 'kalmar',
  label: 'Kalmar', plural: 'Kalmare',
  length: [.3, 1.2], // Meter, zufällig beim Fang
  habitat: ['meer'],
  taler: 4, // so viele Taler gibt der Markt für einen Fisch
  spawn: { meer: .04 }, // Häufigkeit je Gewässer
  speed: 1.1, jumps: false,
  scale: { shadow: .8, underwater: 1.5, aquarium: .5, rod: 1.3, jump: 1.1 },
  model({ g, body, box }) {
    body('#E58A7A',.3,.3,1.1,.02,.25); body('#F2B3A6',.26,.22,.6,-.04,-.1);
    for (const x of [-1, 1]) { const f = box(g,'#D9705F',.32,.03,.28,x*.18,.02,.65); f.rotation.y = x * .5; }
    for (const x of [-1, 1]) box(g,'#151515',.05,.09,.09,x*.13,.04,-.18,false);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, t = box(g,'#E07D6C',.04,.04,.55,Math.cos(a)*.08,Math.sin(a)*.08,-.6); t.rotation.set(Math.sin(a)*.25,Math.cos(a)*.25,0); }
    for (const x of [-1, 1]) { const t = box(g,'#E07D6C',.035,.035,.95,x*.05,0,-.8); t.rotation.y = x * .08; }
  },
};
